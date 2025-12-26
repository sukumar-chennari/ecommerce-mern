import mongoose, { Document, Schema } from "mongoose";

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate wishlist items
 * One product per user only once
 */
WishlistSchema.index(
  { userId: 1, productId: 1 },
  { unique: true }
);

export default mongoose.model<IWishlist>("Wishlist", WishlistSchema);