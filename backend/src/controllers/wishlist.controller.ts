import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.model";
import { ApiResponse } from "../utils/response.util";

interface AuthRequest extends Request {
  userId?: string;
}

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const addToWishlistSchema = z.object({
      productId: z.string(),
    });

    const parsed = addToWishlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }
    const { productId } = parsed.data;

    if (!userId) return ApiResponse.error(res, "Unauthorized", null, 401);

    if (!mongoose.isValidObjectId(productId)) {
      return ApiResponse.error(res, "Invalid productId", null, 400);
    }

    const wishlistItem = await Wishlist.create({
      userId,
      productId,
    });

    return ApiResponse.success(res, "Added to wishlist", { wishlistItem }, 201);
  } catch (err: any) {
    if (err.code === 11000) {
      return ApiResponse.error(res, "Product already in wishlist", null, 400);
    }
    console.error("addToWishlist error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    if (!userId) return ApiResponse.error(res, "Unauthorized", null, 401);

    await Wishlist.findOneAndDelete({
      userId,
      productId,
    });

    return ApiResponse.success(res, "Removed from wishlist");
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};

export const getMyWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return ApiResponse.error(res, "Unauthorized", null, 401);

    const wishlist = await Wishlist.find({ userId })
      .populate("productId", "name price images averageRating reviewCount")
      .sort({ createdAt: -1 })
      .lean();

    return ApiResponse.success(res, "Wishlist retrieved successfully", { wishlist });
  } catch (err) {
    console.error("getMyWishlist error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};