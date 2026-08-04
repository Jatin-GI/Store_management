import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  clearError,
  loginUser,
  selectIsAuthenticated,
  selectRole,
} from "../store/authSlice";

const roleHome = {
  admin: "/dashboard",
  product_lister: "/products",
  customer: "/shop",
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "admin@store.com",
    password: "Admin@123",
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  if (isAuthenticated) {
    const redirectTo =
      location.state?.from?.pathname || roleHome[role] || "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const userRole = result.payload.data.role.name;
      navigate(roleHome[userRole] || "/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] bg-[linear-gradient(135deg,rgba(28,36,31,0.88),rgba(28,36,31,0.55)),url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">
      <section className="px-6 pt-10 pb-4 lg:p-16 text-paper flex flex-col justify-center max-w-[640px]">
        <p className="text-sm tracking-[0.18em] uppercase text-[#9fd4b4] mb-4">
          Store Desk
        </p>
        <h1 className="font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-[1.08] m-0 mb-4 font-semibold">
          Run your store from one calm workspace.
        </h1>
        <p className="text-[1.08rem] leading-relaxed text-[#d8ddd8] max-w-[34ch] m-0">
          Sign in to manage products, categories, employees, and orders with
          role-based access.
        </p>
      </section>

      <form
        className="mx-5 mb-8 lg:my-auto lg:mr-12 lg:ml-0 w-full max-w-[420px] bg-paper rounded-[18px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)] flex flex-col gap-3.5"
        onSubmit={onSubmit}
      >
        <h2 className="m-0 font-display text-[1.8rem] text-ink">Sign in</h2>
        <p className="m-0 text-muted text-[0.92rem]">
          Use your seeded account credentials
        </p>

        <label className="flex flex-col gap-1.5 text-[0.9rem] text-[#2d3731]">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            className="border border-line bg-[#fffdf8] rounded-[10px] px-3.5 py-3 focus:outline-2 focus:outline-green focus:border-transparent"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[0.9rem] text-[#2d3731]">
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            className="border border-line bg-[#fffdf8] rounded-[10px] px-3.5 py-3 focus:outline-2 focus:outline-green focus:border-transparent"
          />
        </label>

        {error && <p className="m-0 text-[#a33b2d] text-[0.9rem]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-[10px] px-4 py-3 cursor-pointer font-semibold bg-green text-paper hover:bg-green-dark disabled:opacity-65 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-1.5 p-3.5 rounded-xl bg-[#ebe4d6] text-[0.82rem] text-[#465048]">
          <p className="my-1">
            <strong>admin</strong> — admin@store.com / Admin@123
          </p>
          <p className="my-1">
            <strong>lister</strong> — lister@store.com / Lister@123
          </p>
          <p className="my-1">
            <strong>customer</strong> — customer@store.com / Customer@123
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
