import {
    useGetRevenueAnalyticsQuery,
    useGetOrderStatusAnalyticsQuery,
    useGetTopProductsQuery,
} from "../../../features/admin/adminOrderApi";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
    pending: "#F59E0B",
    paid: "#2563EB",
    shipped: "#22C55E",
    delivered: "#10B981",
    cancelled: "#EF4444",
};


const AdminDashboard = () => {
    const { data: revenue } = useGetRevenueAnalyticsQuery();
    const { data: status } = useGetOrderStatusAnalyticsQuery();
    const { data: topProducts } = useGetTopProductsQuery();

    const revenueTrend =
        revenue?.breakdown?.map((item: any) => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day || 1).padStart(2, "0")}`,
            revenue: item.totalRevenue,
        })) || [];

    console.log(' reviuenve ', revenue)
    return (
        <div className="p-6 space-y-10">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>

            {/* Revenue Card */}
            <div className="bg-surface p-6 rounded-2xl shadow-card">
                <h2 className="text-lg font-semibold">Total Revenue</h2>
                <p className="text-3xl font-bold text-primary">
                    ₹{revenue?.totalRevenue || 0}
                </p>
            </div>

            {/* Revenue Chart */}
            <div className="bg-surface p-6 rounded-2xl shadow-card h-80">
                <h2 className="mb-4 font-semibold">Revenue Trend</h2>

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrend}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#2563EB"
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Order Status Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Order Status Pie */}
                <div className="bg-surface p-6 rounded-2xl shadow-card">
                    <h2 className="mb-4 font-semibold">Order Status</h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={status?.raw || []}
                                dataKey="count"
                                nameKey="status"
                                outerRadius={90}
                                label={({ percent = 0 }) =>
                                    `${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {(status?.raw || []).map((entry: any, index: number) => (
                                    <Cell
                                        key={index}
                                        fill={STATUS_COLORS[entry.status] || "#94A3B8"}
                                    />
                                ))}
                            </Pie>

                            <Tooltip />
                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Trend Line */}
                <div className="bg-surface p-6 rounded-2xl shadow-card">
                    <h2 className="mb-4 font-semibold">Revenue Trend</h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenue?.breakdown || []}>
                            <XAxis dataKey="_id.day" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="totalRevenue"
                                stroke="#2563EB"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>

            {/* Top Products */}
            <div className="bg-surface p-6 rounded-2xl shadow-card">
                <h2 className="mb-4 font-semibold">Top Products</h2>
                {(topProducts?.topProducts || []).map((product: any) => (
                    <div
                        key={product.productId}
                        className="flex justify-between border-b py-2"
                    >
                        <span>{product.name}</span>
                        <span>{product.totalQuantitySold} sold</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;