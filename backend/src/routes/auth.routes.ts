import { Router } from "express";
import { register, login, getCurrentUser, refreshToken, logout } from "../controllers/auth.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", requireAuth, getCurrentUser);

export default router;