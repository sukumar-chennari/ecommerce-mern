import Order from "../models/Order.model";
import Product from "../models/Product.model";

export const releaseExpiredStock = async () => {
    console.log("⏳ Checking expired orders...");

    const expiredOrders = await Order.find({
        paymentStatus: "pending",
        reservationExpiresAt: { $lt: new Date() },
    });

    if (expiredOrders.length === 0) {
        console.log("✅ No expired orders");
        return;
    }

    console.log(`⚠️ Found ${expiredOrders.length} expired orders`);

    for (const order of expiredOrders) {
        try {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity },
                });
            }

            order.status = "failed";
            order.paymentStatus = "failed";

            await order.save();

            console.log(`♻️ Released stock for order ${order._id}`);
        } catch (err) {
            console.error("❌ Error releasing stock:", err);
        }
    }
};
