import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.model";
import Product from "../models/Product.model";
import WebhookEvent from "../models/WebhookEvent.model";
import { ApiResponse } from "../utils/response.util";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;
  if (!sig) {
    return res.status(400).send("Missing signature")
  }

  try {
    // req.body must be the raw body (Buffer). We'll attach route-level raw middleware.
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig as string, webhookSecret);
    if (event.type !== "checkout.session.completed") {
      return res.status(200).send();
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message || err);
    return ApiResponse.error(res, `Webhook Error: ${err?.message || err}`, null, 400);
  }

  const eventId = event.id;
  const eventType = event.type;

  // Idempotency: if already processed, ack and return
  const existing = await WebhookEvent.findOne({ eventId }).lean();
  if (existing) {
    console.log("Duplicate event, ignoring:", eventId);
    return ApiResponse.success(res, "Duplicate event, ignored");
  }

  // We're interested in checkout.session.completed or payment_intent.succeeded
  if (eventType === "checkout.session.completed" || eventType === "payment_intent.succeeded") {
    // Derive orderId from metadata
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    stripePaymentIntentId: session.payment_intent as string | null;
    // Validate orderId is present and looks like a Mongo ID
    const metadataSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Order ID");

    const parsed = metadataSchema.safeParse(orderId);
    if (!parsed.success) {
      // record event and ack (we won't retry endlessly)
      await WebhookEvent.create({ eventId, processedAt: new Date(), raw: event, error: "Missing or invalid orderId in metadata" });
      return ApiResponse.error(res, "Missing or invalid orderId in metadata", null, 400);
    }

    // const validOrderId = parsed.data; // we can use orderId directly since it's validated strings

    const mongoSession = await mongoose.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        // Re-load order inside transaction
        const order = await Order.findById(orderId).session(mongoSession);

        if (!order) throw new Error("Order not found");
        if (session.amount_total !== order.total! * 100) {
          throw new Error("Invalid order total");
        }
        if (!session.amount_total) {
          throw new Error("Missing amount_total");
        }
        if (session.currency !== "inr") {
          throw new Error("Invalid currency");
        }
        if (session.payment_status !== "paid") {
          return
        }
        // Idempotency guard: if order already paid, skip
        if (order.status === "paid") {
          // still record webhook event within transaction
          await WebhookEvent.create([{ eventId, processedAt: new Date(), raw: event }], { session: mongoSession });
          return;
        }

        // Validate stock and decrement
        for (const item of order.items) {
          const product = await Product.findById(item.productId).session(mongoSession);
          if (!product) throw new Error(`Product ${item.productId} not found`);
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${product._id}`);
          }
          product.stock -= item.quantity;
          await product.save({ session: mongoSession });
        }

        // Update order as paid and attach payment metadata
        order.status = "paid";
        if (!order.statusTimeline) {
          order.statusTimeline = {};
        }
        order.statusTimeline.paidAt = new Date();
        order.payment = {
          method: "stripe",
          stripePaymentIntentId: session.payment_intent as string | null,
          paidAt: new Date(),
          raw: {
            id: event.id,
            type: event.type,
            data: event.data.object,
            created: event.created

          },
        };
        await order.save({ session: mongoSession });

        // Persist webhook event (prevent duplicates)
        await WebhookEvent.create([{ eventId, processedAt: new Date(), raw: event }], { session: mongoSession });
      }); // withTransaction

      // success
      return res.status(200).send();
    } catch (txErr: any) {
      console.error("Transaction failed:", txErr);
      // Record the failure so ops can investigate
      try {
        await WebhookEvent.create({ eventId, processedAt: new Date(), raw: event, error: txErr.message });
      } catch (e) {
        console.error("Failed to record webhook event after tx failure:", e);
      }

      // Decide how to respond:
      // - If you return 500, Stripe will retry webhook delivery.
      // - If you return 200, Stripe will not retry.
      //
      // Best for demo: return 200 so webhook retries do not cause duplicate refunds.
      // Production: you may return 500 to allow retries after transient problems.
      return ApiResponse.success(res, "Transaction failed but acknowledged (to prevent endless retry)", { error: txErr.message }); // acknowledging but logged failure
    } finally {
      mongoSession.endSession();
    }
  }

  // For other event types, record and ack
  await WebhookEvent.create({ eventId, processedAt: new Date(), raw: event });
  return ApiResponse.success(res, "Webhook processed");
};