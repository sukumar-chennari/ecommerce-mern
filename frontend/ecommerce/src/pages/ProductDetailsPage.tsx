import { useParams } from "react-router-dom";
import { useGetProductBySlugQuery, useGetProductsQuery } from "../features/products/productApi";
import { useAddToCartMutation } from "../features/cart/cartApi";
import { useGetProductReviewsQuery } from "../features/reviews/reviewApi";
import ProductCard from "../components/products/ProductCard";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

const ProductDetailsPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: product, isLoading, error } = useGetProductBySlugQuery(slug!);
    const { data: reviewData } = useGetProductReviewsQuery(product?._id!);
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
    const { data: relatedData } = useGetProductsQuery(
        { category: product?.category || "", limit: 5 },
        { skip: !product?.category }
    );

    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    const relatedProducts = relatedData?.products?.filter((p) => p._id !== product?._id).slice(0, 4) || [];

    const handleAddToCart = async () => {
        try {
            await addToCart({ productId: product!._id, quantity }).unwrap();
            toast.success("Added to cart");
        } catch (err) {
            toast.error("Failed to add to cart");
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !product) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-2xl font-bold text-textPrimary">Product Not Found</h2>
            <p className="text-textMuted mt-2">The product you're looking for doesn't exist or has been removed.</p>
            <Button variant="outline" className="mt-6" onClick={() => window.history.back()}>Go Back</Button>
        </div>
    );

    return (
        <div className="space-y-16 pb-20 animate-in fade-in duration-700">
            {/* Main Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
                {/* Image Gallery */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative group">
                        {product.images?.[activeImage] ? (
                            <img
                                src={product.images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">No Image</div>
                        )}
                        
                        {product.stock === 0 && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <Badge variant="danger" className="scale-150">Out of Stock</Badge>
                            </div>
                        )}
                    </div>

                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 px-1">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`relative shrink-0 w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                                        activeImage === index ? "border-primary scale-105 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                                    }`}
                                >
                                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="lg:col-span-5 flex flex-col pt-4">
                    <div className="space-y-6">
                        <div className="space-y-2">
                           <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                           <h1 className="text-4xl md:text-5xl font-extrabold text-textPrimary leading-tight tracking-tight">
                               {product.name}
                           </h1>
                           <div className="flex items-center gap-4 pt-2">
                               <div className="flex items-center gap-1 text-yellow-500">
                                   {"★".repeat(Math.round(product.averageRating || 0))}
                                   <span className="text-gray-300">{"★".repeat(5 - Math.round(product.averageRating || 0))}</span>
                               </div>
                               <span className="text-xs font-bold text-textMuted uppercase tracking-widest">
                                   {reviewData?.reviews.length || 0} Customer Reviews
                               </span>
                           </div>
                        </div>

                        <div className="text-4xl font-extrabold text-primary">
                            ₹{product.price.toLocaleString()}
                        </div>

                        <p className="text-textMuted leading-relaxed text-lg">
                            {product.description}
                        </p>

                        <div className="h-[1px] bg-gray-100 my-8"></div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest ml-1">Quantity</label>
                                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1 shadow-sm">
                                        <button 
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-textPrimary hover:text-primary transition-colors font-bold"
                                        >
                                            −
                                        </button>
                                        <span className="w-12 text-center text-sm font-bold text-textPrimary">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                            className="w-10 h-10 flex items-center justify-center text-textPrimary hover:text-primary transition-colors font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1 pt-5 text-right">
                                    {product.stock > 0 ? (
                                        <span className="text-xs font-bold text-accent uppercase tracking-widest">In Stock ({product.stock} units)</span>
                                    ) : (
                                        <span className="text-xs font-bold text-danger uppercase tracking-widest">Unavailable</span>
                                    )}
                                </div>
                            </div>

                            <Button 
                                className="w-full py-5 text-base shadow-2xl" 
                                disabled={product.stock === 0 || isAddingToCart}
                                onClick={handleAddToCart}
                                isLoading={isAddingToCart}
                            >
                                {product.stock === 0 ? "Out of Stock" : "Add to Shopping Cart"}
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-textMuted uppercase tracking-tighter">Shipping</p>
                                    <p className="text-xs font-bold text-textPrimary">Free Worldwide</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-textMuted uppercase tracking-tighter">Security</p>
                                    <p className="text-xs font-bold text-textPrimary">2 Year Warranty</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="space-y-10 pt-16 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-extrabold text-textPrimary tracking-tight">You May Also Like</h2>
                        <Button variant="ghost" size="sm">View Collection →</Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* Reviews Section */}
            <section className="space-y-10 pt-16 border-t border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="text-3xl font-extrabold text-textPrimary tracking-tight">Customer Experience</h2>
                    <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-1 text-yellow-500 text-xl font-extrabold">
                            <span>{product.averageRating?.toFixed(1) || "0.0"}</span>
                            <span className="text-lg">★</span>
                        </div>
                        <div className="h-6 w-[1px] bg-gray-200"></div>
                        <span className="text-xs font-bold text-textMuted uppercase tracking-widest">{reviewData?.reviews.length || 0} Total Reviews</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        {reviewData?.reviews.length === 0 ? (
                            <div className="bg-gray-50/50 rounded-3xl p-16 text-center border border-dashed border-gray-200">
                                <p className="text-textMuted font-medium">Be the first to share your thoughts on this product.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviewData?.reviews.map((review) => (
                                    <Card key={review._id} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                    {review.userId.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-textPrimary">{review.userId.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                                {"★".repeat(review.rating)}
                                            </div>
                                        </div>
                                        <p className="text-sm text-textMuted leading-relaxed italic line-clamp-3">"{review.comment}"</p>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-primary/5 border-primary/10">
                            <h3 className="font-bold text-primary mb-4">Quality Guarantee</h3>
                            <p className="text-xs text-textPrimary leading-relaxed mb-6">
                                We stand by the quality of our products. If you are not completely satisfied, we offer a 30-day money back guarantee.
                            </p>
                            <Button variant="primary" className="w-full shadow-lg shadow-primary/20">Write a Review</Button>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductDetailsPage;