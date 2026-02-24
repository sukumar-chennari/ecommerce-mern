const ProductCardSkeleton = () => {
    return (
        <div className="bg-surface rounded-2xl shadow-card overflow-hidden animate-pulse">
            <div className="h-56 bg-gray-200" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
        </div>
    );
};

export default ProductCardSkeleton;