import { useGetCartQuery } from "../features/cart/cartApi";
import { useCreateOrderMutation } from "../features/orders/ordersApi";
import { useCreateCheckoutSessionMutation } from "../features/stripe/stripeApi";
import { useState } from "react";
const CheckoutPage = () => {
    const { data, isLoading } = useGetCartQuery();
    const [address, setAddress] = useState({
        name: "",
        addressLine1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India"
    });
    const [createSession, { isLoading: isPaying }] = useCreateCheckoutSessionMutation();
    const [createOrder] = useCreateOrderMutation();
    console.log('checkout page data', data)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        });
    };


    const handlePay = async () => {
        if (!address.name || !address.addressLine1 || !address.city) {
            alert("Please fill shipping address");
            return;
        }

        // 1️⃣ Create Order
        const orderRes = await createOrder({
            shippingAddress: address
        }).unwrap();
        console.log('orderRes', orderRes.order)
        const orderId = orderRes._id;

        // 2️⃣ Create Stripe Session with orderId
        const stripeRes = await createSession({ orderId }).unwrap();
        console.log('stripeRes', stripeRes)

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
            <div className="space-y-4 mb-6">

                <input
                    name="name"
                    placeholder="Full Name"
                    onChange={handleChange}
                    className="border p-2 w-full"
                />

                <input
                    name="addressLine1"
                    placeholder="Address"
                    onChange={handleChange}
                    className="border p-2 w-full"
                />

                <input
                    name="city"
                    placeholder="City"
                    onChange={handleChange}
                    className="border p-2 w-full"
                />

                <input
                    name="state"
                    placeholder="State"
                    onChange={handleChange}
                    className="border p-2 w-full"
                />

                <input
                    name="postalCode"
                    placeholder="Postal Code"
                    onChange={handleChange}
                    className="border p-2 w-full"
                />

            </div>
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
                disabled={isPaying || isLoading}
                className="mt-8 w-full bg-primary text-white py-3 rounded-xl disabled:opacity-50"
            >
                {isPaying ? "Redirecting..." : "Pay with Stripe"}
            </button>
        </div>


    );
};

export default CheckoutPage;