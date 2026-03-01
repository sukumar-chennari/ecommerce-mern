interface BadgeProduct {
    stock: number;
    averageRating?: number;
    createdAt: string;
}

const ProductBadge = ({ product }: { product: BadgeProduct }) => {
    const isNew =
        Date.now() - new Date(product.createdAt).getTime() <
        7 * 24 * 60 * 60 * 1000;

    const isTopRated = (product.averageRating || 0) >= 4.5;

    // Priority 1: Out of Stock
    if (product.stock === 0) {
        return (
            <span className="absolute top-3 left-3 z-10 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                Out of Stock
            </span>
        );
    }

    // Priority 2: Low Stock
    if (product.stock > 0 && product.stock <= 5) {
        return (
            <span className="absolute top-3 left-3 z-10 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm border border-amber-400/50">
                Only {product.stock} Left
            </span>
        );
    }

    // Priority 3: New Arrival
    if (isNew) {
        return (
            <span className="absolute top-3 left-3 z-10 bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                New Arrival
            </span>
        );
    }

    // Priority 4: Top Rated
    if (isTopRated) {
        return (
            <span className="absolute top-3 left-3 z-10 bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                Top Rated
            </span>
        );
    }

    // Priority 5: In Stock (Optional, but user mentioned 'stock' status)
    if (product.stock > 5) {
        return (
            <span className="absolute top-3 left-3 z-10 bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                In Stock
            </span>
        );
    }

    return null;
};

export default ProductBadge;