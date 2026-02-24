import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../../app/store";

const AdminProtectedRoute = () => {
    const { user, isLoading } = useSelector(
        (state: RootState) => state.auth
    );

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;