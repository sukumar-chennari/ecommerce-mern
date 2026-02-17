import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Cart from "../models/Cart.model";
import Product from "../models/Product.model";

// typed request that includes userId from auth middleware
interface AuthRequest extends Request {
  userId?: string;
}

/**
 * GET /api/cart
 * Returns cart with populated product details
 */
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const cart = await Cart.findOne({ userId })
      .populate<{ items: any[] }>({
        path: "items.productId",
        select: "name price stock images slug",
      })
      .lean();

    // If no cart return empty
    if (!cart) {
      return res.json({ items: [], subtotal: 0 });
    }

    // compute subtotal on server side
    let subtotal = 0;
    const items = cart.items.map((item: any) => {
      const product = item.productId;
      const price = product?.price ?? 0;
      const qty = item.quantity ?? 0;
      subtotal += price * qty;
      return { product, quantity: qty };
    });

    return res.json({ items, subtotal });
  } catch (err) {
    console.error("getCart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/cart
 * Body: { productId, quantity }
 * Adds product to cart or increases quantity if exists. Validates stock.
 */
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);

    const addToCartSchema = z.object({
      productId: z.string(),
      quantity: z.number().int().positive().optional().default(1),
    });

    const parsed = addToCartSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const { productId, quantity } = parsed.data;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }
    const qty = Math.max(1, Number(quantity));

    // verify product & stock
    const product = await Product.findById(productId).select("stock price name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < qty) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // find existing item
    const existing = cart.items.find((i) => i.productId.equals(product._id));
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} items in stock` });
      }
      existing.quantity = newQty;
    } else {
      cart.items.push({ productId: product._id, quantity: qty });
    }

    await cart.save();
    return res.status(200).json({ message: "Cart updated", cart });
  } catch (err) {
    console.error("addToCart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/cart/:productId
 * Body: { quantity }
 * Sets quantity for an item (if quantity <= 0 item removed)
 */
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { productId } = req.params;

    const updateCartSchema = z.object({
      quantity: z.number().int(),
    });

    const parsed = updateCartSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }
    const { quantity } = parsed.data;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }
    const qty = Number(quantity);
    if (Number.isNaN(qty)) return res.status(400).json({ message: "Invalid quantity" });

    const product = await Product.findById(productId).select("stock");
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (qty > product.stock) return res.status(400).json({ message: "Insufficient stock" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex((i) => i.productId.equals(product._id));
    if (itemIndex === -1) return res.status(404).json({ message: "Item not in cart" });

    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (cart.items[itemIndex]) {
        cart.items[itemIndex].quantity = qty;
      }
    }

    await cart.save();
    return res.json({ message: "Cart updated", cart });
  } catch (err) {
    console.error("updateCartItem error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/cart/:productId
 * Remove single item
 */
export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => !i.productId.equals(productId));
    await cart.save();
    return res.json({ message: "Item removed", cart });
  } catch (err) {
    console.error("removeCartItem error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/cart
 * Clear entire cart
 */
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    await Cart.findOneAndDelete({ userId });
    return res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("clearCart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};