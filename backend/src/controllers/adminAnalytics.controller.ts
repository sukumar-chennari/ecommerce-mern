import { Request, Response } from "express";
import Order from "../models/Order.model";
import mongoose from "mongoose";

export const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const matchStage: any = {
      status: "paid",
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }

    const groupId =
      groupBy === "month"
        ? {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          }
        : {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          };

    const revenue = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupId,
          totalRevenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const totalRevenue = revenue.reduce((sum, r) => sum + r.totalRevenue, 0);

    return res.json({
      totalRevenue,
      breakdown: revenue,
    });
  } catch (err) {
    console.error("getRevenueAnalytics error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getOrderStatusAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage: any = {};

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    // Convert to easy-to-use object
    const summary = stats.reduce((acc: any, cur) => {
      acc[cur.status] = cur.count;
      return acc;
    }, {});

    return res.json({
      totalOrders: stats.reduce((s, v) => s + v.count, 0),
      byStatus: summary,
      raw: stats,
    });
  } catch (err) {
    console.error("getOrderStatusAnalytics error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;

    const topProducts = await Order.aggregate([
      // Only completed / revenue-generating orders
      {
        $match: {
          status: { $in: ["paid", "shipped", "delivered"] },
        },
      },

      // Break items array into individual docs
      { $unwind: "$items" },

      // Group by product
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },

      // Sort by quantity sold (or revenue)
      { $sort: { totalQuantitySold: -1 } },

      // Limit results
      { $limit: Number(limit) },

      // Join with Product collection (optional but useful)
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // Final shape
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$productName",
          totalQuantitySold: 1,
          totalRevenue: 1,
          stock: "$product.stock",
          isActive: "$product.isActive",
        },
      },
    ]);

    return res.json({ topProducts });
  } catch (err) {
    console.error("getTopProducts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
