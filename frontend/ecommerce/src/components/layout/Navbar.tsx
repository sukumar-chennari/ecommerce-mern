import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../app/store";
import { clearUser } from "../../features/auth/authSlice";
import Button from "../ui/Button";
import { useGetCartQuery } from "../../features/cart/cartApi";
import { useLogoutMutation } from "../../features/auth/authApi";

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    if (!confirm("Are you sure you want to logout?")) return;
    try {
      await logoutApi();
      dispatch(clearUser());
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const { data: cart } = useGetCartQuery(undefined, {
    skip: !user, // 👈 important: don't fetch if not logged in
  });

  const cartCount =
    cart?.items?.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    ) ?? 0;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface shadow-soft flex items-center justify-between px-6 z-50">
      <Link to="/" className="text-lg font-bold text-primary">
        E-Commerce
      </Link>

      <nav className="flex items-center gap-6">
        {user ? (
          <>
            <span className="text-sm text-textMuted">
              Hi, {user.name}
            </span>

            {/* CART LINK */}
            <Link to="/cart" className="relative" onClick={() => navigate("/cart")}>
              <span className="font-medium">Cart</span>

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-danger text-white text-xs rounded-full px-2 py-0.5">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/orders">
              <Button variant="secondary">My Orders</Button>
            </Link>

            {/* <Link to="/wishlist">
              ❤️ ({data?.products.length || 0})
            </Link> */}

            <Button variant="secondary" onClick={logoutHandler}>
              Logout
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;