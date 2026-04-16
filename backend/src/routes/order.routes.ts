import { Router } from "express";
import {
  createOrderFromCart,
  getMyOrders,
  adminListOrders,
  getOrderById,
  getOrderByStripeSession,
  retryPayment,
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
router.post("/retry-payment", requireAuth, retryPayment);
// admin routes
router.get("/admin/all", requireAuth, requireAdmin, adminListOrders);
router.patch("/admin/orders/:orderId/status", requireAuth, requireAdmin, updateOrderStatus);
router.get(
  "/stripe/:sessionId",
  requireAuth,
  getOrderByStripeSession
);
export default router;