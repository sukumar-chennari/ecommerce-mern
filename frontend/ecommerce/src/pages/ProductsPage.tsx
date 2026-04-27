import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductGrid from "../components/products/ProductGrid";
import ProductFilters from "../components/products/ProductFilters";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import { useGetProductsQuery } from "../features/products/productApi";
import { useGetWishlistQuery } from "../features/wishlist/wishlistApi";
import Button from "../components/ui/Button";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const page = Number(searchParams.get("page") || 1);
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 0);
  const sort = searchParams.get("sort") || "";
  const search = searchParams.get("search") || "";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParam("search", searchInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParam = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams);
    if (!value) params.delete(key);
    else params.set(key, String(value));
    if (key !== "page") params.set("page", "1");
    setSearchParams(params);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Our Collection</h1>
          <p className="text-sm text-textMuted font-medium">Discover our premium range of curated products.</p>
        </div>

        <div className="flex flex-1 md:max-w-md gap-3">
          <div className="relative flex-1">
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
            />
          </div>
          
          <select 
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="bg-white border border-gray-100 text-xs font-bold rounded-2xl px-4 py-3 outline-none shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Best Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block space-y-8 sticky top-28 self-start">
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
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between lg:hidden mb-6">
             <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} className="w-full flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Show Filters
             </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="bg-gray-50/50 rounded-3xl p-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100">
               <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-soft mb-6">
                  <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
               </div>
               <h3 className="text-xl font-bold text-textPrimary">No products found</h3>
               <p className="text-sm text-textMuted mt-2 max-w-xs">We couldn't find any products matching your current filters. Try clearing some selections.</p>
               <Button variant="outline" className="mt-8" onClick={() => setSearchParams({})}>Clear All Filters</Button>
            </div>
          ) : (
            <div className="space-y-12">
              <ProductGrid
                products={data?.products || []}
                wishlist={wishlist || []}
              />

              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 1}
                    onClick={() => updateParam("page", page - 1)}
                  >
                    Prev
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: data.totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateParam("page", i + 1)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          page === i + 1
                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                            : "bg-white border border-gray-100 text-textMuted hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === data.totalPages}
                    onClick={() => updateParam("page", page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="relative bg-white w-full max-h-[90vh] rounded-t-[2.5rem] p-10 overflow-y-auto animate-in slide-in-from-bottom duration-500 shadow-2xl">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-8" />
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-extrabold text-textPrimary">Filters</h2>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-3 bg-gray-50 rounded-xl text-textMuted hover:text-danger transition-colors"
              >
                ✕
              </button>
            </div>

            <ProductFilters
              category={category}
              setCategory={(v) => { updateParam("category", v); setIsFilterOpen(false); }}
              brand={brand}
              setBrand={(v) => { updateParam("brand", v); setIsFilterOpen(false); }}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={(v) => updateParam("minPrice", v)}
              setMaxPrice={(v) => updateParam("maxPrice", v)}
            />
            
            <div className="mt-10">
                <Button className="w-full" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;