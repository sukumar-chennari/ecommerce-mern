import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../../app/store";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useSelector((state: RootState) => state.auth);

    if (!user) return <Navigate to="/login" />;
    if (user.role !== "admin") return <Navigate to="/" />;

    return <>{children}</>;
};

export default AdminRoute;