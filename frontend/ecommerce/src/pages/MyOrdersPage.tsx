import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../features/orders/ordersApi";
import { useRetryPaymentMutation } from "../features/stripe/stripeApi";
import { toast } from "react-hot-toast";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const MyOrdersPage = () => {
    const { data, isLoading } = useGetMyOrdersQuery({ page: 1 });
    const [retryPayment, { isLoading: retrying }] = useRetryPaymentMutation();

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!data || data.orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">No orders yet</h1>
                <p className="text-textMuted mt-2 max-w-xs">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                <Link to="/products" className="mt-10">
                    <Button size="lg" className="shadow-2xl shadow-primary/30">Explore Products</Button>
                </Link>
            </div>
        );
    }

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

    const handleRetry = async (orderId: string) => {
        try {
            const res = await retryPayment({ orderId }).unwrap();
            window.location.href = res.url;
        } catch (err: any) {
            toast.error(err?.data?.message || "Retry failed. Please try again.");
        }
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">My Orders</h1>
                <p className="text-sm text-textMuted font-medium">Track your orders and manage your purchase history.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {data.orders.map((order) => (
                    <Card key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-textPrimary">Order #{order._id.slice(-8).toUpperCase()}</h3>
                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                    </div>
                                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest">
                                        Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                                <p className="text-2xl font-extrabold text-primary">₹{order.total.toLocaleString()}</p>
                                <div className="flex items-center gap-3">
                                    {order.paymentStatus === "failed" && (
                                        <Button 
                                            size="sm" 
                                            variant="danger" 
                                            onClick={() => handleRetry(order._id)}
                                            isLoading={retrying}
                                        >
                                            Retry Payment
                                        </Button>
                                    )}
                                    <Link to={`/orders/${order._id}`}>
                                        <Button variant="outline" size="sm" className="bg-white">View Details</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        {order.status === 'failed' && (
                           <div className="mt-4 p-3 bg-danger/5 rounded-xl border border-danger/10 flex items-center gap-3">
                               <svg className="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                               </svg>
                               <span className="text-[10px] font-bold text-danger uppercase tracking-widest">Payment could not be processed. Please try again or use a different card.</span>
                           </div>
                        )}
                    </Card>
                ))}
            </div>
            
            <div className="flex justify-center pt-6">
                <Link to="/products">
                    <Button variant="ghost" className="text-textMuted hover:text-primary">Continue Shopping</Button>
                </Link>
            </div>
        </div>
    );
};

export default MyOrdersPage;