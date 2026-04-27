import { Link, useNavigate } from "react-router-dom";
import {
    useGetCartQuery,
    useUpdateCartItemMutation,
    useRemoveCartItemMutation,
} from "../features/cart/cartApi";
import { toast } from "react-hot-toast";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const CartPage = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useGetCartQuery();
    const [updateItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
    const [removeItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();

    const handleUpdateQuantity = async (productId: string, quantity: number) => {
        try {
            await updateItem({ productId, quantity }).unwrap();
        } catch (err) {
            toast.error("Failed to update quantity");
        }
    };

    const handleRemoveItem = async (productId: string) => {
        try {
            await removeItem(productId).unwrap();
            toast.success("Item removed from cart");
        } catch (err) {
            toast.error("Failed to remove item");
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!data || data.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Your cart is empty</h1>
                <p className="text-textMuted mt-2 max-w-xs">Looks like you haven't added anything to your cart yet. Let's find something amazing for you!</p>
                <Link to="/products" className="mt-10">
                    <Button size="lg" className="shadow-2xl shadow-primary/30">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Shopping Cart</h1>
                <p className="text-sm text-textMuted font-medium">Review your items before proceeding to checkout.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Cart Items */}
                <div className="lg:col-span-8 space-y-6">
                    {data.items.map((item: any) => (
                        <Card key={item.product?._id} noPadding className="flex items-center gap-6 group p-4 sm:p-6">
                            <div className="w-24 sm:w-32 aspect-square bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                                {item.product?.images?.[0] ? (
                                    <img 
                                        src={item.product.images[0]} 
                                        alt={item.product.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300">No Image</div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-1">
                                <Link to={`/products/${item.product?.slug}`} className="text-lg font-bold text-textPrimary hover:text-primary transition-colors truncate block">
                                    {item.product?.name}
                                </Link>
                                <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{item.product?.category}</p>
                                <p className="text-primary font-extrabold pt-2">₹{item.product?.price.toLocaleString()}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-0.5 shadow-sm">
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center text-textMuted hover:text-primary transition-colors disabled:opacity-20"
                                        disabled={item.quantity <= 1 || isUpdating}
                                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-textPrimary">{item.quantity}</span>
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center text-textMuted hover:text-primary transition-colors disabled:opacity-20"
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>

                                <button 
                                    className="p-2.5 text-textMuted hover:text-danger hover:bg-danger/5 rounded-xl transition-all"
                                    onClick={() => handleRemoveItem(item.product._id)}
                                    disabled={isRemoving}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-4 sticky top-28">
                    <Card className="space-y-6 bg-gray-50/50">
                        <h3 className="text-xl font-bold text-textPrimary">Order Summary</h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted font-medium">Subtotal</span>
                                <span className="text-textPrimary font-bold">₹{data.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted font-medium">Shipping</span>
                                <span className="text-accent font-bold uppercase tracking-widest text-[10px]">Calculated at next step</span>
                            </div>
                            <div className="h-[1px] bg-gray-100 my-2"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-lg font-bold text-textPrimary">Est. Total</span>
                                <span className="text-2xl font-extrabold text-primary">₹{data.subtotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <Button 
                            className="w-full py-5 text-sm uppercase tracking-widest shadow-2xl shadow-primary/20" 
                            onClick={() => navigate("/checkout")}
                        >
                            Checkout Now
                        </Button>
                        
                        <div className="flex items-center justify-center gap-3 pt-2 grayscale opacity-40">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
                             <div className="w-[1px] h-3 bg-gray-300"></div>
                             <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Secure Payment</span>
                        </div>
                    </Card>
                    
                    <Link to="/products" className="block text-center mt-6 text-xs font-bold text-textMuted hover:text-primary transition-colors underline underline-offset-4">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CartPage;