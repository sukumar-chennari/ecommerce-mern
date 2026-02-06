import { useParams } from "react-router-dom";
import { useGetOrderByIdQuery } from "../features/orders/ordersApi";
import OrderTimeline from "../components/order/OrderTimeline";
import ReviewForm from "../components/review/ReviewForm";

const OrderDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useGetOrderByIdQuery(id!);

    if (isLoading) return <div className="p-6">Loading order...</div>;
    if (!data) return <div className="p-6 text-red-500">Order not found</div>;

    const { order, progress, estimatedDelivery } = data;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">
                Order #{order._id.slice(-6)}
            </h1>

            {/* Status */}
            <div className="bg-surface rounded-xl shadow-card p-4">
                <p>Status: <strong>{order.status.toUpperCase()}</strong></p>
                <p>Total: ₹{order.total}</p>
                <p>Estimated Delivery: {estimatedDelivery}</p>
            </div>

            {/* Items */}
            <div className="bg-surface rounded-xl shadow-card p-4 space-y-3">
                <h2 className="font-semibold">Items</h2>

                {order.items.map((item: any) => (
                    <div
                        key={item.productId}
                        className="flex justify-between border-b pb-2"
                    >
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-textMuted">
                                Qty: {item.quantity}
                            </p>
                        </div>
                        <p>₹{item.price * item.quantity}</p>

                        {progress.delivered && (
                            <ReviewForm productId={item.productId} />
                        )}
                    </div>
                ))}
            </div>

            {/* Timeline */}
            {/* <div className="bg-surface rounded-xl shadow-card p-4">
                <h2 className="font-semibold mb-2">Order Progress</h2>

                <ul className="space-y-1 text-sm">
                    <li>✔ Ordered</li>
                    <li>{progress.paid ? "✔ Paid" : "⏳ Paid"}</li>
                    <li>{progress.shipped ? "✔ Shipped" : "⏳ Shipped"}</li>
                    <li>{progress.delivered ? "✔ Delivered" : "⏳ Delivered"}</li>
                </ul>
            </div> */}
            <div className="bg-surface rounded-xl shadow-card p-4">
                <h2 className="font-semibold mb-4">Order Progress</h2>

                <OrderTimeline
                    ordered={progress.ordered}
                    paid={progress.paid}

                    shipped={progress.shipped}
                    delivered={progress.delivered}
                />
            </div>
        </div>
    );
};

export default OrderDetailsPage;