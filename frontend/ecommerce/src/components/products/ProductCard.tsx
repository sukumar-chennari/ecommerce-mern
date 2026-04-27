import { Link } from "react-router-dom";
import { memo } from "react";
import type { Product } from "../../features/products/productApi";
import { useToggleWishlistMutation } from "../../features/wishlist/wishlistApi";
import { useAddToCartMutation } from "../../features/cart/cartApi";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import { toast } from "react-hot-toast";

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(product._id).unwrap();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <Card noPadding className="group flex flex-col h-full animate-in fade-in duration-500">
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
        <Link to={`/products/${product.slug}`} className="block h-full">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-textMuted bg-gray-100">
              <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOutOfStock && <Badge variant="danger">Sold Out</Badge>}
          {product.stock > 0 && product.stock < 10 && <Badge variant="warning">Low Stock</Badge>}
        </div>

        {/* Wishlist Toggle */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md shadow-lg transition-all duration-300 ${
            isWishlisted 
              ? 'bg-danger text-white scale-110' 
              : 'bg-white/80 text-textPrimary hover:bg-white hover:scale-110'
          }`}
        >
          <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick View / Hover Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
             <Link to={`/products/${product.slug}`}>
                 <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 backdrop-blur-md hover:bg-white hover:text-primary" size="sm">
                     Quick View
                 </Button>
             </Link>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <Link 
            to={`/products/${product.slug}`}
            className="text-sm font-bold text-textPrimary hover:text-primary transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">{product.category}</p>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-lg font-extrabold text-primary">
            {formatPrice(product.price)}
          </span>
          
          <button 
            disabled={isOutOfStock || isAdding}
            onClick={handleAddToCart}
            className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-primary/10 disabled:hover:text-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
});

export default ProductCard;