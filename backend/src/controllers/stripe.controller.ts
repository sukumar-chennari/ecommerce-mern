import type { Request, Response } from "express";
import { z } from "zod";
import Stripe from "stripe";
import Order from "../models/Order.model";
import dotenv from "dotenv";
import { ApiResponse } from "../utils/response.util";
import mongoose from "mongoose";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

// Create Checkout session (frontend will redirect to session.url)
export const createCheckoutSession = async (req: Request, res: Response) => {

  try {
    const userId = (req as any).userId;


    const createCheckoutSessionSchema = z.object({
      orderId: z.string().min(1, "Order ID is required"),
    });

    const parsed = createCheckoutSessionSchema.safeParse(req.body);

    if (!parsed.success) {
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }

    const { orderId } = parsed.data;
    if (!mongoose.isValidObjectId(orderId)) {
      return ApiResponse.error(res, "Invalid orderId", null, 400);
    }
    const order = await Order.findById(orderId).lean();

    if (!order) {
      return ApiResponse.error(res, "Order not found", null, 404);
    }

    if (order.userId.toString() !== userId) {
      return ApiResponse.error(res, "Unauthorized", null, 403);
    }

    if (order.items.length === 0 || order.total === undefined || order.status !== "pending" || order.total <= 0) {
      return ApiResponse.error(res, "Invalid order state", null, 400);
    }
    // build line items from order snapshot (amounts in cents)
    const line_items = order.items.map(item => ({
      price_data: {
        currency: "inr", // change to your currency
        product_data: {
          name: item.name,
          metadata: {
            productId: item.productId.toString(),
            orderId: order._id.toString(),
            userId: userId.toString()
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const shippingItem = {
      price_data: {
        currency: "inr",
        product_data: {
          name: "Shipping",
          metadata: { orderId: order._id.toString() }
        },
        unit_amount: Math.round(order.shipping * 100),
      },
      quantity: 1,
    };

    const taxItem = {
      price_data: {
        currency: "inr",
        product_data: {
          name: "Tax",
          metadata: { orderId: order._id.toString() }
        },
        unit_amount: Math.round(order.tax * 100),
      },
      quantity: 1,
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [...line_items, shippingItem, taxItem],
      // ✅ ADD THIS
      expand: ["payment_intent"],

      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString()
      }, // critical: used by webhook
    },
      {
        idempotencyKey: order._id.toString(),
      });

    return ApiResponse.success(res, "Checkout session created", { url: session.url, id: session.id });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};

// controllers/stripe.controller.ts

export const verifyCheckoutSession = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id as string;
    const userId = (req as any).userId;


    if (!sessionId) {
      return ApiResponse.error(res, "Missing session_id");
    }

    // 🔥 ALWAYS fetch from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return ApiResponse.error(res, "Session not found");
    }

    // 🔥 Check payment
    if (session.payment_status !== "paid") {
      return ApiResponse.error(res, "Payment not completed");
    }

    const metadata = session.metadata;

    const order = await Order.findById(metadata?.orderId);
    if (order?.status !== "paid") {
      return ApiResponse.success(res, "Waiting for webhook", {
        success: false,
        orderId: order?._id,
      });
    }


    console.log("metadata", metadata);
    if (!metadata?.orderId || !metadata?.userId) {
      return ApiResponse.error(res, "Invalid session metadata");
    }


    // 🔥 CRITICAL CHECK
    if (metadata.userId !== userId) {
      return ApiResponse.error(res, "Unauthorized access", null, 403);
    }

    return ApiResponse.success(res, "Payment verified", {
      orderId: metadata.orderId,
      success: true,
    });

  } catch (err) {
    console.error(err);
    return ApiResponse.error(res, "Verification failed");
  }
};