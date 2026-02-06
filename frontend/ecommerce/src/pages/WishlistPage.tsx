import { useGetWishlistQuery } from "../features/wishlist/wishlistApi";

const WishlistPage = () => {
    const { data, isLoading } = useGetWishlistQuery();

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (!data || data.wishlist?.length === 0)
        return <div className="p-6">Wishlist is empty</div>;

    return (
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.wishlist?.map((p: any) => (
                <div key={p.productId._id} className="bg-surface shadow-card p-3 rounded-xl">
                    <img src={p.productId.image} alt={p.productId.name} className="rounded mb-2" />
                    <h3 className="font-medium">{p.productId.name}</h3>
                    <p className="text-primary">₹{p.productId.price}</p>
                </div>
            ))}
        </div>
    );
};

export default WishlistPage;