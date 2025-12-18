import { Router } from "express";
import {
  createOrderFromCart,
  getMyOrders,
  adminListOrders,
  getOrderById,
  getOrderByStripeSession,
} from "../controllers/order.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { updateOrderStatus } from "../controllers/adminOrder.controller";

const router = Router();

// user routes
router.post("/", requireAuth, createOrderFromCart);
router.get("/", requireAuth, getMyOrders);
router.get("/:id", requireAuth, getOrderById);
router.get("/session/:sessionId", requireAuth, getOrderByStripeSession);
// admin routes
router.get("/admin/all", requireAuth, requireAdmin, adminListOrders);
router.patch("/admin/orders/:orderId/status", requireAuth, requireAdmin,updateOrderStatus );

export default router;