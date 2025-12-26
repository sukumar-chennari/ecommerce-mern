import { Request, Response } from "express";
import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.model";

interface AuthRequest extends Request {
  userId?: string;
}

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const wishlistItem = await Wishlist.create({
      userId,
      productId,
    });

    return res.status(201).json({
      message: "Added to wishlist",
      wishlistItem,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Product already in wishlist",
      });
    }
    console.error("addToWishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await Wishlist.findOneAndDelete({
      userId,
      productId,
    });

    return res.json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const wishlist = await Wishlist.find({ userId })
      .populate("productId", "name price images averageRating reviewCount")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ wishlist });
  } catch (err) {
    console.error("getMyWishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};