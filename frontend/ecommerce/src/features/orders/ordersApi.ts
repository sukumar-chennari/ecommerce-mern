import { api } from "../../app/api";

import type { ApiResponse } from "../products/productApi";

export const ordersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<
            { orderId: string },
            { shippingAddress: any }
        >({
            query: ({ shippingAddress }) => ({
                url: "/orders",
                method: "POST",
                body: { shippingAddress },
            }),
            transformResponse: (response: ApiResponse<{ orderId: string }>) =>
                response.data,
            invalidatesTags: ["Cart", "Order"],
        }),

        getOrderByStripeSession: builder.query<any, string>({
            query: (sessionId) => `/orders/stripe/${sessionId}`,
            transformResponse: (response: ApiResponse<{ order: any }>) => response.data.order,
            providesTags: ["Order"],
        }),

        getMyOrders: builder.query<{
            orders: any[];
            page: number;
            totalPages: number;
        }, { page: number }>({
            query: ({ page = 1 }) => `/orders?page=${page}`,
            transformResponse: (response: ApiResponse<{
                orders: any[];
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            }>) => response.data,
            providesTags: ["Order"],
        }),

        getOrderById: builder.query<
            {
                order: any;
                progress: {
                    ordered: boolean;
                    paid: boolean;
                    shipped: boolean;
                    delivered: boolean;
                };
                estimatedDelivery: string;
            },
            string
        >({
            query: (id) => `/orders/${id}`,
            transformResponse: (response: ApiResponse<{
                order: any;
                progress: any;
                estimatedDelivery: string;
                reviewEligibility: boolean;
            }>) => response.data,
        }),
    }),
});

export const { useCreateOrderMutation, useGetOrderByStripeSessionQuery, useGetMyOrdersQuery, useGetOrderByIdQuery } = ordersApi;
