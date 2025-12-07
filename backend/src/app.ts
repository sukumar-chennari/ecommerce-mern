import express from "express";
import  type { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.ts";
import productRoutes from "./routes/product.routes.ts";
import cartRoutes from "./routes/cart.routes.ts";
import orderRoutes from "./routes/order.routes.ts";
import stripeRoutes from "./routes/stripe.routes.ts"
import { stripeWebhookHandler } from "./controllers/webhook.controller.ts";
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

app.use(express.json());
app.use(cookieParser());

// Health Check
app.get("/health", (_, res) => {
  res.send({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stripe", stripeRoutes);
export default app;