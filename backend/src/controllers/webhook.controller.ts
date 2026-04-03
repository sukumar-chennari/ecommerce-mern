import type { Request, Response } from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";
import { z } from "zod";

import Order from "../models/Order.model";
import Product from "../models/Product.model";
import WebhookEvent from "../models/WebhookEvent.model";
import { ApiResponse } from "../utils/response.util";
import { sendEmail } from "../services/email.service";
import User from "../models/User.model";
import NotificationModel from "../models/Notification.model";


dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  let userEmail: string | undefined;
  let emailSent: boolean = false;
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

  // Only process checkout completion
  if (event.type !== "checkout.session.completed") {
    return res.status(200).send();
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const eventId = event.id;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  console.log("paymentIntentId", paymentIntentId);

  if (!paymentIntentId) {
    console.error("Missing payment intent");
    return res.status(200).send();
  }
  // Prevent duplicate processing
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

  const orderIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);
  const parsed = orderIdSchema.safeParse(orderId);

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

  try {
    await mongoSession.withTransaction(async () => {
      const order = await Order.findById(orderId).session(mongoSession);

      if (!order) {
        throw new Error("Order not found");
      }

      if (!session.amount_total) {
        throw new Error("Missing Stripe amount_total");
      }

      if (session.currency !== "inr") {
        throw new Error("Invalid currency");
      }

      if (session.payment_status !== "paid") {
        return;
      }

      if (session.amount_total !== order.total! * 100) {
        throw new Error("Payment amount mismatch");
      }

      // Idempotency check
      if (order.status === "paid") {
        await WebhookEvent.create(
          [
            {
              eventId,
              processedAt: new Date(),
              raw: event,
            },
          ],
          { session: mongoSession }
        );

        return;
      }

      // Validate stock and decrement
      for (const item of order.items) {
        const product = await Product.findById(item.productId).session(
          mongoSession
        );

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product._id}`);
        }

        product.stock -= item.quantity;
        await product.save({ session: mongoSession });
      }

      // Mark order paid
      order.status = "paid";

      if (!order.statusTimeline) {
        order.statusTimeline = {};
      }

      order.statusTimeline.paidAt = new Date();

      order.payment = {
        method: "stripe",
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date(),
        raw: {
          id: event.id,
          type: event.type,
          created: event.created,
        },
      };


      await order.save({ session: mongoSession });

      const user = await User.findById(order.userId).session(mongoSession);
      userEmail = user?.email;


      try {
        await sendEmail(
          user?.email!,
          "Order Confirmed 🎉",
          `
      <h2>Order Confirmed</h2>
      <p>Order ID: ${order._id}</p>
      <p>Total: ₹${order.total}</p>
      <p>Status: ${order.status}</p>
    `
        );
      } catch (err) {
        console.error("Email failed:", err);
      }

      await WebhookEvent.create(
        [
          {
            eventId,
            processedAt: new Date(),
            raw: event,
          },
        ],
        { session: mongoSession }
      );
    });

    if (userEmail && !emailSent) {
      try {
        await sendEmail(
          userEmail,
          "Order Confirmed 🎉",
          `<h2>Order Confirmed</h2>
     <p>Order ID: ${orderId}</p>
     <p>Total: ₹${session.amount_total}</p>`
        )
        await Order.findByIdAndUpdate(orderId, {
          emailSent: true,
        }
        ).catch(err => console.error("Email failed:", err));
      } catch (err) {
        console.error("Email failed:", err);
      }
    }

    const admins = await User.find({ role: "admin" }).select("email");
    await Promise.all(
      admins.map(async (admin) => {
        await sendEmail(
          admin.email,
          "Order Confirmed 🎉",
          `<h2>Order Confirmed</h2>
     <p>Order ID: ${orderId}</p>
     <p>Total: ₹${session.amount_total}</p>`
        )
      })
    ).catch(err => console.error("Email failed:", err));

    await NotificationModel.create({
      userId: session.metadata?.userId,
      type: "order_paid",
      title: "Payment Successful",
      message: `Your order ${orderId} has been confirmed`,
    });



    for (const admin of admins) {
      await NotificationModel.create({
        userId: admin._id,
        type: "order_paid",
        title: "New Order Paid",
        message: `Order ${orderId} was paid`,
      });
    }
    return res.status(200).send();
  } catch (err: any) {
    console.error("Webhook transaction failed:", err.message);

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