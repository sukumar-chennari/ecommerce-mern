import { Router } from "express";
import { getNotifications } from "../controllers/notifications.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { markNotificationRead } from "../controllers/notifications.controller";

const router = Router();

router.get("/notifications", requireAuth, getNotifications);
router.patch("/notifications/:id/read", requireAuth, markNotificationRead);

export default router;