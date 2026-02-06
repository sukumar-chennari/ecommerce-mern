import Review from "../models/Review.model";
import Product from "../models/Product.model";
import mongoose from "mongoose";

export const recalculateProductRating = async (
    productId: mongoose.Types.ObjectId
) => {
    const stats = await Review.aggregate([
        { $match: { productId } },
        {
            $group: {
                _id: "$productId",
                avgRating: { $avg: "$rating" },
                count: { $sum: 1 },
            },
        },
    ]);

    if (stats.length === 0) {
        await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            reviewCount: 0,
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    }
};