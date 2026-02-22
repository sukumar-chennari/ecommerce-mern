import { useState } from "react";
import ProductGrid from "../components/products/ProductGrid";
import ProductFilters from "../components/products/ProductFilters";
import { useGetProductsQuery } from "../features/products/productApi";

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const { data, isLoading } = useGetProductsQuery({
    page,
    category,
    brand,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
  });

  console.log("data", data);
  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <ProductFilters
        category={category}
        setCategory={setCategory}
        brand={brand}
        setBrand={setBrand}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
      />

      <div className="md:col-span-3 space-y-6">
        <ProductGrid products={data?.data?.products || []} />

        <div className="flex justify-center gap-4">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span>
            Page {data?.page} / {data?.totalPages}
          </span>
          <button
            disabled={page === data?.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;