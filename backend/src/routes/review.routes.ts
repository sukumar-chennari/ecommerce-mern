import express from "express";
import { createReview, getProductReviews } from "../controllers/review.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", requireAuth, createReview);
router.get("/product/:productId", getProductReviews);

export default router;