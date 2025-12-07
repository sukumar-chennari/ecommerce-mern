import { Router } from "express";
import {
  createOrderFromCart,
  getMyOrders,
  adminListOrders,
  getOrderById,
  getOrderByStripeSession,
} from "../controllers/order.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";
import { requireAdmin } from "../middlewares/role.middleware.ts";

const router = Router();

// user routes
router.post("/", requireAuth, createOrderFromCart);
router.get("/", requireAuth, getMyOrders);
router.get("/:id", requireAuth, getOrderById);
router.get("/session/:sessionId", requireAuth, getOrderByStripeSession);
// admin routes
router.get("/admin/all", requireAuth, requireAdmin, adminListOrders);

export default router;