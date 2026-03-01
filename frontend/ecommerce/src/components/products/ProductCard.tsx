import { Link } from "react-router-dom";
import { memo } from "react";
import type { Product } from "../../features/products/productApi";
import { useToggleWishlistMutation } from "../../features/wishlist/wishlistApi";
import { useAddToCartMutation } from "../../features/cart/cartApi";
import ProductBadge from "../ui/ProductBadge";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);

interface Props {
  product: Product;
  wishlist?: string[];
}

const ProductCard = memo(({ product, wishlist = [] }: Props) => {
  const [toggleWishlist] = useToggleWishlistMutation();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  const isWishlisted = wishlist.includes(product._id);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group bg-surface rounded-2xl shadow-card overflow-hidden hover:shadow-xl transition-all duration-300">

      {/* IMAGE SECTION */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">

        <Link to={`/products/${product.slug}`}>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-textMuted">
              No Image
            </div>
          )}
        </Link>

        {/* Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-sm">
            Sold Out
          </div>
        )}

        {/* Badge (Status, New, Top rated) */}
        <ProductBadge product={product} />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur px-2 py-1 rounded-full shadow hover:bg-white transition"
        >
          {isWishlisted ? "❤️" : "🤍"}
        </button>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-4 space-y-3">

        {/* Title */}
        <Link
          to={`/products/${product.slug}`}
          className="block font-semibold text-textPrimary truncate hover:text-primary transition"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 text-yellow-500 text-sm">
          {"★".repeat(Math.round(product.averageRating || 0))}
          {"☆".repeat(5 - Math.round(product.averageRating || 0))}
          <span className="text-textMuted text-xs ml-1">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <p className="text-primary font-bold text-lg">
          {formatPrice(product.price)}
        </p>

        {/* Quick Add */}
        <button
          disabled={isOutOfStock || isAdding}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart({ productId: product._id, quantity: 1 });
          }}
          className="w-full mt-2 bg-primary text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
        >
          {isOutOfStock
            ? "Sold Out"
            : isAdding
              ? "Adding..."
              : "Add to Cart"}
        </button>
      </div>
    </div>
  );
});

export default ProductCard;