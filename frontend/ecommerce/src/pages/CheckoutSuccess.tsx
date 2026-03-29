import { useSearchParams, Link } from "react-router-dom";
import { useGetOrderByStripeSessionQuery } from "../features/orders/ordersApi";
import { useVerifyCheckoutSessionQuery } from "../features/stripe/stripeApi";

const CheckoutSuccess = () => {
    const [params] = useSearchParams();
    const sessionId = params.get("session_id");

    const { data: verifyData, isLoading: verifying, isError, isSuccess } =
        useVerifyCheckoutSessionQuery(sessionId!, {
            skip: !sessionId,
        });
    const { data, isLoading, error } =
        useGetOrderByStripeSessionQuery(sessionId!, {
            skip: !verifyData?.orderId,
        });

    console.log('verifyData in checkoutSuccess page : ', verifyData)


    if (verifying) {
        return <div className="p-6">Verifying payment...</div>;
    }

    if (isError || !verifyData?.orderId) {
        return <div className="p-6 text-red-500">Payment not confirmed ❌</div>;
    }
    if (!sessionId) {
        return <div className="p-6 text-red-500">Invalid payment session</div>;
    }
    if (isLoading || !data) {
        return <div className="p-6">Finalizing your order...</div>;
    }
    console.log('data in checkoutSuccess page : ', data)

    const order = data;

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-green-600">
                Payment Successful 🎉
            </h1>

            <p className="text-gray-600">
                Order ID: <span className="font-mono">{order._id}</span>
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

                <div className="flex justify-between font-semibold">
                    <span>Tax</span>
                    <span>₹{order.tax}</span>
                </div>

                <div className="flex justify-between font-semibold">
                    <span>Shipping</span>
                    <span>₹{order.shipping}</span>
                </div>

                <div className="flex justify-between font-semibold">
                    <span>Shipping Address</span>
                    <span>{order.shippingAddress.name}</span>
                    <span>{order.shippingAddress.addressLine1}</span>
                    <span>{order.shippingAddress.city}</span>
                    <span>{order.shippingAddress.state}</span>
                    <span>{order.shippingAddress.postalCode}</span>
                    <span>{order.shippingAddress.country}</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span>Order Status</span>
                    <span>{order.status}</span>
                </div>
                <hr />


                <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{order.total}</span>
                </div>

            </div>

            <div className="flex gap-4">
                <Link to="/orders" className="text-primary underline">
                    View My Orders
                </Link>

                <Link to="/products" className="text-primary underline">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default CheckoutSuccess;