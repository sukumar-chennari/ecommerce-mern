import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../app/store";
import { clearUser } from "../../../features/auth/authSlice";

const AdminLayout = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(clearUser());
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex bg-background">

            {/* Sidebar */}
            <aside className="w-64 bg-secondary text-white p-6 flex flex-col shadow-xl">
                <div className="mb-8">
                    <h2 className="text-2xl font-extrabold tracking-tight">Admin Portal</h2>
                    <p className="text-xs text-white/50 uppercase font-semibold mt-1">Management Suite</p>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-accent text-black font-bold shadow-lg shadow-accent/20 translate-x-1"
                                : "hover:bg-white/5 text-white/70 hover:text-white"
                            }`
                        }
                    >
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-accent text-black font-bold shadow-lg shadow-accent/20 translate-x-1"
                                : "hover:bg-white/5 text-white/70 hover:text-white"
                            }`
                        }
                    >
                        <span>Orders</span>
                    </NavLink>

                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-accent text-black font-bold shadow-lg shadow-accent/20 translate-x-1"
                                : "hover:bg-white/5 text-white/70 hover:text-white"
                            }`
                        }
                    >
                        <span>Products</span>
                    </NavLink>

                    <NavLink
                        to="/admin/analytics"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-accent text-black font-bold shadow-lg shadow-accent/20 translate-x-1"
                                : "hover:bg-white/5 text-white/70 hover:text-white"
                            }`
                        }
                    >
                        <span>Analytics</span>
                    </NavLink>
                </nav>

                <div className="pt-6 border-t border-white/10 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-colors font-semibold"
                    >
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-surface border-b border-divider flex items-center justify-between px-10 shrink-0 shadow-sm bg-white">
                    <div>
                        <h1 className="text-xl font-bold text-textPrimary">
                            Welcome back, <span className="text-primary">{user?.name}</span>
                        </h1>
                        <p className="text-xs text-textMuted uppercase font-medium tracking-wider mt-0.5">Administrator Access</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 bg-secondary/5 rounded-full border border-secondary/10">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span className="text-sm font-semibold text-textPrimary">{user?.name}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-10 bg-gray-50/30">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

        </div>
    );
};

export default AdminLayout;