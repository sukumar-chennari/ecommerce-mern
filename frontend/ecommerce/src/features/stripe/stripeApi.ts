import { api } from "../../app/api";

import type { ApiResponse } from "../products/productApi";

export const stripeApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createCheckoutSession: builder.mutation<
            { url: string; id: string },
            { orderId: string }
        >({
            query: ({ orderId }) => ({
                url: "/stripe/create-session",
                method: "POST",
                body: { orderId },
            }),
            transformResponse: (response: ApiResponse<{ url: string; id: string }>) => response.data,
        }),

        verifyCheckoutSession: builder.query<
            { orderId?: string; success: boolean },
            string
        >({
            query: (sessionId) => `/stripe/verify-session?session_id=${sessionId}`,
            transformResponse: (response: ApiResponse<{ orderId?: string; success: boolean }>) => response.data,
            keepUnusedDataFor: 0,
        }),

    }),
});

export const { useCreateCheckoutSessionMutation, useVerifyCheckoutSessionQuery } = stripeApi;