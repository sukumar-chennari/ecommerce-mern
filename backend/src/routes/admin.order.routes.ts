import express from "express";
import {
    adminListOrders,
    adminGetOrderById,
    updateOrderStatus,
} from "../controllers/adminOrder.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

// List all orders (with filters, pagination)
router.get("/", requireAuth, requireAdmin, adminListOrders);

// Get single order details
router.get("/:id", requireAuth, requireAdmin, adminGetOrderById);

// Update order status (pending → paid → shipped → delivered)
router.patch("/:id/status", requireAuth, requireAdmin, updateOrderStatus);

export default router;