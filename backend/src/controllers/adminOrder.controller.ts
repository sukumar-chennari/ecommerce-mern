import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.model";

const allowedTransitions: Record<string, string[]> = {
  paid: ["shipped"],
  shipped: ["delivered"],
  pending: ["paid"],
};

// List all orders
export const adminListOrders = async (req: Request, res: Response) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .lean();

  res.json({ orders });
};

// Get order by ID
export const adminGetOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findById(id).lean();
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json({ order });
};



export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, tracking } = req.body;

    console.log("orderId", orderId);
    console.log("status", status);
    console.log("tracking", tracking);

    console.log("updateOrderStatus called with:", { orderId, status, tracking });

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = order.status;

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      console.log("Invalid status transition attempted:", {
        from: currentStatus,
        to: status,
      });

      return res.status(400).json({
        message: `Cannot change order status from ${currentStatus} to ${status}`,
      });
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

    return res.json({
      message: "Order status updated",
      order,
    });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};