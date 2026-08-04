import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../store/authSlice";
import { selectCartCount } from "../store/cartSlice";

const CustomerLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const cartCount = useSelector(selectCartCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] text-ink">
      <div className="bg-ink text-paper text-center text-xs sm:text-sm py-2 tracking-wide">
        Free delivery on orders above ₹999 · Easy 7-day returns
      </div>

      <header className="sticky top-0 z-30 bg-[#faf8f4]/95 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="text-left bg-transparent border-0 cursor-pointer p-0"
          >
            <span className="font-display text-2xl text-ink block leading-none">
              Store Desk
            </span>
            <span className="text-[0.7rem] uppercase tracking-[0.16em] text-green-dark">
              Marketplace
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `no-underline ${isActive ? "text-green-dark" : "text-ink/80 hover:text-ink"}`
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/my-orders"
              className={({ isActive }) =>
                `no-underline ${isActive ? "text-green-dark" : "text-ink/80 hover:text-ink"}`
              }
            >
              Orders
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-sm text-muted">
              Hi, {user?.name?.split(" ")[0]}
            </span>
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="relative bg-ink text-paper rounded-full px-4 py-2 text-sm font-semibold cursor-pointer border-0"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-green text-paper text-[0.7rem] grid place-items-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-muted hover:text-ink bg-transparent border-0 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-line bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl m-0 mb-2">Store Desk</p>
            <p className="m-0 text-sm text-paper/70">
              Everyday essentials for fashion, tech, grocery, and home.
            </p>
          </div>
          <div>
            <p className="m-0 mb-2 font-semibold">Help</p>
            <p className="m-0 text-sm text-paper/70">Track orders in My Orders</p>
            <p className="m-0 text-sm text-paper/70">Cancel pending orders anytime</p>
          </div>
          <div>
            <p className="m-0 mb-2 font-semibold">Contact</p>
            <p className="m-0 text-sm text-paper/70">support@storedesk.local</p>
            <p className="m-0 text-sm text-paper/70">Mon–Sat, 9am–7pm</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
