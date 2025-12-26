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

    const totalRevenue = revenue.reduce(
      (sum, r) => sum + r.totalRevenue,
      0
    );

    return res.json({
      totalRevenue,
      breakdown: revenue,
    });
  } catch (err) {
    console.error("getRevenueAnalytics error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};