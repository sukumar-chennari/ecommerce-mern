import express from "express";
import {
  getRevenueAnalytics,
//   getOrderStatusAnalytics,
//   getTopProducts,
} from "../controllers/adminAnalytics.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/revenue", requireAuth, requireAdmin, getRevenueAnalytics);
// router.get("/orders", requireAuth, requireAdmin, getOrderStatusAnalytics);
// router.get("/top-products", requireAuth, requireAdmin, getTopProducts);

export default router;