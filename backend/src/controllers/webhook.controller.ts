import type { Request, Response } from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";
import { z } from "zod";

import Order from "../models/Order.model";
import WebhookEvent from "../models/WebhookEvent.model";
import User from "../models/User.model";
import NotificationModel from "../models/Notification.model";
import { sendEmail } from "../services/email.service";
import { io } from "../server";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-02-25.clover",
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  if (!sig) return res.status(400).send("Missing Stripe signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error("Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const eventId = event.id;

  // 🔐 GLOBAL IDEMPOTENCY CHECK
  const existingEvent = await WebhookEvent.findOne({ eventId });
  if (existingEvent) {
    console.log("⚠️ Duplicate event:", eventId);
    return res.status(200).send();
  }

  console.log("🔥 WEBHOOK:", event.type);

  // ===============================
  // ❌ HANDLE FAILURE EVENTS
  // ===============================

  if (
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "payment_intent.payment_failed"
  ) {
    try {
      let order;

      if (event.type === "checkout.session.async_payment_failed") {
        const session = event.data.object as Stripe.Checkout.Session;
        order = await Order.findById(session.metadata?.orderId);
      } else {
        const pi = event.data.object as Stripe.PaymentIntent;
        order = await Order.findOne({
          "payment.stripePaymentIntentId": pi.id,
        });
      }

      if (order && order.paymentStatus !== "failed") {
        order.paymentStatus = "failed";
        order.status = "pending";
        order.retryCount += 1;
        order.lastPaymentAttemptAt = new Date();
        await order.save();
      }

      await WebhookEvent.create({
        eventId,
        processedAt: new Date(),
        raw: event,
      });

      return res.status(200).send();
    } catch (err) {
      return res.status(500).send();
    }
  }

  // ===============================
  // ✅ HANDLE SUCCESS EVENT
  // ===============================

  if (event.type !== "checkout.session.completed") {
    return res.status(200).send();
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const orderId = session.metadata?.orderId;

  if (!orderId) {
    await WebhookEvent.create({
      eventId,
      processedAt: new Date(),
      raw: event,
      error: "Missing orderId",
    });
    return res.status(200).send();
  }

  const parsed = z.string().regex(/^[0-9a-fA-F]{24}$/).safeParse(orderId);
  if (!parsed.success) {
    await WebhookEvent.create({
      eventId,
      processedAt: new Date(),
      raw: event,
      error: "Invalid orderId",
    });
    return res.status(200).send();
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) return res.status(200).send();

  const mongoSession = await mongoose.startSession();

  let isNewPayment = false;
  let userEmail: string | undefined;
  let userId: string | undefined;

  try {
    await mongoSession.withTransaction(async () => {
      const order = await Order.findById(orderId).session(mongoSession);
      if (!order) throw new Error("Order not found");

      // 🔥 LATE PAYMENT GUARD
      if (order.status === "failed") {
        console.log("⚠️ Late payment → refund/manual review:", orderId);

        await WebhookEvent.create(
          [{ eventId, processedAt: new Date(), raw: event }],
          { session: mongoSession }
        );
        return;
      }

      if (order.paymentStatus === "paid") {
        await WebhookEvent.create(
          [{ eventId, processedAt: new Date(), raw: event }],
          { session: mongoSession }
        );
        return;
      }

      if (session.payment_status !== "paid") return;

      if (session.amount_total !== order.total * 100) {
        throw new Error("Amount mismatch");
      }

      // ✅ MARK PAID
      order.paymentStatus = "paid";
      order.status = "paid";
      order.payment = {
        method: "stripe",
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date(),
      };

      order.statusTimeline = {
        ...order.statusTimeline,
        paidAt: new Date(),
      };

      await order.save({ session: mongoSession });

      const user = await User.findById(order.userId).session(mongoSession);

      userEmail = user?.email;
      userId = order.userId.toString();

      isNewPayment = true;

      await WebhookEvent.create(
        [{ eventId, processedAt: new Date(), raw: event }],
        { session: mongoSession }
      );
    });

    // ===============================
    // SIDE EFFECTS (ONLY ONCE)
    // ===============================

    if (!isNewPayment) return res.status(200).send();

    const orderDoc = await Order.findById(orderId);

    // Email
    if (userEmail && !orderDoc?.emailSent) {
      sendEmail(
        userEmail,
        "Order Confirmed 🎉",
        `<h2>Order Confirmed</h2>
         <p>Order ID: ${orderId}</p>
         <p>Total: ₹${orderDoc?.total}</p>`
      )
        .then(() =>
          Order.findByIdAndUpdate(orderId, { emailSent: true })
        )
        .catch(console.error);
    }

    // Admins
    const admins = await User.find({ role: "admin" }).select("_id email");

    // Notifications (bulk)
    await NotificationModel.insertMany([
      {
        userId,
        type: "order_paid",
        title: "Payment Successful",
        message: `Order ${orderId} confirmed`,
      },
      ...admins.map((admin) => ({
        userId: admin._id,
        type: "order_paid",
        title: "New Order Paid",
        message: `Order ${orderId} paid`,
      })),
    ]);

    // Emails to admins
    admins.forEach((admin) => {
      sendEmail(
        admin.email,
        "🛒 New Order Paid",
        `<p>Order ${orderId} paid</p>`
      ).catch(console.error);
    });

    // Realtime
    if (userId) {
      io.to(userId).emit("new_notification", {
        title: "Order Confirmed 🎉",
        message: `Order #${orderId.toString().slice(-6)} paid`,
      });
    }

    return res.status(200).send();
  } catch (err: any) {
    console.error("Webhook error:", err.message);

    await WebhookEvent.create({
      eventId,
      processedAt: new Date(),
      raw: event,
      error: err.message,
    });

    return res.status(500).send(); // 🔥 trigger retry
  } finally {
    mongoSession.endSession();
  }
};