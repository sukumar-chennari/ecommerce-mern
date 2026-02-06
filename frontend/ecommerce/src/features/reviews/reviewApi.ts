import { api } from "../../app/api";

export const reviewApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createReview: builder.mutation<any, { productId: string; rating: number; comment: string }>(
            {
                query: ({ productId, rating, comment }) => ({
                    url: "/reviews",
                    method: "POST",
                    body: { productId, rating, comment },
                }),
                invalidatesTags: ["Product"],
            }
        ),
    }),
});

export const { useCreateReviewMutation } = reviewApi;   