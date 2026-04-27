import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../app/store";
import { clearUser } from "../../features/auth/authSlice";
import Button from "../ui/Button";
import { useGetCartQuery } from "../../features/cart/cartApi";
import { useLogoutMutation } from "../../features/auth/authApi";
import NotificationBell from "../ui/NotificationBell";

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    if (!confirm("Are you sure you want to logout?")) return;
    try {
      await logoutApi().unwrap();
      dispatch(clearUser());
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const { data: cart } = useGetCartQuery(undefined, {
    skip: !user,
  });

  const cartCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 z-50">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
          <span className="text-xl font-bold text-white italic">S</span>
        </div>
        <span className="text-xl font-bold text-textPrimary tracking-tight">ReliCart</span>
      </Link>

      <nav className="flex items-center gap-8">
        <Link to="/products" className="text-sm font-bold text-textMuted hover:text-primary transition-colors">
          Shop
        </Link>

        {user ? (
          <>
            <Link to="/orders" className="text-sm font-bold text-textMuted hover:text-primary transition-colors">
              My Orders
            </Link>

            <Link to="/cart" className="relative group">
              <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                <svg className="w-5 h-5 text-textPrimary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-lg px-1.5 py-0.5 shadow-lg shadow-primary/30 border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="h-8 w-[1px] bg-gray-100"></div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-1">
                <span className="text-sm font-bold text-textPrimary">{user.name}</span>
                <span className="text-[10px] text-accent font-bold uppercase tracking-tighter">Member</span>
              </div>

              <div className="group relative">
                <button className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-primary font-bold overflow-hidden transition-transform hover:scale-105 active:scale-95">
                  {user.name?.charAt(0).toUpperCase()}
                </button>

                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[160px]">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-textMuted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                      Profile
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-danger hover:bg-danger/5 rounded-xl transition-all"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;