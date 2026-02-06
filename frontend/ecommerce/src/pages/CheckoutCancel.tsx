import { Link } from "react-router-dom";

const CheckoutCancel = () => {
    return (
        <div className="max-w-xl mx-auto p-6 text-center space-y-4">
            <h1 className="text-3xl font-bold text-red-500">
                Payment Cancelled ❌
            </h1>

            <p className="text-gray-600">
                Your payment was not completed. No money was charged.
            </p>

            <div className="flex justify-center gap-4 mt-6">
                <Link
                    to="/cart"
                    className="px-6 py-2 bg-primary text-white rounded-xl"
                >
                    Back to Cart
                </Link>

                <Link
                    to="/products"
                    className="px-6 py-2 border rounded-xl"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default CheckoutCancel;