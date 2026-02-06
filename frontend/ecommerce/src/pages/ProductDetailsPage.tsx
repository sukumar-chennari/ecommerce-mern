import { useParams } from "react-router-dom";
import { useGetProductBySlugQuery } from "../features/products/productApi";
import { useState } from "react";
import { useAddToCartMutation } from "../features/cart/cartApi";

const ProductDetailsPage = () => {
    const { slug } = useParams<{ slug: string }>();

    const { data, isLoading, error } = useGetProductBySlugQuery(slug!);
    const [addToCart, { isLoading: isAddingToCart }] =
        useAddToCartMutation();

    const [quantity, setQuantity] = useState(1);

    if (isLoading) return <div className="p-6">Loading product...</div>;

    if (error || !data)
        return <div className="p-6 text-red-500">Product not found</div>;

    return (
        <div className="p-6 space-y-4 max-w-xl">
            <h1 className="text-3xl font-bold">{data.name}</h1>
            <p className="text-xl text-primary">₹{data.price}</p>

            <p className="text-gray-600">{data.description}</p>

            <div className="text-sm">
                Stock:{" "}
                <span className={data.stock > 0 ? "text-green-600" : "text-red-500"}>
                    {data.stock > 0 ? `${data.stock} available` : "Out of stock"}
                </span>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mt-4">
                <label className="font-medium">Qty</label>

                <input
                    type="number"
                    min={1}
                    max={data.stock}
                    value={quantity}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1 && val <= data.stock) {
                            setQuantity(val);
                        }
                    }}
                    className="w-20 border rounded px-2 py-1"
                />
            </div>

            {/* Add to cart */}
            <button
                disabled={data.stock === 0 || isAddingToCart}
                onClick={async () => {
                    await addToCart({
                        productId: data._id,
                        quantity,
                    }).unwrap();

                    alert("Added to cart");
                }}
                className="mt-6 px-6 py-3 bg-primary text-white rounded-xl disabled:opacity-50"
            >
                {data.stock === 0
                    ? "Out of Stock"
                    : isAddingToCart
                        ? "Adding..."
                        : "Add to Cart"}
            </button>
        </div>
    );
};

export default ProductDetailsPage;