import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = Router();

router.use(requireAuth); // protect all cart routes

router.get("/", getCart);
router.post("/", addToCart); // body: { productId, quantity }
router.put("/:productId", updateCartItem); // body: { quantity }
router.delete("/:productId", removeCartItem);
router.delete("/", clearCart);

export default router;