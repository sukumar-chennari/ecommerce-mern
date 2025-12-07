import  type { Request, Response } from "express";
import Stripe from "stripe";
import Order from "../models/Order.model.ts";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-11-17.clover",
});

// Create Checkout session (frontend will redirect to session.url)
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "Missing orderId" });

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.total === undefined) return res.status(400).json({ message: "Order total missing" });
    if (order.status !== "pending") return res.status(400).json({ message: "Order is not pending" });

    // build line items from order snapshot (amounts in cents)
    const line_items = order.items.map(item => ({
      price_data: {
        currency: "inr", // change to your currency
        product_data: { name: item.name, metadata: { productId: item.productId.toString() } },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      metadata: { orderId: order._id.toString() }, // critical: used by webhook
    });

    return res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};