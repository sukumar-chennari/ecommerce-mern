import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import CheckoutSuccess from "../pages/CheckoutSuccess";
import CheckoutCancel from "../pages/CheckoutCancel";
import MyOrdersPage from "../pages/MyOrdersPage";
import OrderDetailsPage from "../pages/OrderDetailsPage";
import AdminOrdersPage from "../pages/admin/pages/AdminOrdersPage";
import AdminOrderDetailsPage from "../pages/admin/pages/AdminOrderDetailsPage";
import WishlistPage from "../pages/WishlistPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import Home from "../pages/Home";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Home />
              {/* <ProductsPage /> */}
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProductsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products/:slug"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProductDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CartPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CheckoutPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute>
            <CheckoutSuccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout/cancel"
        element={
          <ProtectedRoute>
            <CheckoutCancel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MyOrdersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OrderDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/admin/orders"
        element={
          <ProtectedRoute adminOnly>
            <AdminOrdersPage />
          </ProtectedRoute>
        }
      /> */}

      {/* <Route
        path="/admin/orders/:id"
        element={
          <ProtectedRoute adminOnly>
            <AdminOrderDetailsPage />
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WishlistPage />
            </AppLayout>
          </ProtectedRoute>
        }
      >

      </Route>

      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute>
            <OrderSuccessPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;
