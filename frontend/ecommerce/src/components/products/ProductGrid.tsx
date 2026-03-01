import ProductCard from "./ProductCard";
import type { Product } from "../../features/products/productApi";

const ProductGrid = ({ products, wishlist }: { products: Product[]; wishlist?: string[] }) => {


  console.log("products", products)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} wishlist={wishlist} />
      ))}
    </div>
  );
};

export default ProductGrid;