import { api } from "../../app/api";
import type { ApiResponse } from "../products/productApi";

export const adminProductApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAdminProducts: builder.query<
            {
                products: any[];
                total: number;
                page: number;
                totalPages: number;
                limit: number;
            },
            {
                search?: string;
                stock?: string;
                category?: string;
                page?: number;
                limit?: number;
            }
        >({
            query: ({ search, stock, category, page, limit }) => {
                const params = new URLSearchParams();

                if (search) params.append("search", search);
                if (stock) params.append("stock", stock);
                if (category) params.append("category", category);
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());

                return `/admin/products?${params.toString()}`;
            },
            transformResponse: (response: ApiResponse<{
                products: any[];
                total: number;
                page: number;
                totalPages: number;
                limit: number;
            }>) => response.data,
            providesTags: ["Admin"],
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
            invalidatesTags: ["Admin", "Product"],
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