import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Cart from "../models/Cart.model";
import Product from "../models/Product.model";
import Order from "../models/Order.model";
import Stripe from "stripe";
import Review from "../models/Review.model";

interface AuthRequest extends Request {
  userId?: string;
}


if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-12-15.clover" });

/**
 * Create an order from the current user's cart.
 * - Validates stock for each item
 * - Snapshot product name/price/image into order items
 * - Calculates subtotal/tax/shipping/total
 * - Creates order with status "pending"
 * - Clears user's cart
 */
export const createOrderFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Load cart
    const cart = await Cart.findOne({ userId }).lean();
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate each product exists and has stock
    // We'll build orderItems array with snapshots
    const orderItems: any[] = [];
    for (const ci of cart.items) {
      const product = await Product.findById(ci.productId).select(
        "name price stock images"
      );
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${ci.productId} not found` });
      }
      if (product.stock < ci.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${ci.quantity}`,
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: ci.quantity,
        image: (product.images && product.images[0]) || null,
      });
    }

    // Calculate totals
    const subtotal = orderItems.reduce(
      (s, it) => s + it.price * it.quantity,
      0
    );
    // For demo: simple flat shipping rule and tax rate
    const shipping = subtotal >= 1000 ? 0 : 50; // free shipping over 1000
    const taxRate = 0.12; // 12% GST-style placeholder
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + shipping + tax;

    // Validate shipping address if present
    const shippingAddressSchema = z.object({
      name: z.string().optional(),
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional();

    const parsed = shippingAddressSchema.safeParse(req.body.shippingAddress);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid shipping address",
        errors: parsed.error.flatten(),
      });
    }

    const shippingAddress = parsed.data || undefined;

    // Create order document (status pending)
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      status: "pending",
      shippingAddress,
      statusTimeline: {
        orderedAt: new Date(),
      },
      deliveryEstimate: "3–5 business days",
    });

    // Clear the cart (we delete the cart document to avoid leftover state)
    await Cart.findOneAndDelete({ userId });

    return res.status(201).json({ message: "Order created", order });
  } catch (err) {
    console.error("createOrderFromCart error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};

/**
 * Get orders for current user (paginated)
 */
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [total, orders] = await Promise.all([
      Order.countDocuments({ userId }),
      Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.json({
      orders,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin: list all orders (paginated + filter by status)
 */
export const adminListOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const filter: any = {};
    if (status) filter.status = status;

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);

    return res.json({
      orders,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("adminListOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get single order (user can access their own order; admin can access any)
 */

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    console.log(' get by order id', id);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    const userId = req.userId;
    const isAdmin = (req as any).isAdmin;

    if (!isAdmin && order.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const progress = {
      ordered: !!order.statusTimeline?.orderedAt,
      paid: !!order.statusTimeline?.paidAt,
      shipped: !!order.statusTimeline?.shippedAt,
      delivered: !!order.statusTimeline?.deliveredAt,
    };

    let reviewEligibility: Record<string, boolean> = {};

    if (order.status == "delivered" && userId) {
      const reviews = await Review.find({
        userId,
        productId: { $in: order.items.map(i => i.productId) },
      }).lean();

      const reviewedProductIds = new Set(
        reviews.map(r => r.productId.toString())
      );

      for (const item of order.items) {
        reviewEligibility[item.productId.toString()] =
          !reviewedProductIds.has(item.productId.toString());
      }
    }

    return res.json({
      order,
      progress,
      estimatedDelivery: order.deliveryEstimate,
      reviewEligibility,
    });
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// export const getOrderById = async (req: AuthRequest, res: Response) => {
//   try {
//     const id = req.params.id;
//     if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid order id" });

//     const order = await Order.findById(id).lean();
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // If user (non-admin) ensure ownership
//     // If req.userId exists and is not admin, check ownership
//     // We'll do a simple ownership check: if req.userId present and not admin, verify equality.
//     // Assume req has userId; admin check should be enforced by middleware on route.
//     if ((req as any).userId) {
//       // if caller is user, ensure owner else admin route should have required admin middleware
//       const userId = (req as any).userId;
//       // allow if admin middleware is applied; otherwise check
//       if (order.userId.toString() !== userId && !(req as any).isAdmin) {
//         return res.status(403).json({ message: "Forbidden" });
//       }
//     }

//     return res.json({ order });
//   } catch (err) {
//     console.error("getOrderById error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };



export const getOrderByStripeSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ message: "Missing sessionId" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId;

    if (!orderId) return res.status(400).json({ message: "Order not found in session metadata" });

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.json({ order });

  } catch (err) {
    console.error("getOrderByStripeSession error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

