import express from "express";
import { createReview } from "../controllers/review.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", requireAuth, createReview);

export default router;