import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../store/authSlice";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS } from "../constants/permissions";
import Can from "../components/Can";

const Dashboard = () => {
  const user = useSelector(selectUser);
  const { role, permissions } = usePermission();

  return (
    <div className="max-w-[980px]">
      <header className="mb-5">
        <p className="m-0 mb-1.5 uppercase tracking-[0.14em] text-xs text-green-dark">
          Overview
        </p>
        <h1 className="m-0 font-display text-[clamp(1.8rem,3vw,2.4rem)] text-ink">
          Welcome, {user?.name}
        </h1>
        <p className="mt-2 mb-0 text-muted">
          Signed in as{" "}
          <strong className="capitalize">{role?.replaceAll("_", " ")}</strong>
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="bg-paper border border-line rounded-2xl p-5">
          <h3 className="m-0 font-display text-ink">Your access</h3>
          <ul className="list-none flex flex-wrap gap-2 p-0 mt-4 mb-0">
            {permissions.map((p) => (
              <li
                key={p}
                className="bg-[#e5efe8] text-green-dark rounded-full px-3 py-1 text-xs"
              >
                {p}
              </li>
            ))}
          </ul>
        </article>

        <article className="bg-paper border border-line rounded-2xl p-5">
          <h3 className="m-0 font-display text-ink">Quick actions</h3>
          <div className="grid gap-2 mt-4">
            <Can permission={PERMISSIONS.EMPLOYEE_MANAGE}>
              <Link
                className="no-underline px-3.5 py-3 rounded-[10px] bg-[#e8f2ec] text-green-dark font-semibold"
                to="/employees"
              >
                Manage employees
              </Link>
            </Can>
            <Can permission={PERMISSIONS.CATEGORY_READ}>
              <Link
                className="no-underline px-3.5 py-3 rounded-[10px] bg-[#e8f2ec] text-green-dark font-semibold"
                to="/categories"
              >
                Categories
              </Link>
            </Can>
            <Can permission={PERMISSIONS.PRODUCT_READ}>
              <Link
                className="no-underline px-3.5 py-3 rounded-[10px] bg-[#e8f2ec] text-green-dark font-semibold"
                to="/products"
              >
                Products
              </Link>
            </Can>
            <Can permission={PERMISSIONS.ORDER_UPDATE}>
              <Link
                className="no-underline px-3.5 py-3 rounded-[10px] bg-[#e8f2ec] text-green-dark font-semibold"
                to="/orders"
              >
                Manage orders
              </Link>
            </Can>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
