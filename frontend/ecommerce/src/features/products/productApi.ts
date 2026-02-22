import { api } from "../../app/api";

export interface Product {

  _id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  description?: string;
  stock: number;
  averageRating?: number;

  reviewCount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: any;
}

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      {
        products: Product[];
        total: number;
        page: number;
        totalPages: number;
      },
      {
        page?: number;
        category?: string;
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.set("page", params.page.toString());
        queryParams.set("limit", "12");
        queryParams.set("sort", "createdAt:desc");

        if (params.category) queryParams.set("category", params.category);
        if (params.brand) queryParams.set("brand", params.brand);
        if (params.minPrice) queryParams.set("minPrice", params.minPrice.toString());
        if (params.maxPrice) queryParams.set("maxPrice", params.maxPrice.toString());

        return `/products?${queryParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<{
        products: Product[];
        total: number;
        page: number;
        totalPages: number;
      }>) => response.data,
    }),

    getProductBySlug: builder.query<Product, string>({
      query: (slug) => `/products/${slug}`,
      transformResponse: (response: ApiResponse<Product>) => response.data,
    }),
  }),
});
export const { useGetProductsQuery, useGetProductBySlugQuery } = productApi;