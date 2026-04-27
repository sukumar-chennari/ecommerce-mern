import { Link, useNavigate } from "react-router-dom";
import { useGetProductsQuery } from "../features/products/productApi";
import { useGetTopProductsQuery } from "../features/admin/adminOrderApi";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import ProductCard from "../components/products/ProductCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const HomePage = () => {
  const { data: featured, isLoading: isLoadingFeatured } = useGetProductsQuery({ page: 1 });
  const { data: topProducts, isLoading: isLoadingTop } = useGetTopProductsQuery();
  const navigate = useNavigate();

  return (
    <div className="space-y-32 pb-20 animate-in fade-in duration-1000">
      {/* HERO SECTION */}
      <section className="relative h-[600px] rounded-[3rem] overflow-hidden group shadow-2xl">
        <img
          src="public/hero2.jpg"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center px-12 md:px-20">
          <div className="max-w-2xl space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">New Collection 2026</span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                Elevate Your <br /> <span className="text-primary italic">Everyday</span> Essentials
              </h1>
              <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                Experience the perfect blend of innovation and craftsmanship. Discover our new arrivals curated for your modern lifestyle.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="px-10 py-5 text-base shadow-2xl shadow-primary/40">Shop the Collection</Button>
              </Link>
              <Link to="/products?category=Electronics">
                <Button variant="outline" size="lg" className="px-10 py-5 text-base bg-white/10 text-white border-white/20 backdrop-blur-md hover:bg-white hover:text-black">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-extrabold text-textPrimary tracking-tight">Shop by Category</h2>
          <p className="text-textMuted font-medium">Explore our diverse range of premium categories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { name: "Electronics", icon: "⚡", color: "bg-blue-50" },
            { name: "Fashion", icon: "👗", color: "bg-purple-50" },
            { name: "Home", icon: "🏠", color: "bg-orange-50" },
            { name: "Accessories", icon: "⌚", color: "bg-emerald-50" }
          ].map((cat) => (
            <Link key={cat.name} to={`/products?category=${cat.name}`}>
              <Card noPadding className={`group relative h-48 flex items-center justify-center border-none ${cat.color} hover:scale-105 transition-transform duration-500`}>
                <div className="text-center space-y-4">
                  <span className="text-5xl block transform group-hover:scale-125 transition-transform duration-500">{cat.icon}</span>
                  <h3 className="text-lg font-extrabold text-textPrimary tracking-tight">{cat.name}</h3>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="space-y-12">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold text-textPrimary tracking-tight">Featured Drops</h2>
            <p className="text-textMuted font-medium">Handpicked selections from our latest arrivals</p>
          </div>
          <Link to="/products" className="text-sm font-bold text-primary hover:underline underline-offset-8">Explore All Products →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {isLoadingFeatured
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured?.products?.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
        </div>
      </section>

      {/* PROMO SECTION */}
      <section className="relative rounded-[3rem] bg-secondary p-20 text-center overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">Join the ReliCart Elite</h2>
            <p className="text-white/60 text-lg">Subscribe to get early access to limited edition drops, exclusive rewards, and zero shipping fees on your first order.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <input type="email" placeholder="Enter your email" className="w-full sm:w-80 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:border-primary/50 outline-none transition-all" />
            <Button className="w-full sm:w-auto px-10 py-4 shadow-xl shadow-primary/20">Subscribe Now</Button>
          </div>
        </div>
      </section>

      {/* TOP SELLERS */}
      {topProducts?.topProducts?.length > 0 && (
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-extrabold text-textPrimary tracking-tight">Best Sellers</h2>
            <p className="text-textMuted font-medium">The most coveted items in our store right now</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {isLoadingTop
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : topProducts?.topProducts?.map((p: any) => (
                <Link key={p.productId} to={`/products/${p.slug}`}>
                  <Card noPadding className="group hover:shadow-2xl transition-all duration-500">
                    <div className="aspect-square bg-gray-50 overflow-hidden relative">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-4 left-4">
                        <Badge variant="primary" className="bg-white/90 backdrop-blur-md text-primary">Best Seller</Badge>
                      </div>
                    </div>
                    <div className="p-6 space-y-1">
                      <h3 className="font-extrabold text-textPrimary group-hover:text-primary transition-colors">{p.name}</h3>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-textMuted uppercase tracking-widest">{p.totalQuantitySold} Units Sold</span>
                        <span className="text-primary font-black cursor-pointer" onClick={() => navigate(`/product/${p.slug}`)}>View Details</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;