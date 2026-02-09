import { useParams } from "react-router-dom";
import { useGetProductBySlugQuery } from "../features/products/productApi";
import { useState } from "react";
import { useAddToCartMutation } from "../features/cart/cartApi";
import { useCreateReviewMutation, useGetProductReviewsQuery } from "../features/reviews/reviewApi";

const ProductDetailsPage = () => {
    const { slug } = useParams<{ slug: string }>();

    const { data, isLoading, error } = useGetProductBySlugQuery(slug!);

    const { data: reviewData } = useGetProductReviewsQuery(data?._id!);
    const [createReview, { isLoading: isCreatingReview }] =
        useCreateReviewMutation();

    const [addToCart, { isLoading: isAddingToCart }] =
        useAddToCartMutation();

    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

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

            <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500 font-semibold">
                    ⭐ {data.averageRating?.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                    ({data.reviewCount} reviews)
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


            <form
                className="mt-6 space-y-3"
                onSubmit={async (e) => {
                    e.preventDefault();
                    await createReview({
                        productId: data._id,
                        rating,
                        comment,
                    }).unwrap();

                    setComment("");
                    alert("Review submitted");
                }}
            >
                <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="border p-2 rounded"
                >
                    {[1, 2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>
                            {r} Star
                        </option>
                    ))}
                </select>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your review"
                    className="border p-2 rounded w-full"
                    required
                />

                <button
                    disabled={isLoading}
                    className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    Submit Review
                </button>
            </form>



            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>

                {reviewData?.reviews.length === 0 && (
                    <p className="text-gray-500">No reviews yet</p>
                )}

                {reviewData?.reviews.map((review) => (
                    <div
                        key={review._id}
                        className="border-b py-4 space-y-1"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{review.userId.name}</span>
                            <span className="text-yellow-500">
                                ⭐ {review.rating}
                            </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                    </div>
                ))}
            </div>

        </div>



    );
};

export default ProductDetailsPage;