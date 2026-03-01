import { useParams } from "react-router-dom";
import { useGetProductBySlugQuery, useGetProductsQuery } from "../features/products/productApi";
import { useAddToCartMutation } from "../features/cart/cartApi";
import { useCreateReviewMutation, useGetProductReviewsQuery } from "../features/reviews/reviewApi";
import ProductCard from "../components/products/ProductCard";
import { useRef, useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";

const ProductDetailsPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const { showToast } = useToast();

    const { data, isLoading, error } = useGetProductBySlugQuery(slug!);

    const { data: reviewData } = useGetProductReviewsQuery(data?._id!);
    const [createReview, { isLoading: isCreatingReview }] =
        useCreateReviewMutation();

    const [addToCart, { isLoading: isAddingToCart }] =
        useAddToCartMutation();
    const { data: relatedData } = useGetProductsQuery(
        {
            category: data?.category || "",
            limit: 4,
        },
        {
            skip: !data?.category,
        }
    );

    const relatedProducts =
        relatedData?.products?.filter(
            (p) => p._id !== data?._id
        ) || [];

    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [activeImage, setActiveImage] = useState(0);
    const buySectionRef = useRef<HTMLDivElement | null>(null);
    const [showStickyBar, setShowStickyBar] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!buySectionRef.current) return;

            const rect = buySectionRef.current.getBoundingClientRect();

            // If buy section is above viewport
            if (rect.bottom < 0) {
                setShowStickyBar(true);
            } else {
                setShowStickyBar(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    if (isLoading) return <div className="p-6">Loading product...</div>;

    if (error || !data)
        return <div className="p-6 text-red-500">Product not found</div>;
    const totalReviews = data.reviewCount || 0;
    const breakdown = reviewData?.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* LEFT: IMAGE SECTION */}
                <div className="space-y-4">

                    {/* Main Image */}
                    <div className="h-96 bg-gray-100 rounded-2xl overflow-hidden">
                        {data.images?.[activeImage] ? (
                            <img
                                src={data.images[activeImage]}
                                alt={data.name}
                                className="w-full h-full object-cover transition duration-300"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {data.images && data.images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto">
                            {data.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`h-20 w-20 rounded-lg overflow-hidden border-2 ${activeImage === index
                                        ? "border-primary"
                                        : "border-transparent"
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`${data.name}-${index}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                </div>

                {/* RIGHT: PRODUCT INFO */}
                <div className="space-y-6">

                    <h1 className="text-4xl font-bold">{data.name}</h1>

                    {/* Rating Summary */}
                    <div className="flex items-center gap-3">
                        <span className="text-yellow-500 text-lg font-semibold">
                            ⭐ {data.averageRating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-gray-500">
                            ({totalReviews} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <p className="text-3xl font-bold text-primary">
                        ₹{data.price}
                    </p>

                    {/* Stock */}
                    <div>
                        {data.stock > 0 ? (
                            <span className="text-green-600 font-medium">
                                In Stock ({data.stock} available)
                            </span>
                        ) : (
                            <span className="text-red-600 font-medium">
                                Out of Stock
                            </span>
                        )}
                    </div>

                    {/* Quantity + Add to Cart */}
                    <div className="flex items-center gap-4">

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
                            className="w-24 border rounded px-3 py-2"
                        />

                        <div ref={buySectionRef}>
                            <button
                                disabled={data.stock === 0 || isAddingToCart}
                                onClick={async () => {
                                    try {
                                        await addToCart({
                                            productId: data._id,
                                            quantity,
                                        }).unwrap();
                                        showToast("Product added to cart", "success");
                                    } catch (error) {
                                        showToast("Failed to add product to cart", "error");
                                    }
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
                    </div>

                    {/* Description */}
                    <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {data.description}
                        </p>
                    </div>

                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

                {/* Left: Average Score */}
                <div className="flex flex-col items-center justify-center border rounded-2xl p-6">
                    <div className="text-5xl font-bold text-primary">
                        {data.averageRating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="text-yellow-500 text-lg mt-2">
                        {"★".repeat(Math.round(data.averageRating || 0))}
                        {"☆".repeat(5 - Math.round(data.averageRating || 0))}
                    </div>
                    <p className="text-gray-500 mt-2">
                        Based on {totalReviews} reviews
                    </p>
                </div>

                {/* Right: Breakdown Bars */}
                <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = breakdown[star];
                        const percentage =
                            totalReviews > 0
                                ? (count / totalReviews) * 100
                                : 0;

                        return (
                            <div key={star} className="flex items-center gap-3">
                                <span className="w-8 text-sm">{star}★</span>

                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                <span className="w-10 text-sm text-gray-500">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>

            </div>
            {/* Reviews Section */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6">
                    Customer Reviews
                </h2>

                {reviewData?.reviews.length === 0 && (
                    <p className="text-gray-500">No reviews yet</p>
                )}

                {reviewData?.reviews.map((review) => (
                    <div key={review._id} className="border-b py-6 space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="font-medium">
                                {review.userId.name}
                            </span>
                            <span className="text-yellow-500">
                                ⭐ {review.rating}
                            </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                    </div>
                ))}
            </div>

            {/* Related Products */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6">
                    You May Also Like
                </h2>

                {relatedProducts.length === 0 ? (
                    <p className="text-gray-500">
                        No related products found.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Sticky Add to Cart Bar (Mobile) */}
            {showStickyBar && data.stock > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex items-center justify-between md:hidden z-50">

                    <div>
                        <p className="font-semibold text-sm truncate max-w-[150px]">
                            {data.name}
                        </p>
                        <p className="text-primary font-bold">
                            ₹{data.price}
                        </p>
                    </div>

                    <button
                        onClick={async () => {
                            await addToCart({
                                productId: data._id,
                                quantity,
                            }).unwrap();
                        }}
                        className="bg-primary text-white px-6 py-2 rounded-lg"
                    >
                        Add to Cart
                    </button>

                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;