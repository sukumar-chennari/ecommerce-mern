import { Router } from "express";
import { createCheckoutSession, verifyCheckoutSession } from "../controllers/stripe.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Create checkout session (user must be authenticated)
router.post("/create-session", requireAuth, createCheckoutSession);

router.get("/verify-session", requireAuth, verifyCheckoutSession);

export default router;