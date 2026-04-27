import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

const CheckoutCancel = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in duration-700 pb-20">
            <div className="w-24 h-24 bg-danger/10 rounded-[2.5rem] flex items-center justify-center text-danger mb-10 shadow-xl shadow-danger/10">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            
            <div className="space-y-4 max-w-md">
                <h1 className="text-4xl font-extrabold text-textPrimary tracking-tight">Payment Cancelled</h1>
                <p className="text-textMuted font-medium leading-relaxed">
                    Your checkout session was cancelled. No charges were made to your account. You can return to your cart to review your items.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-sm">
                <Link to="/cart" className="flex-1">
                    <Button variant="primary" className="w-full py-4 shadow-xl shadow-primary/20">Back to Cart</Button>
                </Link>
                <Link to="/products" className="flex-1">
                    <Button variant="outline" className="w-full py-4">View Collection</Button>
                </Link>
            </div>
            
            <p className="mt-12 text-xs font-bold text-textMuted uppercase tracking-widest">Need assistance? <a href="#" className="text-primary hover:underline">Contact Support</a></p>
        </div>
    );
};

export default CheckoutCancel;