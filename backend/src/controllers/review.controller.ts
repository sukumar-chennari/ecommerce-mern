import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/Review.model";
import Order from "../models/Order.model";
import Product from "../models/Product.model";
import { recalculateProductRating } from "../utils/review.util";

interface AuthRequest extends Request {
  userId?: string;
}

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { productId, rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    // 1️⃣ Check if already reviewed (FAST)
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    // 2️⃣ Check delivered order (BUSINESS RULE)
    const deliveredOrder = await Order.findOne({
      userId,
      status: "delivered",
      "items.productId": productId,
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        message: "You can review this product only after delivery",
      });
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

  } catch (err) {
    console.error("createReview error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const reviews = await Review.find({ productId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ reviews });
  } catch (err) {
    console.error("getProductReviews error:", err);
    return res.status(500).json({ message: "Server error" });
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