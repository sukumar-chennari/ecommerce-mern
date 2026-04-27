import AdminCard from "../components/AdminCard";
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
    AreaChart,
    Area,
} from "recharts";

const AdminDashboard = () => {
    const { data: revenue, isLoading: isRevLoading } = useGetRevenueAnalyticsQuery();
    const { data: status, isLoading: isStatusLoading } = useGetOrderStatusAnalyticsQuery();
    const { data: topProducts, isLoading: isTopLoading } = useGetTopProductsQuery();

    const revenueTrend =
        revenue?.breakdown?.map((item: any) => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day || 1).padStart(2, "0")}`,
            revenue: item.totalRevenue,
        })) || [];

    const stats = [
        {
            title: "Total Revenue",
            value: `₹${revenue?.totalRevenue?.toLocaleString() || 0}`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            trend: { value: 12, isUp: true }
        },
        {
            title: "Total Orders",
            value: status?.totalOrders || 0,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            trend: { value: 8, isUp: true }
        },
        {
            title: "Paid Orders",
            value: status?.raw?.find((s: any) => s.status === 'paid')?.count || 0,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            trend: { value: 5, isUp: true }
        },
        {
            title: "Pending Orders",
            value: status?.raw?.find((s: any) => s.status === 'pending')?.count || 0,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            trend: { value: 2, isUp: false }
        }
    ];

    if (isRevLoading || isStatusLoading || isTopLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Dashboard Overview</h1>
                <p className="text-sm text-textMuted mt-1">Real-time store performance analytics and metrics.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <AdminCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-surface p-8 rounded-2xl shadow-card border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="font-bold text-textPrimary">Revenue Performance</h2>
                        <select className="bg-gray-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none">
                            <option>Last 30 Days</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#64748B'}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#64748B'}}
                                />
                                <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-surface p-8 rounded-2xl shadow-card border border-gray-100 flex flex-col">
                    <h2 className="font-bold text-textPrimary mb-6">Top Sellers</h2>
                    <div className="space-y-6 flex-1">
                        {(topProducts?.topProducts || []).slice(0, 5).map((product: any, i: number) => (
                            <div key={product.productId} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-primary text-sm border border-gray-100">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-textPrimary truncate">{product.name}</p>
                                    <p className="text-xs text-textMuted">{product.totalQuantitySold} units sold</p>
                                </div>
                                <div className="text-xs font-bold text-accent">
                                    ₹{(product.totalQuantitySold * 999).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-8 w-full py-3 bg-gray-50 text-textPrimary text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors">
                        View All Products
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;