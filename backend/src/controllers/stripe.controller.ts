import type { Request, Response } from "express";
import { z } from "zod";
import Stripe from "stripe";
import Order from "../models/Order.model";
import dotenv from "dotenv";
import { ApiResponse } from "../utils/response.util";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

// Create Checkout session (frontend will redirect to session.url)
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const createCheckoutSessionSchema = z.object({
      orderId: z.string().min(1, "Order ID is required"),
    });

    const parsed = createCheckoutSessionSchema.safeParse(req.body);

    if (!parsed.success) {
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }

    const { orderId } = parsed.data;
    if (!orderId) return ApiResponse.error(res, "Missing orderId", null, 400);

    const order = await Order.findById(orderId).lean();
    if (!order) return ApiResponse.error(res, "Order not found", null, 404);
    if (order.total === undefined) return ApiResponse.error(res, "Order total missing", null, 400);
    if (order.status !== "pending") return ApiResponse.error(res, "Order is not pending", null, 400);

    // build line items from order snapshot (amounts in cents)
    const line_items = order.items.map(item => ({
      price_data: {
        currency: "inr", // change to your currency
        product_data: { name: item.name, metadata: { productId: item.productId.toString() } },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      metadata: { orderId: order._id.toString() }, // critical: used by webhook
    });

    return ApiResponse.success(res, "Checkout session created", { url: session.url, id: session.id });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};