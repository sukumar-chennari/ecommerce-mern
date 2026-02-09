import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../../app/store";

interface Props {
    children: ReactNode;
}

const AdminProtectedRoute = ({ children }: Props) => {
    const { user, isLoading } = useSelector(
        (state: RootState) => state.auth
    );

    // Still checking auth (important on refresh)
    if (isLoading) return <div className="p-6">Loading...</div>;

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but not admin
    if (user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;