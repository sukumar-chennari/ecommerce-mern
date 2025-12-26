import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
} from "../controllers/wishlist.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", requireAuth, addToWishlist);
router.delete("/:productId", requireAuth, removeFromWishlist);
router.get("/", requireAuth, getMyWishlist);

export default router;