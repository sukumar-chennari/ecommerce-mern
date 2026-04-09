import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Order from "../models/Order.model";
import { ApiResponse } from "../utils/response.util";

const allowedTransitions: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "refunded"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  refunded: [],
};

// List all orders
export const adminListOrders = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return ApiResponse.success(res, "Orders retrieved successfully", { orders });
};

// Get order by ID
export const adminGetOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate("userId", "name email")
    .lean();
  if (!order) {
    return ApiResponse.error(res, "Order not found", null, 404);
  }

  return ApiResponse.success(res, "Order retrieved successfully", { order });
};



export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const updateOrderStatusSchema = z.object({
      status: z.enum([
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "failed",
        "refunded",
      ]),
      tracking: z
        .object({
          carrier: z.string().optional(),
          trackingNumber: z.string().optional(),
          trackingUrl: z.string().optional(),
        })
        .optional(),
    });

    const parsed = updateOrderStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return ApiResponse.error(
        res,
        "Validation failed",
        parsed.error.flatten(),
        400
      );
    }

    const { status, tracking } = parsed.data;

    if (!mongoose.isValidObjectId(orderId)) {
      return ApiResponse.error(res, "Invalid order ID", null, 400);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return ApiResponse.error(res, "Order not found", null, 404);
    }

    // ✅ Ensure timeline exists EARLY
    if (!order.statusTimeline) {
      order.statusTimeline = { orderedAt: order.createdAt };
    }

    const currentStatus = order.status;

    // ✅ Idempotency
    if (status === currentStatus) {
      return ApiResponse.success(res, "No change", { order });
    }

    const finalStates = ["delivered", "cancelled", "refunded"];

    if (finalStates.includes(currentStatus)) {
      return ApiResponse.error(
        res,
        "Order is already finalized",
        null,
        400
      );
    }

    // ❌ Block manual payment
    if (status === "paid") {
      return ApiResponse.error(
        res,
        "Payment handled by Stripe only",
        null,
        400
      );
    }

    if (status === "refunded") {
      return ApiResponse.error(res, "Use refund API endpoint", null, 400);
    }

    // ✅ Transition validation
    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return ApiResponse.error(
        res,
        `Cannot change order status from ${currentStatus} to ${status}`,
        null,
        400
      );
    }

    // ✅ Business rules
    if (status === "shipped" && currentStatus !== "paid") {
      return ApiResponse.error(
        res,
        "Order must be paid before shipping",
        null,
        400
      );
    }

    if (status === "shipped" && !tracking?.trackingNumber) {
      return ApiResponse.error(
        res,
        "Tracking info required when shipping",
        null,
        400
      );
    }

    if (status === "cancelled" && currentStatus === "shipped") {
      return ApiResponse.error(
        res,
        "Cannot cancel after shipping",
        null,
        400
      );
    }

    if (status === "cancelled" && currentStatus === "paid") {
      return ApiResponse.error(
        res,
        "Use refund instead of cancel",
        null,
        400
      );
    }

    // ✅ MUTATION STARTS
    order.status = status;

    // ✅ Timeline updates
    if (status === "cancelled") {
      order.statusTimeline.cancelledAt = new Date();
    }

    if (status === "shipped") {
      order.statusTimeline.shippedAt = new Date();
      order.shippedAt = new Date();
    }

    if (status === "delivered") {
      order.statusTimeline.deliveredAt = new Date();
      order.deliveredAt = new Date();
    }

    // ✅ Tracking
    if (tracking) {
      order.tracking = tracking;
    }

    // ✅ History
    order.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: (req as any).userId,
    });

    await order.save();

    // ✅ SHIFT: Real-time notification to the user
    try {
      const { io } = require("../server");
      const statusMessages: Record<string, { title: string; message: string }> = {
        shipped: {
          title: "Order Shipped! 🚚",
          message: `Your order ${orderId.toString().slice(-6)} has been shipped.`,
        },
        delivered: {
          title: "Order Delivered! ✅",
          message: `Your order ${orderId.toString().slice(-6)} has been delivered. Enjoy!`,
        },
        cancelled: {
          title: "Order Cancelled ❌",
          message: `Your order ${orderId.toString().slice(-6)} was cancelled.`,
        },
      };

      const notification = statusMessages[status];
      if (notification && order.userId) {
        io.to(order.userId.toString()).emit("new_notification", notification);
        console.log(`📡 Socket notification sent to user ${order.userId} for status: ${status}`);
      }
    } catch (socketErr) {
      console.error("Failed to send socket notification:", socketErr);
    }

    return ApiResponse.success(res, "Order status updated", { order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};