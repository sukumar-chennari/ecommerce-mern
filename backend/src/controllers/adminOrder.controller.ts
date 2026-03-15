import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Order from "../models/Order.model";
import { ApiResponse } from "../utils/response.util";

const allowedTransitions: Record<string, string[]> = {
  paid: ["shipped"],
  shipped: ["delivered"],
  pending: ["paid"],
};


// List all orders
export const adminListOrders = async (req: Request, res: Response) => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return ApiResponse.success(res, "Orders retrieved successfully", { orders });
};

// Get order by ID
export const adminGetOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findById(id).lean();
  if (!order) {
    return ApiResponse.error(res, "Order not found", null, 404);
  }

  return ApiResponse.success(res, "Order retrieved successfully", { order });
};



export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const updateOrderStatusSchema = z.object({
      status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled", "failed", "refunded"]),
      tracking: z.object({
        carrier: z.string().optional(),
        trackingNumber: z.string().optional(),
        trackingUrl: z.string().optional(),
      }).optional(),
    });

    const parsed = updateOrderStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }

    const { status, tracking } = parsed.data;

    console.log("orderId", orderId);
    console.log("status", status);
    console.log("tracking", tracking);

    console.log("updateOrderStatus called with:", { orderId, status, tracking });

    if (!mongoose.isValidObjectId(orderId)) {
      return ApiResponse.error(res, "Invalid order ID", null, 400);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return ApiResponse.error(res, "Order not found", null, 404);
    }

    const currentStatus = order.status;

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      console.log("Invalid status transition attempted:", {
        from: currentStatus,
        to: status,
      });

      return ApiResponse.error(res, `Cannot change order status from ${currentStatus} to ${status}`, null, 400);
    }

    // Update status
    order.status = status;

    // Update timeline
    if (status === "shipped") {
      order.statusTimeline!.shippedAt = new Date();
      order.shippedAt = new Date();
    }

    if (status === "delivered") {
      order.statusTimeline!.deliveredAt = new Date();
      order.deliveredAt = new Date();
    }

    // Optional tracking info
    if (tracking) {
      order.tracking = tracking;
    }

    await order.save();

    return ApiResponse.success(res, "Order status updated", { order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};