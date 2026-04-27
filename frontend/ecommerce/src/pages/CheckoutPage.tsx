import { useGetCartQuery } from "../features/cart/cartApi";
import { useCreateOrderMutation } from "../features/orders/ordersApi";
import { useCreateCheckoutSessionMutation } from "../features/stripe/stripeApi";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

const CheckoutPage = () => {
    const { data: cart, isLoading } = useGetCartQuery();
    const [address, setAddress] = useState({
        name: "",
        addressLine1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India"
    });
    const [createSession, { isLoading: isPaying }] = useCreateCheckoutSessionMutation();
    const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        });
    };

    const handlePay = async () => {
        if (!address.name || !address.addressLine1 || !address.city || !address.postalCode) {
            toast.error("Please fill in all required shipping fields");
            return;
        }

        try {
            // 1️⃣ Create Order
            const orderRes = await createOrder({
                shippingAddress: address
            }).unwrap();

            const orderId = orderRes.orderId;

            // 2️⃣ Create Stripe Session
            const stripeRes = await createSession({ orderId }).unwrap();

            // 3️⃣ Redirect
            window.location.href = stripeRes.url;
        } catch (err: any) {
            toast.error(err?.data?.message || "Checkout failed. Please try again.");
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!cart || cart.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700">
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Nothing to checkout</h1>
                <p className="text-textMuted mt-2">Your cart is empty. Please add items to your cart first.</p>
                <Button variant="outline" className="mt-8" onClick={() => window.history.back()}>Back to Shopping</Button>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="space-y-1 text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Checkout</h1>
                <p className="text-sm text-textMuted font-medium">Complete your purchase by providing your shipping details.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Shipping Form */}
                <div className="lg:col-span-7 space-y-8">
                    <Card className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">1</div>
                            <h2 className="text-xl font-bold text-textPrimary">Shipping Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Input 
                                    label="Full Name" 
                                    name="name" 
                                    placeholder="e.g. John Doe" 
                                    value={address.name}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Input 
                                    label="Shipping Address" 
                                    name="addressLine1" 
                                    placeholder="Street address, apartment, suite, etc." 
                                    value={address.addressLine1}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            <Input 
                                label="City" 
                                name="city" 
                                placeholder="e.g. Mumbai" 
                                value={address.city}
                                onChange={handleChange}
                                required 
                            />
                            <Input 
                                label="State / Province" 
                                name="state" 
                                placeholder="e.g. Maharashtra" 
                                value={address.state}
                                onChange={handleChange}
                                required 
                            />
                            <Input 
                                label="Postal Code" 
                                name="postalCode" 
                                placeholder="e.g. 400001" 
                                value={address.postalCode}
                                onChange={handleChange}
                                required 
                            />
                            <Input 
                                label="Country" 
                                name="country" 
                                value={address.country}
                                disabled
                                className="bg-gray-100 opacity-60 cursor-not-allowed"
                            />
                        </div>
                    </Card>

                    <Card className="bg-gray-50/50 border-dashed border-2 border-gray-200">
                        <div className="flex items-center gap-4 text-textMuted">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <p className="text-xs font-medium italic">Your payment is processed securely by Stripe. We do not store your card details on our servers.</p>
                        </div>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-5 sticky top-28">
                    <Card className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">2</div>
                            <h2 className="text-xl font-bold text-textPrimary">Review Order</h2>
                        </div>

                        <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {cart.items.map((item: any) => (
                                <div key={item.product?._id} className="flex justify-between items-start gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                            <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-textPrimary line-clamp-1">{item.product?.name}</p>
                                            <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-textPrimary shrink-0">₹{(item.product?.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted font-medium">Subtotal</span>
                                <span className="text-textPrimary font-bold">₹{cart.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-textMuted font-medium">Standard Shipping</span>
                                <span className="text-accent font-bold uppercase tracking-widest text-[10px]">FREE</span>
                            </div>
                            <div className="h-[1px] bg-gray-100 my-2"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-bold text-textPrimary">Order Total</span>
                                <span className="text-3xl font-extrabold text-primary">₹{cart.subtotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <Button 
                            className="w-full py-5 text-sm uppercase tracking-widest shadow-2xl shadow-primary/20" 
                            size="lg"
                            onClick={handlePay}
                            isLoading={isPaying || isCreatingOrder}
                        >
                            {isPaying ? "Opening Stripe..." : "Complete Purchase"}
                        </Button>
                        
                        <div className="flex flex-col items-center gap-4 pt-4">
                            <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Guaranteed Safe Checkout</p>
                            <div className="flex items-center gap-6 opacity-30 grayscale contrast-125">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;