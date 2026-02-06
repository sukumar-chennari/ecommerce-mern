import { api } from "../../app/api";

export const wishlistApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getWishlist: builder.query<any, void>({
            query: () => "/wishlist",
            providesTags: ["Wishlist"],
        }),

        toggleWishlist: builder.mutation<void, string>({
            query: (productId) => ({
                url: `/wishlist`,
                method: "POST",
                body: { productId },
            }),
            invalidatesTags: ["Wishlist"],
        }),
    }),
});

export const {
    useGetWishlistQuery,
    useToggleWishlistMutation,
} = wishlistApi;