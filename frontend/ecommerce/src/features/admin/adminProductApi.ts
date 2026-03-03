import { api } from "../../app/api";
import type { ApiResponse } from "../products/productApi";

export const adminProductApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAdminProducts: builder.query({
            query: () => "/admin/products",
            transformResponse: (response: ApiResponse<{ products: any[] }>) => response.data,
        }),

        createProduct: builder.mutation({
            query: (data) => ({
                url: "/admin/products",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<{ product: any }>) => response.data,
            invalidatesTags: ["Admin"],
        }),

        updateProduct: builder.mutation({
            query: ({ productId, data }) => ({
                url: `/admin/products/${productId}`,
                method: "PUT",
                body: data,
            }),
            transformResponse: (response: ApiResponse<{ product: any }>) => response.data,
            invalidatesTags: ["Admin"],
        }),

        deleteProduct: builder.mutation({
            query: (productId) => ({
                url: `/admin/products/${productId}`,
                method: "DELETE",
            }),
            transformResponse: (response: ApiResponse<{ product: any }>) => response.data,
            invalidatesTags: ["Admin"],
        }),
    }),
});

export const { useGetAdminProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } = adminProductApi;