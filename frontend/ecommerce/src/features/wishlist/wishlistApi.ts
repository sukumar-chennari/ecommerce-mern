import { api } from "../../app/api";

import type { ApiResponse } from "../products/productApi";

export const wishlistApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getWishlist: builder.query<any, void>({
            query: () => "/wishlist",
            transformResponse: (response: ApiResponse<{ wishlist: any[] }>) => response.data.wishlist,
            providesTags: ["Wishlist"],
        }),

        toggleWishlist: builder.mutation<void, string>({
            query: (productId) => ({
                url: `/wishlist`,
                method: "POST",
                body: { productId },
            }),
            // toggle might return "Added" (with item) or "Removed" (null data)
            // Backend returns: 
            // Add: ApiResponse.success(res, "Added to wishlist", { wishlistItem }, 201);
            // Remove: ApiResponse.success(res, "Removed from wishlist");
            // So we don't necessarily need the data for the mutation result usually, unless we want to update cache optimistically.
            // For now, let's just return void/null as the mutation result type is void.
            invalidatesTags: ["Wishlist"],
        }),
    }),
});

export const {
    useGetWishlistQuery,
    useToggleWishlistMutation,
} = wishlistApi;