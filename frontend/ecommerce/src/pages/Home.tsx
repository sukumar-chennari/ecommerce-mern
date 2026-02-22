import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../features/products/productApi";
import { useGetTopProductsQuery } from "../features/admin/adminOrderApi";

const HomePage = () => {
  const { data: featured } = useGetProductsQuery({ page: 1 });
  const { data: topProducts } = useGetTopProductsQuery();

  return (
    <div className="space-y-16">

      {/* HERO */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-20 px-6 rounded-2xl">
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            Upgrade Your Style. <br /> Elevate Your Game.
          </h1>
          <p className="text-lg opacity-90">
            Premium quality products curated just for you.
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary px-6 py-3 rounded-xl font-semibold"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-6">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {["Clothing", "Electronics", "Shoes", "Accessories"].map(
            (category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="bg-surface shadow-card rounded-2xl p-6 text-center hover:shadow-soft transition"
              >
                <h3 className="font-semibold">{category}</h3>
              </Link>
            )
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="px-6">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured?.products?.slice(0, 4).map((product: any) => (
            <Link
              key={product._id}
              to={`/products/${product.slug}`}
              className="bg-surface shadow-card rounded-2xl p-4 hover:shadow-soft transition"
            >
              <div className="h-40 bg-gray-100 rounded-xl mb-4" />
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-primary font-bold mt-2">
                ₹{product.price}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="px-6">
        <h2 className="text-2xl font-bold mb-6">Best Sellers</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {topProducts?.topProducts?.map((product: any) => (
            <Link
              key={product.productId}
              to={`/products/${product.slug || ""}`}
              className="bg-surface shadow-card rounded-2xl p-4 hover:shadow-soft transition"
            >
              <div className="h-40 bg-gray-100 rounded-xl mb-4" />
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">
                {product.totalQuantitySold} sold
              </p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;