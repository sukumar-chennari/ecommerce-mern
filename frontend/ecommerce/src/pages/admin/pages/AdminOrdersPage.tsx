import { useGetAdminOrdersQuery } from "../../../features/admin/adminOrderApi";
import { Link } from "react-router-dom";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import { useState } from "react";

const AdminOrdersPage = () => {
    const [statusFilter, setStatusFilter] = useState("");
    const { data, isLoading } = useGetAdminOrdersQuery({ status: statusFilter });
    const orders = data?.orders || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Order Management</h1>
                    <p className="text-sm text-textMuted mt-1">Manage and track all customer orders across the platform.</p>
                </div>
                
                <div className="flex gap-3">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-xs font-bold rounded-xl px-4 py-3 outline-none shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <AdminTable headers={["Order ID", "Customer", "Date", "Status", "Total", "Action"]}>
                {orders?.map((order: any) => (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5">
                            <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                #{order._id.slice(-8).toUpperCase()}
                            </span>
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-textPrimary">User ID: {order.userId.slice(-6)}</span>
                                <span className="text-xs text-textMuted">Individual Customer</span>
                            </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-textMuted font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </td>
                        <td className="px-6 py-5">
                            <AdminBadge type={order.status}>{order.status}</AdminBadge>
                        </td>
                        <td className="px-6 py-5">
                            <span className="text-sm font-bold text-textPrimary">₹{order.total.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-5">
                            <Link
                                to={`/admin/orders/${order._id}`}
                                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-colors group-hover:translate-x-1 duration-300"
                            >
                                View Details
                                <span>→</span>
                            </Link>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            {orders?.length === 0 && (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-textPrimary">No orders found</h3>
                    <p className="text-sm text-textMuted max-w-xs mt-1">When customers place orders, they will appear here for management.</p>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;