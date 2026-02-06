import { useParams } from "react-router-dom";
import {
    useGetAdminOrderByIdQuery,
    useUpdateOrderStatusMutation,
} from "../../../features/admin/adminOrderApi";

const AdminOrderDetailsPage = () => {
    const { id } = useParams<{ id: string }>();

    console.log('from admin order details page', id);
    const { data, isLoading } = useGetAdminOrderByIdQuery(id!)
    const [updateStatus, { isLoading: updating }] =
        useUpdateOrderStatusMutation();

    if (isLoading) return <div className="p-6">Loading order...</div>;
    if (!data) return <div className="p-6 text-red-500">Order not found</div>;

    const order = data.order;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Order Details</h1>

            {/* Summary */}
            <div className="bg-white shadow-soft p-4 rounded-xl">
                <p><b>Order ID:</b> {order._id}</p>
                <p><b>User:</b> {order.userId}</p>
                <p><b>Status:</b> <span className="capitalize">{order.status}</span></p>
                <p><b>Total:</b> ₹{order.total}</p>
            </div>

            {/* Items */}
            <div className="bg-white shadow-soft p-4 rounded-xl">
                <h2 className="font-semibold mb-2">Items</h2>
                {order.items.map((item: any) => (
                    <div
                        key={item.productId}
                        className="flex justify-between border-b py-2"
                    >
                        <span>
                            {item.name} × {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                {order.status === "paid" && (
                    <button
                        disabled={updating}
                        onClick={() =>
                            updateStatus({ orderId: order._id, status: "shipped" })
                        }
                        className="px-5 py-2 bg-blue-600 text-white rounded-xl"
                    >
                        Mark as Shipped
                    </button>
                )}

                {order.status === "shipped" && (
                    <button
                        disabled={updating}
                        onClick={() =>
                            updateStatus({ orderId: order._id, status: "delivered" })
                        }
                        className="px-5 py-2 bg-green-600 text-white rounded-xl"
                    >
                        Mark as Delivered
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdminOrderDetailsPage;