import { useGetCartQuery } from "../features/cart/cartApi";
import { useCreateOrderMutation } from "../features/orders/ordersApi";
import { useCreateCheckoutSessionMutation } from "../features/stripe/stripeApi";

const CheckoutPage = () => {
    const { data, isLoading } = useGetCartQuery();
    const [createSession, { isLoading: isPaying }] = useCreateCheckoutSessionMutation();
    const [createOrder] = useCreateOrderMutation();
    console.log('checkout page data', data)

    const handlePay = async () => {
        // 1️⃣ Create Order
        const orderRes = await createOrder().unwrap();
        const orderId = orderRes.order._id;

        // 2️⃣ Create Stripe Session with orderId
        const stripeRes = await createSession({ orderId }).unwrap();

        // 3️⃣ Redirect
        window.location.href = stripeRes.url;
    };



    if (isLoading) return <div className="p-6">Loading checkout...</div>;

    if (!data || data.items.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-bold">Checkout</h1>
                <p className="mt-4 text-gray-500">Your cart is empty</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            <div className="space-y-4">
                {data.items.map((item: any) => (
                    <div key={item.productId} className="flex justify-between">
                        <span>
                            {item.product.name} × {item.quantity}
                        </span>
                        <span>₹{item.product.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={handlePay}
                disabled={isPaying}
                className="mt-8 w-full bg-primary text-white py-3 rounded-xl disabled:opacity-50"
            >
                {isPaying ? "Redirecting..." : "Pay with Stripe"}
            </button>
        </div>


    );
};

export default CheckoutPage;