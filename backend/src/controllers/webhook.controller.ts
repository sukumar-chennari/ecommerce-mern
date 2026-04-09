import type { Request, Response } from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";
import { z } from "zod";

import Order from "../models/Order.model";
import Product from "../models/Product.model";
import WebhookEvent from "../models/WebhookEvent.model";
import User from "../models/User.model";
import NotificationModel from "../models/Notification.model";
import { sendEmail } from "../services/email.service";
import { io } from "../server";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  if (!sig) {
    return res.status(400).send("Missing Stripe signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("🔥 WEBHOOK HIT:", event.type);

  if (event.type !== "checkout.session.completed") {
    return res.status(200).send();
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const eventId = event.id;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) {
    console.error("Missing payment intent");
    return res.status(200).send();
  }

  // Prevent duplicate webhook processing
  const existing = await WebhookEvent.findOne({ eventId }).lean();
  if (existing) {
    console.log("Duplicate webhook event:", eventId);
    return res.status(200).send();
  }

  const orderId = session.metadata?.orderId;

  if (!orderId) {
    await WebhookEvent.create({
      eventId,
      processedAt: new Date(),
      raw: event,
      error: "Missing orderId metadata",
    });
    return res.status(200).send();
  }

  const parsed = z.string().regex(/^[0-9a-fA-F]{24}$/).safeParse(orderId);
  if (!parsed.success) {
    await WebhookEvent.create({
      eventId,
      processedAt: new Date(),
      raw: event,
      error: "Invalid orderId format",
    });
    return res.status(200).send();
  }

  const mongoSession = await mongoose.startSession();

  let userEmail: string | undefined;

  try {
    await mongoSession.withTransaction(async () => {
      const order = await Order.findById(orderId).session(mongoSession);

      if (!order) throw new Error("Order not found");

      if (session.payment_status !== "paid") return;

      // Idempotency: already processed
      if (order.status === "paid") {
        await WebhookEvent.create(
          [{ eventId, processedAt: new Date(), raw: event }],
          { session: mongoSession }
        );
        return;
      }

      // Validate amount
      if (session.amount_total !== order.total * 100) {
        throw new Error("Payment amount mismatch");
      }

      // Update stock
      for (const item of order.items) {
        const product = await Product.findById(item.productId).session(
          mongoSession
        );

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock`);
        }

        product.stock -= item.quantity;
        await product.save({ session: mongoSession });
      }

      // Update order
      order.status = "paid";
      order.payment = {
        method: "stripe",
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date(),
      };

      if (!order.statusTimeline) {
        order.statusTimeline = {};
      }

      order.statusTimeline.paidAt = new Date();

      await order.save({ session: mongoSession });

      const user = await User.findById(order.userId).session(mongoSession);
      userEmail = user?.email;

      await WebhookEvent.create(
        [{ eventId, processedAt: new Date(), raw: event }],
        { session: mongoSession }
      );
    });

    // ===== AFTER TRANSACTION =====

    const orderDoc = await Order.findById(orderId);

    // ✅ User email (idempotent)
    if (userEmail && !orderDoc?.emailSent) {
      sendEmail(
        userEmail,
        "Order Confirmed 🎉",
        `<h2>Order Confirmed</h2>
         <p>Order ID: ${orderId}</p>
         <p>Total: ₹${orderDoc?.total}</p>`
      )
        .then(() => {
          return Order.findByIdAndUpdate(orderId, { emailSent: true });
        })
        .catch((err) => console.error("User email failed:", err));
    }

    // ✅ Admin emails (non-blocking)
    const admins = await User.find({ role: "admin" }).select("email");

    admins.forEach((admin) => {
      sendEmail(
        admin.email,
        "🛒 New Order Paid",
        `<p>Order ${orderId} paid</p>`
      ).catch((err) => console.error("Admin email failed:", err));
    });

    // ✅ Notifications (DB)
    await NotificationModel.create({
      userId: session.metadata?.userId,
      type: "order_paid",
      title: "Payment Successful",
      message: `Order ${orderId} confirmed`,
    });

    for (const admin of admins) {
      await NotificationModel.create({
        userId: admin._id,
        type: "order_paid",
        title: "New Order Paid",
        message: `Order ${orderId} was paid`,
      });
    }

    const targetUserId = session.metadata?.userId;
    console.log("📤 EMIT new_notification to userId:", targetUserId);
    console.log("📊 Connected sockets:", await io.fetchSockets().then(s => s.length));
    
    if (targetUserId) {
      const roomSockets = await io.in(targetUserId).fetchSockets();
      console.log(`📊 Sockets in room ${targetUserId}:`, roomSockets.length);
      
      io.to(targetUserId).emit("new_notification", {
        title: "Order Confirmed! 🎉",
        message: `Payment successful for Order #${orderId.toString().slice(-6)}`,
      });
      console.log("✅ Emit sent to room:", targetUserId);
    } else {
      console.error("❌ No userId in session metadata, cannot emit!");
    }

    return res.status(200).send();
  } catch (err: any) {
    console.error("Webhook failed:", err.message);

    await WebhookEvent.create({
      eventId,
      processedAt: new Date(),
      raw: event,
      error: err.message,
    });

    return res.status(200).send();
  } finally {
    mongoSession.endSession();
  }
};