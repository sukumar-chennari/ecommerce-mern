interface Props {
  category: string;
  setCategory: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  minPrice: number;
  maxPrice: number;
  setMinPrice: (v: number) => void;
  setMaxPrice: (v: number) => void;
}

const ProductFilters = ({
  category,
  setCategory,
  brand,
  setBrand,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}: Props) => {
  return (
    <div className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition rounded-xl px-3 py-2">
      <h3 className="font-semibold">Filters</h3>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">All Categories</option>
        <option value="Clothing">Clothing</option>
        <option value="Electronics">Electronics</option>
      </select>

      <select
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">All Brands</option>
        <option value="Nike">Nike</option>
        <option value="Apple">Apple</option>
      </select>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min ₹"
          value={minPrice || ""}
          onChange={(e) => setMinPrice(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Max ₹"
          value={maxPrice || ""}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />
      </div>
    </div>
  );
};

export default ProductFilters;