interface TimelineProps {
    ordered: boolean;
    paid: boolean;
    shipped: boolean;
    delivered: boolean;
}

const Step = ({
    label,
    active,
    completed,
}: {
    label: string;
    active: boolean;
    completed: boolean;
}) => {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`w-4 h-4 rounded-full ${completed
                        ? "bg-green-500"
                        : active
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                    }`}
            />
            <span
                className={`text-sm ${completed ? "text-green-600" : "text-textMuted"
                    }`}
            >
                {label}
            </span>
        </div>
    );
};

const OrderTimeline = ({
    ordered,
    paid,
    shipped,
    delivered,
}: TimelineProps) => {
    return (
        <div className="space-y-3">
            <Step label="Order Placed" completed={ordered} active={!ordered} />
            <Step label="Payment Confirmed" completed={paid} active={ordered && !paid} />
            <Step label="Shipped" completed={shipped} active={paid && !shipped} />
            <Step label="Delivered" completed={delivered} active={shipped && !delivered} />
        </div>
    );
};

export default OrderTimeline;