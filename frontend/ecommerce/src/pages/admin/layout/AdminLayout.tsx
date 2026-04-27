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

    const navItems = [
        { 
            to: "/admin", 
            label: "Dashboard", 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        { 
            to: "/admin/orders", 
            label: "Orders", 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            )
        },
        { 
            to: "/admin/products", 
            label: "Products", 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        }
    ];

    return (
        <div className="min-h-screen flex bg-[#F8FAFC]">
            {/* Sidebar */}
            <aside className="w-72 bg-secondary text-white flex flex-col fixed inset-y-0 shadow-2xl z-20">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-xl font-bold text-white">A</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight">AdminPanel</h2>
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Store Management</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/admin"}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02] translate-x-1"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                                }`
                            }
                        >
                            <span className="transition-transform duration-300 group-hover:scale-110">
                                {item.icon}
                            </span>
                            <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-danger hover:bg-danger/10 transition-all duration-300 font-bold group"
                    >
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-72 flex flex-col min-h-screen">
                <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between px-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg lg:hidden">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-bold text-textPrimary uppercase tracking-widest">Overview</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-textPrimary">{user?.name}</span>
                            <span className="text-[10px] text-accent font-bold uppercase tracking-tighter">System Admin</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-primary font-bold overflow-hidden">
                            {user?.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                    </div>
                </header>

                <main className="p-10 flex-1">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};


export default AdminLayout;