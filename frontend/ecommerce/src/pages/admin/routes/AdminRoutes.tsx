import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import AdminProtectedRoute from "../AdminProtectedRoute";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import AdminOrderDetailsPage from "../pages/AdminOrderDetailsPage";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route
                path="/admin"
                element={
                    <AdminProtectedRoute>
                        <AdminLayout>
                            <AdminDashboard />
                        </AdminLayout>
                    </AdminProtectedRoute>
                }
            />

            <Route
                path="/admin/orders"
                element={
                    <AdminProtectedRoute>
                        <AdminLayout>
                            <AdminOrdersPage />
                        </AdminLayout>
                    </AdminProtectedRoute>
                }
            />


            <Route
                path="/admin/orders/:id"
                element={
                    <AdminProtectedRoute>
                        <AdminLayout>
                            <AdminOrderDetailsPage />
                        </AdminLayout>
                    </AdminProtectedRoute>
                }
            />
        </Routes>
    );
};

export default AdminRoutes;