import express from "express";
import type { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware";

import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import stripeRoutes from "./routes/stripe.routes"
import { stripeWebhookHandler } from "./controllers/webhook.controller";
import { Request, Response } from "express";
import reviewRoutes from "./routes/review.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import adminProductRoutes from "./routes/admin.product.routes";
import adminAnalyticsRoutes from "./routes/admin.analytics.routes";
import adminOrderRoutes from "./routes/admin.order.routes";
import notificationRoutes from "./routes/notifications.routes";
import { sendEmail } from "./services/email.service";
dotenv.config();


const app: Application = express();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // only 10 login attempts per 15 minutes
  message: "Too many login attempts. Try again later.",
});

app.use(globalLimiter);

app.use(morgan("combined"))

app.use(helmet());

// Webhook endpoint must use raw body parser
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);


// ✅ CORS: use array so BOTH localhost and ngrok origins are allowed
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
// app.get("/health", (_, res) => {
//   res.send({ status: "OK" });
// });

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});
app.get("/test-email", async (req, res) => {
  await sendEmail(
    "chennarisukumar@gmail.com",
    "Test Email",
    "<h1>It works 🎉</h1>"
  );

  res.send("Email sent");
});
// app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/reviews", authLimiter, reviewRoutes);
app.use("/api/wishlist", authLimiter, wishlistRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/notifications", notificationRoutes);


app.use("/api/admin/analytics", authLimiter, adminAnalyticsRoutes);



app.use(errorHandler);
export default app;