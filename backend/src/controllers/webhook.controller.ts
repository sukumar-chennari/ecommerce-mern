import  type { Request, Response } from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.model.ts";
import Product from "../models/Product.model.ts";
import WebhookEvent from "../models/WebhookEvent.model.ts";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-11-17.clover",
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;
  try {
    // req.body must be the raw body (Buffer). We'll attach route-level raw middleware.
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig as string, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || err}`);
  }

  const eventId = event.id;
  const eventType = event.type;

  // Idempotency: if already processed, ack and return
  const existing = await WebhookEvent.findOne({ eventId }).lean();
  if (existing) {
    console.log("Duplicate event, ignoring:", eventId);
    return res.status(200).send();
  }

  // We're interested in checkout.session.completed or payment_intent.succeeded
  if (eventType === "checkout.session.completed" || eventType === "payment_intent.succeeded") {
    // Derive orderId from metadata
    const session = eventType === "checkout.session.completed" ? (event.data.object as Stripe.Checkout.Session) : null;
    const paymentIntent = eventType === "payment_intent.succeeded" ? (event.data.object as Stripe.PaymentIntent) : null;

    const orderId = session?.metadata?.orderId || paymentIntent?.metadata?.orderId;
    if (!orderId) {
      // record event and ack (we won't retry endlessly)
      await WebhookEvent.create({ eventId, processedAt: new Date(), raw: event, error: "Missing orderId in metadata" });
      return res.status(400).send("Missing orderId in metadata");
    }

    const mongoSession = await mongoose.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        // Re-load order inside transaction
        const order = await Order.findById(orderId).session(mongoSession);
        if (!order) throw new Error("Order not found");

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
          stripePaymentIntentId: paymentIntent ? paymentIntent.id : (session?.payment_intent as string | undefined) || null,
          paidAt: new Date(),
          raw: event,
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
      return res.status(200).send(); // acknowledging but logged failure
    } finally {
      mongoSession.endSession();
    }
  }

  // For other event types, record and ack
  await WebhookEvent.create({ eventId, processedAt: new Date(), raw: event });
  return res.status(200).send();
};