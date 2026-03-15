import { Link } from "react-router-dom";
import {
    useGetCartQuery,
    useUpdateCartItemMutation,
    useRemoveCartItemMutation,
} from "../features/cart/cartApi";

const CartPage = () => {
    const { data, isLoading } = useGetCartQuery();
    const [updateItem] = useUpdateCartItemMutation();
    const [removeItem] = useRemoveCartItemMutation();

    if (isLoading) return <div className="p-6">Loading cart...</div>;

    console.log('cart page data', data)
    if (!data || data.items.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Your Cart</h1>
                <p className="mt-4 text-gray-500">Your cart is empty</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl">

            <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

            <div className="space-y-4">
                {data.items.map((item: any) => (
                    <div
                        key={item.product?._id}
                        className="flex justify-between items-center border p-4 rounded-xl"
                    >
                        <div>
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-sm text-gray-500">₹{item.product?.price}</p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3">
                            <button
                                className="px-3 py-1 border rounded"
                                disabled={item.quantity <= 1}
                                onClick={() =>
                                    updateItem({
                                        productId: item.product._id,
                                        quantity: item.quantity - 1,
                                    })
                                }
                            >
                                −
                            </button>

                            <span>{item.quantity}</span>

                            <button
                                className="px-3 py-1 border rounded"
                                onClick={() =>
                                    updateItem({
                                        productId: item.product._id,
                                        quantity: item.quantity + 1,
                                    })
                                }
                            >
                                +
                            </button>
                        </div>

                        {/* Remove */}
                        <button
                            onClick={() => removeItem(item.product._id)}
                            className="text-red-500 text-sm"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Subtotal */}
            <div className="mt-8 flex justify-between font-semibold text-lg">
                <span>Subtotal</span>
                <span>₹{data?.subtotal}</span>
            </div>

            <Link to="/checkout">
                <button className="mt-6 w-full bg-primary text-white py-3 rounded-xl">
                    Proceed to Checkout
                </button>
            </Link>
        </div>
    );
};

export default CartPage;