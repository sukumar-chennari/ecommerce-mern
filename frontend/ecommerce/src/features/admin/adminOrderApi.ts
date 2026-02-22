import { api } from "../../app/api";
import type { ApiResponse } from "../products/productApi";

export const adminOrderApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAdminOrders: builder.query<
            {
                orders: any[];
                total: number;
                page: number;
                totalPages: number;
            },
            { status?: string; page?: number }
        >({
            query: ({ status, page = 1 }) => {
                const params = new URLSearchParams();
                params.set("page", page.toString());
                if (status) params.set("status", status);
                return `/admin/orders?${params.toString()}`;
            },
            transformResponse: (response: ApiResponse<{
                orders: any[];
                total: number;
                page: number;
                totalPages: number;
            }>) => response.data,
        }),

        getAdminOrderById: builder.query<any, string>({
            query: (id) => `/admin/orders/${id}`,
            transformResponse: (response: ApiResponse<{ order: any }>) => response.data,
        }),

        updateOrderStatus: builder.mutation<
            any,
            { orderId: string; status: string; tracking?: any }
        >({
            query: (body) => ({
                url: `/admin/orders/${body.orderId}/status`,
                method: "PATCH",
                body,
            }),
            transformResponse: (response: ApiResponse<{ order: any }>) => response.data.order,
        }),

        getRevenueAnalytics: builder.query<any, void>({
            query: () => "/admin/analytics/revenue",
            transformResponse: (
                response: ApiResponse<{ totalRevenue: number; dailyRevenue: any[] }>
            ) => response.data,
        }),
        getOrderStatusAnalytics: builder.query<any, void>({
            query: () => "/admin/analytics/orders",
            transformResponse: (
                response: ApiResponse<{ totalOrders: number; statusBreakdown: any[] }> // Assuming structure from adminAnalytics.controller
            ) => response.data,
        }),
        getTopProducts: builder.query<any, void>({
            query: () => "/admin/analytics/top-products",
            transformResponse: (
                response: ApiResponse<{ topProducts: any[] }>
            ) => response.data,
        }),
    }),
});

export const {
    useGetAdminOrdersQuery,
    useGetAdminOrderByIdQuery,
    useUpdateOrderStatusMutation,
    useGetRevenueAnalyticsQuery,
    useGetOrderStatusAnalyticsQuery,
    useGetTopProductsQuery,
} = adminOrderApi;