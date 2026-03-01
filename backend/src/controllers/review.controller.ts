import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Review from "../models/Review.model";
import Order from "../models/Order.model";
import Product from "../models/Product.model";
import { recalculateProductRating } from "../utils/review.util";
import { ApiResponse } from "../utils/response.util";

interface AuthRequest extends Request {
  userId?: string;
}

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const createReviewSchema = z.object({
      productId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    });

    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }

    const { productId, rating, comment } = parsed.data;

    if (!userId) {
      return ApiResponse.error(res, "Unauthorized", null, 401);
    }

    if (!mongoose.isValidObjectId(productId)) {
      return ApiResponse.error(res, "Invalid productId", null, 400);
    }

    // 1️⃣ Check if already reviewed (FAST)
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return ApiResponse.error(res, "You have already reviewed this product", null, 400);
    }

    // 2️⃣ Check delivered order (BUSINESS RULE)
    const deliveredOrder = await Order.findOne({
      userId,
      status: "delivered",
      "items.productId": productId,
    });

    if (!deliveredOrder) {
      return ApiResponse.error(res, "You can review this product only after delivery", null, 403);
    }

    // 3️⃣ Create review
    const review = await Review.create({
      userId,
      productId,
      orderId: deliveredOrder._id,
      rating,
      comment,
    });

    // 4️⃣ Recalculate product rating (TEMP – Step 6C will extract this)
    // const stats = await Review.aggregate([
    //   { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    //   {
    //     $group: {
    //       _id: "$productId",
    //       averageRating: { $avg: "$rating" },
    //       reviewCount: { $sum: 1 },
    //     },
    //   },
    // ]);



    // if (stats.length > 0) {
    //   await Product.findByIdAndUpdate(productId, {
    //     averageRating: Number(stats[0].averageRating.toFixed(1)),
    //     reviewCount: stats[0].reviewCount,
    //   });
    // }

    // return res.status(201).json({
    //   message: "Review added successfully",
    //   review,
    // });


    await recalculateProductRating(new mongoose.Types.ObjectId(productId));

    return ApiResponse.success(res, "Review added successfully", { review }, 201);

  } catch (err) {
    console.error("createReview error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return ApiResponse.error(res, "Invalid productId", null, 400);
    }

    const reviews = await Review.find({ productId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const breakdown: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    stats.forEach((s) => {
      breakdown[s._id] = s.count;
    });

    return ApiResponse.success(res, "Reviews retrieved successfully", { reviews, breakdown });
  } catch (err) {
    console.error("getProductReviews error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};

// export const createReview = async (req: AuthRequest, res: Response) => {
//   try {
//     const userId = req.userId;
//     const { productId, rating, comment } = req.body;

//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     if (!mongoose.isValidObjectId(productId)) {
//       return res.status(400).json({ message: "Invalid productId" });
//     }

//     // 1️⃣ Check if user purchased this product
//     const order = await Order.findOne({
//       userId,
//       status: "delivered",
//       "items.productId": productId,
//     });

//     if (!order) {
//       return res.status(403).json({
//         message: "You can review only products you purchased",
//       });
//     }

//     // 2️⃣ Create review
//     const review = await Review.create({
//       userId,
//       productId,
//       orderId: order._id,
//       rating,
//       comment,
//     });

//     //     await recalculateProductRating(
//     //   new mongoose.Types.ObjectId(productId)
//     // );
//     // 3️⃣ Recalculate product rating
//     const stats = await Review.aggregate([
//       { $match: { productId: new mongoose.Types.ObjectId(productId) } },
//       {
//         $group: {
//           _id: "$productId",
//           averageRating: { $avg: "$rating" },
//           reviewCount: { $sum: 1 },
//         },
//       },
//     ]);

//     if (stats.length > 0) {
//       await Product.findByIdAndUpdate(productId, {
//         averageRating: Number(stats[0].averageRating.toFixed(1)),
//         reviewCount: stats[0].reviewCount,
//       });
//     }

//     return res.status(201).json({ message: "Review added", review });
//   } catch (err: any) {
//     if (err.code === 11000) {
//       return res.status(400).json({
//         message: "You already reviewed this product",
//       });
//     }
//     console.error("createReview error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };