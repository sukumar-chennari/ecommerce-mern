import { useSearchParams, Link } from "react-router-dom";
import { useGetOrderByStripeSessionQuery } from "../features/orders/ordersApi";
import { useVerifyCheckoutSessionQuery } from "../features/stripe/stripeApi";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const CheckoutSuccess = () => {
    const [params] = useSearchParams();
    const sessionId = params.get("session_id");

    const { data: verifyData, isLoading: verifying, isError } =
        useVerifyCheckoutSessionQuery(sessionId!, {
            skip: !sessionId,
        });
        
    const { data: order, isLoading: loadingOrder } =
        useGetOrderByStripeSessionQuery(sessionId!, {
            skip: !verifyData?.orderId,
        });

    if (verifying || loadingOrder) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-textMuted uppercase tracking-widest">Verifying payment status...</p>
            </div>
        );
    }

    if (isError || !sessionId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-danger/10 rounded-3xl flex items-center justify-center mb-8 text-danger">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Payment Verification Failed</h1>
                <p className="text-textMuted mt-2 max-w-xs">We couldn't verify your payment session. If you believe this is an error, please contact support.</p>
                <div className="flex gap-4 mt-10">
                    <Link to="/cart"><Button variant="outline">Back to Cart</Button></Link>
                    <Link to="/products"><Button>Continue Shopping</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Success Hero */}
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-accent/10 rounded-[2rem] flex items-center justify-center text-accent shadow-xl shadow-accent/10 relative">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="absolute -inset-2 bg-accent/20 rounded-[2.5rem] animate-ping opacity-20"></div>
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-textPrimary tracking-tight">Payment Successful!</h1>
                    <p className="text-textMuted font-medium">Thank you for your purchase. Your order is being processed.</p>
                </div>
                
                <Badge variant="success" className="px-6 py-2 text-xs">Confirmed Order #{order?._id.slice(-8).toUpperCase()}</Badge>
            </div>

            {/* Order Brief */}
            <Card className="space-y-8 divide-y divide-gray-50">
                <div className="pb-8">
                    <h3 className="font-bold text-textPrimary mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Order Summary
                    </h3>
                    <div className="space-y-4">
                        {order?.items.map((item: any) => (
                            <div key={item.productId} className="flex justify-between items-center text-sm">
                                <div className="flex gap-4">
                                    <span className="font-bold text-primary">×{item.quantity}</span>
                                    <span className="font-medium text-textPrimary">{item.name}</span>
                                </div>
                                <span className="font-bold text-textPrimary">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="py-8 grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Shipping to</p>
                        <p className="text-sm font-bold text-textPrimary">{order?.shippingAddress.name}</p>
                        <p className="text-xs text-textMuted leading-relaxed">
                            {order?.shippingAddress.addressLine1}, {order?.shippingAddress.city}<br />
                            {order?.shippingAddress.state} {order?.shippingAddress.postalCode}
                        </p>
                    </div>
                    <div className="space-y-2 text-right">
                        <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Payment Total</p>
                        <p className="text-2xl font-extrabold text-primary">₹{order?.total.toLocaleString()}</p>
                        <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Stripe Secured</p>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                    <Link to="/orders" className="flex-1">
                        <Button variant="outline" className="w-full py-4">View My Orders</Button>
                    </Link>
                    <Link to="/products" className="flex-1">
                        <Button className="w-full py-4 shadow-xl shadow-primary/20">Continue Shopping</Button>
                    </Link>
                </div>
            </Card>

            <p className="text-center text-xs text-textMuted font-medium">
                A confirmation email has been sent to your registered email address.<br />
                Need help? <a href="#" className="text-primary hover:underline">Contact our support team</a>
            </p>
        </div>
    );
};

export default CheckoutSuccess;