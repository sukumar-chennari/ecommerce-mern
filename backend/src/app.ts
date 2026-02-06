import express from "express";
import type { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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
dotenv.config();

const app: Application = express();




// Webhook endpoint must use raw body parser
app.post("/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);


app.use("/api/admin/analytics", adminAnalyticsRoutes);
export default app;