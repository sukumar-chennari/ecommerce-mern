import { Router } from "express";
import { register, login, getCurrentUser, refreshToken, logout } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", requireAuth, getCurrentUser);

export default router;