import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ProductGrid from "../components/products/ProductGrid";
import ProductFilters from "../components/products/ProductFilters";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";

import { useGetProductsQuery } from "../features/products/productApi";
import { useGetWishlistQuery } from "../features/wishlist/wishlistApi";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);


  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParam("search", searchInput);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);
  // URL params
  const page = Number(searchParams.get("page") || 1);
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 0);
  const sort = searchParams.get("sort") || "";
  // Data fetching
  const { data: wishlist } = useGetWishlistQuery();
  const { data, isLoading } = useGetProductsQuery({
    page,
    category,
    brand,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sort,
    search,
  });


  // Lock scroll when mobile drawer open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  // Update URL param helper
  const updateParam = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams);
    console.log(key, value);
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }

    // Reset page when filter changes
    if (key !== "page") {
      params.set("page", "1");
    }

    setSearchParams(params);
  };

  return (
    <>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Products</h2>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Top Rated</option>
        </select>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border rounded px-4 py-2 w-full md:w-80"
          />

          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Top Rated</option>
          </select>

        </div>x
      </div>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-full border px-4 py-2 rounded-lg"
        >
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block">
          <ProductFilters
            category={category}
            setCategory={(v) => updateParam("category", v)}
            brand={brand}
            setBrand={(v) => updateParam("brand", v)}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={(v) => updateParam("minPrice", v)}
            setMaxPrice={(v) => updateParam("maxPrice", v)}
          />
        </div>

        {/* Products Section */}
        <div className="md:col-span-3 space-y-6">

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="text-center py-20 text-textMuted">
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-2">
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <ProductGrid
                products={data?.products || []}
                wishlist={wishlist || []}
              />

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: data?.totalPages || 0 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParam("page", i + 1)}
                    className={`px-3 py-1 rounded ${page === i + 1
                      ? "bg-primary text-white"
                      : "border"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Drawer */}
          <div className="relative bg-white w-full max-h-[80vh] rounded-t-2xl p-6 overflow-y-auto animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)}>✕</button>
            </div>

            <ProductFilters
              category={category}
              setCategory={(v) => updateParam("category", v)}
              brand={brand}
              setBrand={(v) => updateParam("brand", v)}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={(v) => updateParam("minPrice", v)}
              setMaxPrice={(v) => updateParam("maxPrice", v)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsPage;