import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "../features/auth/ProtectedRoute";

import Home from "../pages/Home";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import CheckoutSuccess from "../pages/CheckoutSuccess";
import CheckoutCancel from "../pages/CheckoutCancel";
import MyOrdersPage from "../pages/MyOrdersPage";
import OrderDetailsPage from "../pages/OrderDetailsPage";
import WishlistPage from "../pages/WishlistPage";
// import OrderSuccessPage from "../pages/OrderSuccessPage";
import MainLayout from "../layouts/MainLayout";
import AdminProtectedRoute from "../pages/admin/AdminProtectedRoute";
import AdminLayout from "../pages/admin/layout/AdminLayout";
import AdminDashboard from "../pages/admin/pages/AdminDashboard";
import AdminOrdersPage from "../pages/admin/pages/AdminOrdersPage";
import AdminOrderDetailsPage from "../pages/admin/pages/AdminOrderDetailsPage";
import AdminProductsPage from "../pages/admin/pages/AdminProductsPage";
import AdminCreateProductPage from "../pages/admin/pages/AdminCreateProductPage";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>

        {/* Layout */}
        <Route element={<MainLayout />}>

          <Route index element={<Home />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
          <Route path="wishlist" element={<WishlistPage />} />

        </Route>

        {/* Standalone but still protected */}
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancel" element={<CheckoutCancel />} />

      </Route>


      {/* Admin Area */}
      <Route element={<AdminProtectedRoute />}>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/create" element={<AdminCreateProductPage />} />
          {/* <Route path="products/update/:id" element={<AdminUpdateProductPage />} /> */}
          {/* <Route path="products/delete/:id" element={<AdminProductsPage />} /> */}

          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
        </Route>

      </Route>
    </Routes>
  );
};

export default AppRoutes;