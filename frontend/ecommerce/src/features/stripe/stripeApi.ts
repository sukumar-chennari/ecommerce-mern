import { api } from "../../app/api";

import type { ApiResponse } from "../products/productApi";

export const stripeApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createCheckoutSession: builder.mutation<
            { url: string; id: string },
            { orderId: string }
        >({
            query: (orderId) => ({
                url: "/stripe/create-session",
                method: "POST",
                body: orderId,
            }),
            transformResponse: (response: ApiResponse<{ url: string; id: string }>) => response.data,
        }),

    }),
});

export const { useCreateCheckoutSessionMutation } = stripeApi;