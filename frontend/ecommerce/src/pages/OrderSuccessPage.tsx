import { useSearchParams } from "react-router-dom";
import { useGetOrderByStripeSessionQuery } from "../features/orders/ordersApi";

const OrderSuccessPage = () => {
    const [params] = useSearchParams();
    const sessionId = params.get("session_id");

    const { data, isLoading } =
        useGetOrderByStripeSessionQuery(sessionId!, {
            skip: !sessionId,
        });

    if (isLoading) {
        return <div className="p-6">Loading order...</div>;
    }

    if (!data?.order) {
        return <div className="p-6 text-red-500">Order not found</div>;
    }

    const order = data.order;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-green-600">
                ✅ Order Placed Successfully
            </h1>

            <p className="text-sm text-gray-500">
                Order ID: {order._id}
            </p>

            <div className="border rounded-xl p-4 space-y-3">
                {order.items.map((item: any) => (
                    <div key={item.productId} className="flex justify-between">
                        <span>
                            {item.name} × {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            <div className="text-lg font-semibold">
                Total Paid: ₹{order.total}
            </div>

            <div className="text-sm text-gray-600">
                Status: <span className="font-medium">{order.status}</span>
            </div>

            <div className="text-sm text-gray-600">
                Estimated delivery: {order.deliveryEstimate}
            </div>
        </div>
    );
};

export default OrderSuccessPage;