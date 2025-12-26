import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/adminProduct.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";

const router = express.Router();


console.log("Admin product routes loaded");
// Admin-only product management
router.post("/", requireAuth, requireAdmin, upload.array("images", 5), createProduct);
router.put("/:productId", requireAuth, requireAdmin, upload.array("images", 5), updateProduct);
router.delete("/:productId", requireAuth, requireAdmin, deleteProduct);
router.post("/test-upload", upload.array("images", 5), (req, res) => {
  return res.json({
    body: req.body,
    files: req.files,
  });
});
export default router;