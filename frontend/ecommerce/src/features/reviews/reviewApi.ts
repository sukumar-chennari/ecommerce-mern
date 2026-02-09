import { api } from "../../app/api";

export const reviewApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createReview: builder.mutation<
            { message: string },
            { productId: string; rating: number; comment: string }
        >({
            query: (body) => ({
                url: "/reviews",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Product"],
        }),
        getProductReviews: builder.query<
            { reviews: any[] },
            string
        >({
            query: (productId) => `/reviews/product/${productId}`,
        }),
    }),
});

export const { useCreateReviewMutation, useGetProductReviewsQuery } = reviewApi;