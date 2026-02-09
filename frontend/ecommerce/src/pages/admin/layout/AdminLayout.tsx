import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
    children: ReactNode;
}

const AdminLayout = ({ children }: Props) => {
    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <aside className="w-64 bg-secondary text-white p-6">
                <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

                <nav className="space-y-3">
                    <Link to="/admin" className="block hover:text-accent">
                        Dashboard
                    </Link>
                    <Link to="/admin/orders" className="block hover:text-accent">
                        Orders
                    </Link>
                    <Link to="/admin/products" className="block hover:text-accent">
                        Products
                    </Link>
                    <Link to="/admin/analytics" className="block hover:text-accent">
                        Analytics
                    </Link>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8">{children}</main>
        </div>
    );
};

export default AdminLayout;