import Stripe from "stripe";
import dotenv from "dotenv";
import { ApiResponse } from "../utils/response.util";
import mongoose from "mongoose";
import Order from "../models/Order.model";
import { Request, Response } from "express";
import User from "../models/User.model";
import { sendEmail } from "../services/email.service";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-12-15.clover",
});
export const refundOrder = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();

    try {
        const { orderId } = req.params;

        if (!mongoose.isValidObjectId(orderId)) {
            return ApiResponse.error(res, "Invalid order ID", null, 400);
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return ApiResponse.error(res, "Order not found", null, 404);
        }

        // ✅ Only paid orders can be refunded
        if (order.status !== "paid") {
            return ApiResponse.error(res, "Only paid orders can be refunded", null, 400);
        }

        if (!order.payment?.stripePaymentIntentId) {
            return ApiResponse.error(res, "Missing payment intent", null, 400);
        }

        // 🚨 STEP 1: CALL STRIPE FIRST
        const refund = await stripe.refunds.create({
            payment_intent: order.payment.stripePaymentIntentId,
        });

        // 🚨 STEP 2: DB TRANSACTION
        await session.withTransaction(async () => {
            const dbOrder = await Order.findById(orderId).session(session);

            if (!dbOrder) throw new Error("Order not found in transaction");

            // Idempotency guard
            if (dbOrder.status === "refunded") {
                return;
            }

            // ✅ Restore stock
            for (const item of dbOrder.items) {
                await mongoose.model("Product").findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: item.quantity } },
                    { session }
                );
            }

            // ✅ Update order
            dbOrder.status = "refunded";

            if (!dbOrder.statusTimeline) {
                dbOrder.statusTimeline = { orderedAt: dbOrder.createdAt };
            }

            dbOrder.statusTimeline.refundedAt = new Date();

            dbOrder.payment = {
                ...dbOrder.payment,
                refundId: refund.id,
                refundedAt: new Date(),
            };

            dbOrder.statusHistory.push({
                status: "refunded",
                updatedAt: new Date(),
                updatedBy: (req as any).userId,
            });

            await dbOrder.save({ session });
        });

        const user = await User.findById(order.userId);

        try {
            await sendEmail(
                user?.email!,
                "Order Refunded 🎉",
                `
      <h2>Order Refunded</h2>
      <p>Order ID: ${order._id}</p>
      <p>Total: ₹${order.total}</p>
      <p>Status: ${order.status}</p>
    `
            );
        } catch (err) {
            console.error("Email failed:", err);
        }
        session.endSession();

        return ApiResponse.success(res, "Order refunded successfully", {
            refundId: refund.id,
        });
    } catch (err: any) {
        session.endSession();

        console.error("refundOrder error:", err);

        return ApiResponse.error(res, "Refund failed", err.message);
    }
};