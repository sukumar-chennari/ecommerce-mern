import { Outlet, NavLink } from "react-router-dom";

const AdminLayout = () => {
    return (
        <div className="min-h-screen flex bg-background">

            {/* Sidebar */}
            <aside className="w-64 bg-secondary text-white p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-8">Admin Panel</h2>

                <nav className="space-y-3">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg transition ${isActive ? "bg-accent text-black" : "hover:bg-white/10"
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg transition ${isActive ? "bg-accent text-black" : "hover:bg-white/10"
                            }`
                        }
                    >
                        Orders
                    </NavLink>

                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg transition ${isActive ? "bg-accent text-black" : "hover:bg-white/10"
                            }`
                        }
                    >
                        Products
                    </NavLink>

                    <NavLink
                        to="/admin/analytics"
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg transition ${isActive ? "bg-accent text-black" : "hover:bg-white/10"
                            }`
                        }
                    >
                        Analytics
                    </NavLink>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10">
                <Outlet />
            </main>

        </div>
    );
};

export default AdminLayout;