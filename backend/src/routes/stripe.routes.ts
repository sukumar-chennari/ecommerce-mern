import { Router } from "express";
import { createCheckoutSession } from "../controllers/stripe.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = Router();

// Create checkout session (user must be authenticated)
router.post("/create-session", requireAuth, createCheckoutSession);

export default router;