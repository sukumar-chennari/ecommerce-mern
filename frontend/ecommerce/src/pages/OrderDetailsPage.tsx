import { useParams, useNavigate } from "react-router-dom";
import { useGetOrderByIdQuery } from "../features/orders/ordersApi";
import OrderTimeline from "../components/order/OrderTimeline";
import ReviewForm from "../components/review/ReviewForm";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const OrderDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useGetOrderByIdQuery(id!);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!data) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-2xl font-bold text-textPrimary">Order Not Found</h2>
            <Button variant="outline" className="mt-6" onClick={() => navigate("/orders")}>Back to Orders</Button>
        </div>
    );

    const { order, progress, estimatedDelivery } = data;

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "paid":
            case "delivered": return "success";
            case "shipped": return "primary";
            case "cancelled":
            case "failed": return "danger";
            default: return "warning";
        }
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-xs font-bold text-textMuted hover:text-primary transition-colors flex items-center gap-1 mb-2 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        Back to My Orders
                    </button>
                    <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Order Details</h1>
                    <p className="text-sm text-textMuted font-medium">Tracking number: <span className="font-mono text-textPrimary uppercase">{order._id}</span></p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(order.status)} className="px-6 py-2 text-xs">{order.status}</Badge>
                    <Button variant="outline" size="sm" className="bg-white">Invoice PDF</Button>
                </div>
            </div>

            {/* Timeline Card */}
            <Card className="bg-gray-50/30">
                <div className="text-center mb-4">
                    <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Expected Arrival</p>
                    <p className="text-sm font-bold text-textPrimary">{estimatedDelivery || "Calculating..."}</p>
                </div>
                <OrderTimeline
                    ordered={progress.ordered}
                    paid={progress.paid}
                    shipped={progress.shipped}
                    delivered={progress.delivered}
                />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="space-y-8 divide-y divide-gray-50">
                        <h2 className="text-xl font-bold text-textPrimary mb-2">Order Items</h2>
                        {order.items.map((item: any) => (
                            <div key={item.productId} className="flex gap-6 py-6 first:pt-0 last:pb-0">
                                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-textPrimary line-clamp-1">{item.name}</h4>
                                    <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">Quantity: {item.quantity}</p>
                                    <p className="text-primary font-extrabold text-sm mt-3">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                                <div className="shrink-0 flex items-center">
                                    {progress.delivered && (
                                        <ReviewForm productId={item.productId} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* Logistics & Payment */}
                <div className="space-y-8">
                    <Card className="space-y-6">
                        <h2 className="text-xl font-bold text-textPrimary">Shipping Details</h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1">Customer</p>
                                <p className="text-sm font-bold text-textPrimary">{order.shippingAddress.name}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1">Delivery Address</p>
                                <p className="text-xs text-textMuted leading-relaxed">
                                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city}<br />
                                    {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                                    {order.shippingAddress.country}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="space-y-6">
                        <h2 className="text-xl font-bold text-textPrimary">Payment Info</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted font-medium">Payment Method</span>
                                <span className="text-textPrimary font-bold">Stripe Card</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted font-medium">Subtotal</span>
                                <span className="text-textPrimary font-bold">₹{(order.total - order.tax - order.shipping).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted font-medium">Shipping Fee</span>
                                <span className="text-accent font-bold uppercase tracking-widest text-[10px]">Free</span>
                            </div>
                            <div className="h-[1px] bg-gray-100 my-2"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-lg font-bold text-textPrimary">Paid Total</span>
                                <span className="text-2xl font-extrabold text-primary">₹{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;