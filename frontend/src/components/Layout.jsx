import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../store/authSlice";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS } from "../constants/permissions";

const navItems = [
  { to: "/dashboard", label: "Dashboard", anyOf: null },
  {
    to: "/employees",
    label: "Employees",
    anyOf: [PERMISSIONS.EMPLOYEE_MANAGE],
  },
  {
    to: "/categories",
    label: "Categories",
    anyOf: [PERMISSIONS.CATEGORY_READ, PERMISSIONS.CATEGORY_CREATE],
  },
  {
    to: "/products",
    label: "Products",
    anyOf: [PERMISSIONS.PRODUCT_READ, PERMISSIONS.PRODUCT_CREATE],
  },
  {
    to: "/orders",
    label: "Orders",
    anyOf: [PERMISSIONS.ORDER_UPDATE],
  },
];

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { canAny, role } = usePermission();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const visibleNav = navItems.filter(
    (item) => !item.anyOf || canAny(...item.anyOf),
  );

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr] bg-[radial-gradient(circle_at_top_left,rgba(46,125,84,0.12),transparent_40%),linear-gradient(160deg,#f3efe6_0%,#e8e1d4_45%,#dfe8e2_100%)]">
      <aside className="flex flex-col gap-6 p-5 bg-ink text-paper border-r border-white/10 sticky top-0 z-10 md:min-h-screen">
        <div className="flex items-center gap-3 px-2">
          <span className="grid place-items-center size-10 rounded-xl bg-green text-paper font-bold tracking-wide">
            SM
          </span>
          <div>
            <strong className="block text-[1.05rem]">Store Desk</strong>
            <p className="m-0 mt-0.5 text-[0.82rem] text-[#aeb8b1]">
              Manage your shop
            </p>
          </div>
        </div>

        <nav className="flex flex-row flex-wrap md:flex-col gap-1.5 flex-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3.5 py-3 rounded-[10px] no-underline transition-colors ${
                  isActive
                    ? "bg-green/30 text-white"
                    : "text-[#d7ddd8] hover:bg-green/30 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
          <div>
            <strong>{user?.name}</strong>
            <p className="m-0 mt-0.5 text-[0.82rem] text-[#aeb8b1] capitalize">
              {role?.replaceAll("_", " ")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-[10px] px-4 py-3 cursor-pointer font-semibold bg-transparent text-paper border border-white/20"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
