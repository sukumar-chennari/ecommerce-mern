import { Link } from "react-router-dom";
import type { Product } from "../../features/products/productApi";
import { useToggleWishlistMutation } from "../../features/wishlist/wishlistApi";

const ProductCard = ({ product }: { product: Product }) => {
  const [toggleWishlist] = useToggleWishlistMutation();

  return (
    <div className="group bg-surface rounded-2xl shadow-card overflow-hidden hover:shadow-xl transition-all duration-300">

      {/* IMAGE SECTION */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">

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

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product._id)}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur px-2 py-1 rounded-full shadow hover:bg-white transition"
        >
          ❤️
        </button>
      </div>

      {/* CONTENT */}
      <Link to={`/products/${product.slug}`} className="block p-4 space-y-2">

        <h3 className="font-semibold text-textPrimary truncate">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-yellow-500">
            ⭐ {product.averageRating || 0}
          </span>
          <span className="text-textMuted">
            ({product.reviewCount || 0})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-primary font-bold text-lg">
            ₹{product.price}
          </p>

          <span className="text-xs text-textMuted opacity-0 group-hover:opacity-100 transition">
            View →
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;