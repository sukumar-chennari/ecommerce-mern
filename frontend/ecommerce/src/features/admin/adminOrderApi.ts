import { api } from "../../app/api";

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
        }),

        getAdminOrderById: builder.query<any, string>({
            query: (id) => `/admin/orders/${id}`,
        }),

        updateOrderStatus: builder.mutation<
            any,
            { orderId: string; status: string; tracking?: any }
        >({
            query: (body) => ({
                url: "/admin/orders/status",
                method: "PATCH",
                body,
            }),
        }),
    }),
});

export const {
    useGetAdminOrdersQuery,
    useGetAdminOrderByIdQuery,
    useUpdateOrderStatusMutation,
} = adminOrderApi;