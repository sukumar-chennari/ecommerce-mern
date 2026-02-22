import { api } from "../../app/api";

export interface CartItem {
    _id: string;
    product: {
        _id: string;
        name: string;
        price: number;
        images: string[];
        slug: string;
    };
    quantity: number;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
}

import type { ApiResponse } from "../products/productApi";

export const cartApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getCart: builder.query<Cart, void>({
            query: () => "/cart",
            transformResponse: (response: ApiResponse<Cart>) => response.data,
            providesTags: ["Cart"],
        }),

        addToCart: builder.mutation<Cart, { productId: string; quantity: number }>({
            query: ({ productId, quantity }) => ({
                url: "/cart",
                method: "POST",
                body: { productId, quantity },
            }),
            transformResponse: (response: ApiResponse<{ cart: Cart }>) => response.data.cart,
            invalidatesTags: ["Cart"],
        }),

        updateCartItem: builder.mutation<Cart, { productId: string; quantity: number }>({
            query: ({ productId, quantity }) => ({
                url: `/cart/${productId}`,
                method: "PUT",
                body: { quantity },
            }),
            transformResponse: (response: ApiResponse<{ cart: Cart }>) => response.data.cart,
            invalidatesTags: ["Cart"],
        }),

        removeCartItem: builder.mutation<Cart, string>({
            query: (itemId) => ({
                url: `/cart/${itemId}`,
                method: "DELETE",
            }),
            transformResponse: (response: ApiResponse<{ cart: Cart }>) => response.data.cart,
            invalidatesTags: ["Cart"],
        }),
    }),
});

export const { useGetCartQuery, useAddToCartMutation, useUpdateCartItemMutation, useRemoveCartItemMutation } = cartApi;