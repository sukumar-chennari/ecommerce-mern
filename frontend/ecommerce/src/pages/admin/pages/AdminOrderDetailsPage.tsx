import { useParams } from "react-router-dom";
import {
    useGetAdminOrderByIdQuery,
    useRefundOrderMutation,
    useUpdateOrderStatusMutation,
} from "../../../features/admin/adminOrderApi";


const nextStatusMap: any = {
    pending: "paid",
    paid: "shipped",
    shipped: "delivered",
};

const AdminOrderDetailsPage = () => {
    const { id } = useParams<{ id: string }>();

    console.log('from admin order details page', id);
    const { data, isLoading, refetch } = useGetAdminOrderByIdQuery(id!)
    const [refundOrder, { isLoading: refunding }] = useRefundOrderMutation();
    const [updateStatus, { isLoading: updating }] =
        useUpdateOrderStatusMutation();

    if (isLoading) return <div className="p-6">Loading order...</div>;
    if (!data) return <div className="p-6 text-red-500">Order not found</div>;

    const order = data.order;

    console.log("order details  ", order);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Order Details</h1>

            {/* Summary */}
            <div className="bg-white shadow-soft p-4 rounded-xl">
                <p><b>Order ID:</b> {order._id}</p>
                <p><b>User:</b> {order.userId.name} ({order.userId.email})</p>
                <p><b>Status:</b> <span className="capitalize">{order.status}</span></p>
                <p><b>Tax:</b> {order.tax}</p>
                <p><b>Total:</b> ₹{order.total}</p>
            </div>

            {/* Items */}
            <div className="bg-white shadow-soft p-4 rounded-xl">
                <h2 className="font-semibold mb-2">Items</h2>
                {order.items.map((item: any) => (
                    <div key={item._id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-3">
                            <img
                                src={item.image}
                                className="w-12 h-12 object-cover rounded"
                            />
                            <span>{item.name} × {item.quantity}</span>
                        </div>

                        <span>₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-4">

                {order.status === "paid" && (
                    <>
                        <button
                            disabled={updating || refunding}
                            onClick={async () => {
                                try {
                                    await updateStatus({
                                        orderId: order._id,
                                        status: "shipped",
                                    }).unwrap();
                                    refetch();
                                } catch (err: any) {
                                    alert(err?.data?.message || "Update failed");
                                }
                            }}
                            className="px-5 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                        >
                            {updating ? "Updating..." : "Mark as Shipped"}
                        </button>

                        <button
                            disabled={refunding || updating}
                            onClick={async () => {
                                const confirmRefund = window.confirm(
                                    "Are you sure you want to refund this order?"
                                );

                                if (!confirmRefund) return;

                                try {
                                    await refundOrder({ orderId: order._id }).unwrap();
                                    alert("Refund successful");
                                    refetch();
                                } catch (err: any) {
                                    alert(err?.data?.message || "Refund failed");
                                }
                            }}
                            className="px-5 py-2 bg-red-600 text-white rounded-xl disabled:opacity-50"
                        >
                            {refunding ? "Processing..." : "Refund Order"}
                        </button>
                    </>
                )}

                {order.status === "shipped" && (
                    <button
                        disabled={updating}
                        onClick={async () => {
                            try {
                                await updateStatus({
                                    orderId: order._id,
                                    status: "delivered",
                                }).unwrap();
                                refetch();
                            } catch (err: any) {
                                alert(err?.data?.message || "Update failed");
                            }
                        }}
                        className="px-5 py-2 bg-green-600 text-white rounded-xl disabled:opacity-50"
                    >
                        {updating ? "Updating..." : "Mark as Delivered"}
                    </button>
                )}

            </div>

            <div className="bg-white shadow-soft p-4 rounded-xl">
                <h2 className="font-semibold mb-2">Shipping Address</h2>

                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>{order.shippingAddress.city}</p>
                <p>{order.shippingAddress.postalCode}</p>
            </div>
            <p><b>Payment Method:</b> {order.payment.method}</p>
            <p><b>Payment Status:</b> {order.paymentStatus}</p>
            {order.status === "paid" && (
                <button
                    disabled={updating || refunding}
                    onClick={async () => {
                        const confirmRefund = window.confirm(
                            "Are you sure you want to refund this order?"
                        );

                        if (!confirmRefund) return;

                        try {
                            await refundOrder({ orderId: order._id }).unwrap();
                            alert("Refund successful");
                            refetch();
                        } catch (err: any) {
                            console.error(err);
                            alert(err?.data?.message || "Refund failed");
                        }
                    }}
                    className="px-5 py-2 bg-red-600 text-white rounded-xl disabled:opacity-50"
                >
                    {refunding ? "Processing..." : "Refund Order"}
                </button>
            )}
        </div>
    );
};

export default AdminOrderDetailsPage;