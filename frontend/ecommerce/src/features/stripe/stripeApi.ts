import { api } from "../../app/api";

export const stripeApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createCheckoutSession: builder.mutation<
            { url: string },
            { orderId: string }
        >({
            query: (orderId) => ({
                url: "/stripe/create-session",
                method: "POST",
                body: orderId,
            }),
        }),

    }),
});

export const { useCreateCheckoutSessionMutation } = stripeApi;