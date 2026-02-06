import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../features/orders/ordersApi";

const statusColor = (status: string) => {
    switch (status) {
        case "paid":
            return "text-green-600";
        case "shipped":
            return "text-blue-600";
        case "delivered":
            return "text-emerald-700";
        case "cancelled":
            return "text-red-600";
        default:
            return "text-yellow-600";
    }
};

const MyOrdersPage = () => {
    const { data, isLoading } = useGetMyOrdersQuery({ page: 1 });

    if (isLoading) return <div className="p-6">Loading orders...</div>;

    if (!data || data.orders.length === 0)
        return <div className="p-6">No orders yet</div>;

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">My Orders</h1>

            {data.orders.map((order) => (
                <div
                    key={order._id}
                    className="bg-surface shadow-card rounded-xl p-4 flex justify-between items-center"
                >
                    <div>
                        <p className="font-medium">
                            Order #{order._id.slice(-6)}
                        </p>
                        <p className="text-sm text-textMuted">
                            {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold">₹{order.total}</p>
                        <p className={`text-sm ${statusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                        </p>
                        <Link
                            to={`/orders/${order._id}`}
                            className="text-primary text-sm underline"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyOrdersPage;