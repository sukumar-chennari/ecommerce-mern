import { Router } from "express";
import { createCheckoutSession } from "../controllers/stripe.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Create checkout session (user must be authenticated)
router.post("/create-session", requireAuth, createCheckoutSession);

export default router;