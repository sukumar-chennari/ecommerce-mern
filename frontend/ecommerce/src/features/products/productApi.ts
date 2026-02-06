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
      query: ({ page = 1, category, brand, minPrice, maxPrice }) => {
        const params = new URLSearchParams();

        params.set("page", page.toString());
        params.set("limit", "12");
        params.set("sort", "createdAt:desc");
        params.set("fields", "_id,name,price,images,slug");
        params.set("populate", "images");

        if (category) params.set("category", category);
        if (brand) params.set("brand", brand);
        if (minPrice) params.set("minPrice", minPrice.toString());
        if (maxPrice) params.set("maxPrice", maxPrice.toString());

        return `/products?${params.toString()}`;
      },
    }),

    getProductBySlug: builder.query<Product, string>({
      query: (slug) =>
        `/products/${slug}?fields=_id,name,price,images,slug,description,stock`,
    }),
  }),
});
export const { useGetProductsQuery, useGetProductBySlugQuery } = productApi;