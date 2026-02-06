import { api } from "../../app/api";

export const ordersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<any, void, { url: string }>({
            query: () => ({
                url: "/orders",
                method: "POST",
                body: {},
            }),



            invalidatesTags: ["Cart"],
        }),

        getOrderByStripeSession: builder.query<any, string>({
            query: (sessionId) => `/orders/stripe/${sessionId}`,
            providesTags: ["Order"],
        }),

        getMyOrders: builder.query<{
            orders: any[];
            page: number;
            totalPages: number;
        }, { page: number }>({
            query: ({ page = 1 }) => `/orders?page=${page}`,
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
        }),
    }),
});

export const { useCreateOrderMutation, useGetOrderByStripeSessionQuery, useGetMyOrdersQuery, useGetOrderByIdQuery } = ordersApi;
