import { Router } from "express";
import { getNotifications } from "../controllers/notifications.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { markNotificationRead } from "../controllers/notifications.controller";

const router = Router();

router.get("/", requireAuth, getNotifications);
router.patch("/:id/read", requireAuth, markNotificationRead);

export default router;