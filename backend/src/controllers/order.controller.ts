import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Cart from "../models/Cart.model";
import Product from "../models/Product.model";
import Order from "../models/Order.model";
import Stripe from "stripe";
import Review from "../models/Review.model";
import { ApiResponse } from "../utils/response.util";
import type { IOrder } from "../models/Order.model";


interface AuthRequest extends Request {
  userId?: string;
}



interface OrderItemInput {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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
  const session = await mongoose.startSession();

  let createdOrder: IOrder | null = null;

  try {
    const userId = req.userId;
    if (!userId) {
      return ApiResponse.error(res, "Unauthorized", null, 401);
    }

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ userId }).session(session);

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      const orderItems: OrderItemInput[] = [];

      for (const ci of cart.items) {
        const product = await Product.findById(ci.productId).session(session);

        if (!product) {
          throw new Error(`Product not found`);
        }

        if (product.stock < ci.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        // 🔥 RESERVE STOCK
        product.stock -= ci.quantity;
        await product.save({ session });

        orderItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: ci.quantity,
          image: product.images?.[0],
        });
      }

      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const shipping = subtotal >= 1000 ? 0 : 50;
      const tax = Math.round(subtotal * 0.12);
      const total = subtotal + shipping + tax;

      const shippingAddressSchema = z.object({
        name: z.string().min(1),
        addressLine1: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().min(1),
      });

      const parsed = shippingAddressSchema.safeParse(
        req.body.shippingAddress
      );

      if (!parsed.success) {
        throw new Error("Invalid shipping address");
      }

      const estimate = new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      );

      // ✅ CREATE ORDER
      const order = new Order({
        userId,
        items: orderItems,
        subtotal,
        shipping,
        tax,
        total,
        status: "pending",
        paymentStatus: "pending",
        reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        shippingAddress: parsed.data,
        statusTimeline: {
          orderedAt: new Date(),
        },
        deliveryEstimate: estimate,
      });

      await order.save({ session });

      createdOrder = order;

      // ✅ CLEAR CART
      await Cart.findOneAndDelete({ userId }).session(session);
    });

    // ✅ SAFETY CHECK
    if (!createdOrder) {
      return ApiResponse.error(res, "Order creation failed");
    }

    // 👇 FORCE TYPE NARROWING
    const orderDoc = createdOrder as IOrder;

    return ApiResponse.success(
      res,
      "Order created",
      {
        orderId: orderDoc._id.toString(),
      },
      201
    );
  } catch (err: any) {
    console.error("createOrderFromCart error:", err);
    return ApiResponse.error(res, err.message || "Server error");
  } finally {
    session.endSession();
  }
};

/**
 * Get orders for current user (paginated)
 */
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return ApiResponse.error(res, "Unauthorized", null, 401);

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

    return ApiResponse.success(res, "Orders retrieved successfully", {
      orders,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getMyOrders error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};



export const retryPayment = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const userId = (req as any).userId;

  const order = await Order.findById(orderId);

  if (!order) return ApiResponse.error(res, "Order not found");

  if (order.userId.toString() !== userId) {
    return ApiResponse.error(res, "Unauthorized", null, 403);
  }

  if (order.paymentStatus !== "failed") {
    return ApiResponse.error(res, "Only failed payments can be retried");
  }

  order.retryCount += 1;
  order.lastPaymentAttemptAt = new Date();

  await order.save();

  // reuse your existing createCheckoutSession logic
  // IMPORTANT: DO NOT create new order

  const session = await stripe.checkout.sessions.create({
    // same config
    metadata: {
      orderId: order._id.toString(),
      userId: userId.toString(),
    },
  });

  return ApiResponse.success(res, "Retry session created", {
    url: session.url,
  });
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

    return ApiResponse.success(res, "Orders retrieved successfully", {
      orders,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("adminListOrders error:", err);
    return ApiResponse.error(res, "Server error", err);
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
      return ApiResponse.error(res, "Invalid order ID", null, 400);
    }

    const order = await Order.findById(id).lean();
    if (!order) return ApiResponse.error(res, "Order not found", null, 404);

    const userId = req.userId;
    const isAdmin = (req as any).isAdmin ?? false;

    if (!isAdmin && order.userId.toString() !== userId) {
      return ApiResponse.error(res, "Not authorized", null, 403);
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

    return ApiResponse.success(res, "Order retrieved successfully", {
      order,
      progress,
      estimatedDelivery: order.deliveryEstimate,
      reviewEligibility,
    });
  } catch (err) {
    console.error("getOrderById error:", err);
    return ApiResponse.error(res, "Server error", err);
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
    if (!sessionId) return ApiResponse.error(res, "Missing sessionId", null, 400);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId;

    if (!orderId) return ApiResponse.error(res, "Order not found in session metadata", null, 400);

    const order = await Order.findById(orderId).lean();
    if (!order) return ApiResponse.error(res, "Order not found", null, 404);
    if (order.userId.toString() !== req.userId) {
      return ApiResponse.error(res, "Unauthorized", null, 403);
    }

    return ApiResponse.success(res, "Order retrieved successfully", { order });

  } catch (err) {
    console.error("getOrderByStripeSession error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};

