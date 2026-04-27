import { useParams, useNavigate } from "react-router-dom";
import {
    useGetAdminOrderByIdQuery,
    useUpdateOrderStatusMutation,
} from "../../../features/admin/adminOrderApi";
import { toast } from "react-hot-toast";
import AdminBadge from "../components/AdminBadge";

const AdminOrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: order, isLoading } = useGetAdminOrderByIdQuery(id!);
    const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

    const handleStatusUpdate = async (status: string) => {
        try {
            await updateStatus({ orderId: id!, status }).unwrap();
            toast.success(`Order marked as ${status}`);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to update status");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) return <div className="text-center py-20 font-bold text-danger">Order not found</div>;

    const steps = [
        { label: 'Pending', active: true },
        { label: 'Paid', active: order.status !== 'pending' && order.status !== 'failed' },
        { label: 'Shipped', active: ['shipped', 'delivered'].includes(order.status) },
        { label: 'Delivered', active: order.status === 'delivered' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex justify-between items-start">
                <div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-xs font-bold text-textMuted hover:text-primary transition-colors mb-4 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        Back to Orders
                    </button>
                    <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Order #{order._id.slice(-8).toUpperCase()}</h1>
                    <p className="text-sm text-textMuted mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex gap-3">
                    {order.status === 'paid' && (
                        <button
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate('shipped')}
                            className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                        >
                            Mark as Shipped
                        </button>
                    )}
                    {order.status === 'shipped' && (
                        <button
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate('delivered')}
                            className="px-6 py-3 bg-accent text-white text-xs font-bold rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-all disabled:opacity-50"
                        >
                            Mark as Delivered
                        </button>
                    )}
                    {!['delivered', 'cancelled', 'failed'].includes(order.status) && (
                        <button
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate('cancelled')}
                            className="px-6 py-3 bg-white border border-danger text-danger text-xs font-bold rounded-xl hover:bg-danger/5 transition-all disabled:opacity-50"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100">
                <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                    {steps.map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-500 ${step.active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {step.active ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-xs font-bold">{i + 1}</span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${step.active ? 'text-primary' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-textPrimary">Order Items</h3>
                            <span className="text-xs font-bold text-textMuted uppercase">{order.items.length} Items</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.items.map((item: any) => (
                                <div key={item.productId} className="px-8 py-6 flex items-center gap-6 group hover:bg-gray-50/30 transition-colors">
                                    <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-textPrimary">{item.name}</h4>
                                        <p className="text-xs text-textMuted mt-1 tracking-tight">Quantity: <span className="text-textPrimary font-bold">{item.quantity}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-textPrimary">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        <p className="text-[10px] text-textMuted font-bold">₹{item.price.toLocaleString()} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-8 py-8 bg-gray-50/50 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted">Subtotal</span>
                                <span className="font-bold text-textPrimary">₹{(order.total - (order.shipping || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted">Shipping</span>
                                <span className="font-bold text-accent">FREE</span>
                            </div>
                            <div className="flex justify-between text-lg pt-3 border-t border-gray-100">
                                <span className="font-bold text-textPrimary">Order Total</span>
                                <span className="font-extrabold text-primary">₹{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer & Shipping Info */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100">
                        <h3 className="font-bold text-textPrimary mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Customer
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {order.userId.slice(-1).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-textPrimary">User ID: {order.userId.slice(-8)}</span>
                                <span className="text-xs text-textMuted">Registered Customer</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1">Payment Method</p>
                                <p className="text-sm font-bold text-textPrimary capitalize">{order.payment?.method || 'Card (Stripe)'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1">Status</p>
                                <AdminBadge type={order.status}>{order.status}</AdminBadge>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100">
                        <h3 className="font-bold text-textPrimary mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Shipping Address
                        </h3>
                        {order.shippingAddress ? (
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-textPrimary">{order.shippingAddress.name}</p>
                                <p className="text-sm text-textMuted">{order.shippingAddress.addressLine1}</p>
                                {order.shippingAddress.addressLine2 && <p className="text-sm text-textMuted">{order.shippingAddress.addressLine2}</p>}
                                <p className="text-sm text-textMuted">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                <p className="text-sm font-bold text-textPrimary mt-4">{order.shippingAddress.country}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-textMuted italic">No shipping address provided</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailsPage;