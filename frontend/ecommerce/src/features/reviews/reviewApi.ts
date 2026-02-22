import { api } from "../../app/api";

import type { ApiResponse } from "../products/productApi";

export const reviewApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createReview: builder.mutation<
            { review: any },
            { productId: string; rating: number; comment: string }
        >({
            query: (body) => ({
                url: "/reviews",
                method: "POST",
                body,
            }),
            transformResponse: (response: ApiResponse<{ review: any }>) => response.data,
            invalidatesTags: ["Product"],
        }),
        getProductReviews: builder.query<
            { reviews: any[] },
            string
        >({
            query: (productId) => `/reviews/product/${productId}`,
            transformResponse: (response: ApiResponse<{ reviews: any[] }>) => response.data,
        }),
    }),
});

export const { useCreateReviewMutation, useGetProductReviewsQuery } = reviewApi;