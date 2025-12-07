import { Router } from "express";
import {
  createProduct,
  deleteProductById,
  getAllProducts,
  getProductBySlug,
  updateProductById,
  
} from "../controllers/product.controller.ts";

import { requireAuth } from "../middlewares/auth.middleware.ts";
import { requireAdmin } from "../middlewares/role.middleware.ts";

const router = Router();

// PUBLIC
router.get("/", getAllProducts);
router.get("/:slug", getProductBySlug);

// ADMIN
router.post("/", requireAuth, requireAdmin, createProduct);
router.put("/:id", requireAuth, requireAdmin, updateProductById);
router.delete("/:id", requireAuth, requireAdmin, deleteProductById);

export default router;