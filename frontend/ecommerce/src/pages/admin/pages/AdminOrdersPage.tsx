import { Link } from "react-router-dom";
import { useGetAdminOrdersQuery } from "../../../features/admin/adminOrderApi";

const statusColor: any = {
    pending: "bg-gray-200",
    paid: "bg-yellow-200",
    shipped: "bg-blue-200",
    delivered: "bg-green-200",
};

const AdminOrdersPage = () => {
    const { data, isLoading } = useGetAdminOrdersQuery({});

    if (isLoading) return <div className="p-6">Loading orders...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Orders</h1>

            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2">Order ID</th>
                        <th className="p-2">User</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Total</th>
                        <th className="p-2">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {data?.orders.map((order: any) => (
                        <tr key={order._id} className="border-t">
                            <td className="p-2">
                                <Link
                                    to={`/admin/orders/${order._id}`}
                                    className="text-blue-600 underline"
                                >
                                    {order._id}
                                </Link>
                            </td>
                            <td className="p-2">{order.userId.name}</td>
                            <td className="p-2">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-2">₹{order.total}</td>
                            <td className="p-2">
                                <span
                                    className={`px-2 py-1 rounded text-sm ${statusColor[order.status]
                                        }`}
                                >
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrdersPage;