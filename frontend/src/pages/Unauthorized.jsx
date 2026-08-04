import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-[#eae3d5]">
      <article className="bg-paper border border-line rounded-2xl p-5 w-full max-w-[420px]">
        <h1 className="m-0 font-display text-ink">Access denied</h1>
        <p className="mt-2 mb-4 text-muted">
          Your role does not have permission for this page.
        </p>
        <Link
          className="inline-flex justify-center no-underline rounded-[10px] px-4 py-3 font-semibold bg-green text-paper hover:bg-green-dark"
          to="/"
        >
          Go home
        </Link>
      </article>
    </div>
  );
};

export default Unauthorized;
