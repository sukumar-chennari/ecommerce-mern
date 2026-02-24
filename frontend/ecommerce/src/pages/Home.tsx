import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../features/products/productApi";
import { useGetTopProductsQuery } from "../features/admin/adminOrderApi";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import ProductCard from "../components/products/ProductCard";

const HomePage = () => {
  const { data: featured, isLoading: isLoadingFeatured } = useGetProductsQuery({ page: 1 });
  const { data: topProducts, isLoading: isLoadingTop } = useGetTopProductsQuery();

  return (
    <div className="space-y-24">
      <div className="max-w-7xl mx-auto px-6 space-y-24">

        {/* HERO */}
        <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-20 px-6 rounded-2xl">

          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
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
        <section className="">
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
        <section className="">
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {isLoadingFeatured
              ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
              : featured?.products?.slice(0, 4).map((product: any) => (

                <ProductCard key={product._id} product={product} />
              ))}
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-16 text-center relative overflow-hidden">
          <h2 className="text-3xl font-bold">Limited Time Offer</h2>
          <p className="mt-3 opacity-90">
            Free shipping on orders above ₹999.
          </p>
          <Link
            to="/products"
            className="inline-block mt-6 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold"
          >
            Explore Now
          </Link>
        </section>

        {/* BEST SELLERS */}
        {
          topProducts?.topProducts?.length > 0 && (
            <section className="px-6">
              <h2 className="text-2xl font-bold mb-6">Best Sellers</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {isLoadingTop
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                  : topProducts?.topProducts?.map((product: any) => (
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
          )
        }
      </div>
    </div>
  );
};

export default HomePage;