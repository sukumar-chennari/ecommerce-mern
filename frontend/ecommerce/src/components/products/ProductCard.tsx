import type { Product } from "../../features/products/productApi";
import { useToggleWishlistMutation } from "../../features/wishlist/wishlistApi";

const ProductCard = ({ product }: { product: Product }) => {
  const [toggleWishlist] = useToggleWishlistMutation();
  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden hover:scale-[1.02] transition">
      <div className="h-48 bg-gray-100 flex items-center justify-center relative">
        <span className="text-textMuted">Image</span>
      </div>


      <div className="p-4 space-y-2">
        <h3 className="font-medium text-textPrimary truncate">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-yellow-500">
          ⭐ {product?.averageRating || "No ratings"}
          <span className="text-textMuted">
            ({product?.reviewCount})
          </span>
        </div>


        <p className="text-primary font-semibold">
          ₹ {product.price}
        </p>


        <button
          onClick={() => toggleWishlist(product._id)}
          className="top-6 right-6"
        >
          ❤️
        </button>
      </div>
    </div>
  );
};

export default ProductCard;