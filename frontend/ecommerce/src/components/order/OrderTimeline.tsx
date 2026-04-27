import React from "react";

interface TimelineProps {
    ordered: boolean;
    paid: boolean;
    shipped: boolean;
    delivered: boolean;
}

const OrderTimeline = ({
    ordered,
    paid,
    shipped,
    delivered,
}: TimelineProps) => {
    const steps = [
        { label: "Ordered", completed: ordered },
        { label: "Paid", completed: paid },
        { label: "Shipped", completed: shipped },
        { label: "Delivered", completed: delivered },
    ];

    return (
        <div className="relative flex items-center justify-between w-full max-w-xl mx-auto py-8">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
            
            {steps.map((step, index) => (
                <div key={index} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-700 ${
                        step.completed 
                            ? "bg-accent text-white" 
                            : index === steps.findIndex(s => !s.completed)
                                ? "bg-primary text-white scale-110"
                                : "bg-gray-100 text-gray-400"
                    }`}>
                        {step.completed ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <span className="text-[10px] font-bold">{index + 1}</span>
                        )}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        step.completed ? "text-accent" : "text-textMuted"
                    }`}>
                        {step.label}
                    </span>
                </div>
            ))}
            
            {/* Active Progress Bar Overlay */}
            <div 
                className="absolute top-1/2 left-0 h-0.5 bg-accent -translate-y-1/2 z-0 transition-all duration-1000 origin-left"
                style={{ width: `${(steps.filter(s => s.completed).length - 1) * (100 / (steps.length - 1))}%` }}
            ></div>
        </div>
    );
};

export default OrderTimeline;