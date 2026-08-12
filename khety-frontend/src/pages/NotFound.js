import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen px-6 py-16 md:px-10">
      <div className="mx-auto max-w-2xl rounded-[36px] border border-[#dbe3d9] bg-white p-10 text-center shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
        <p className="text-7xl font-extrabold text-[#215732]">404</p>
        <h1 className="mt-4 text-3xl font-extrabold text-[#102217]">
          This page wandered off the field.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#5e6b62]">
          The link may be old or mistyped. Let's get you back to something useful.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-2xl bg-[#215732] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173d24]"
          >
            Back to home
          </Link>
          <Link
            to="/detect"
            className="rounded-2xl bg-[#102217] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173d24]"
          >
            Detect a crop disease
          </Link>
          <Link
            to="/marketplace"
            className="rounded-2xl border border-[#d7dfd5] px-6 py-3 text-sm font-semibold text-[#102217] transition hover:border-[#215732]"
          >
            Browse products
          </Link>
          <Link
            to="/faq"
            className="rounded-2xl border border-[#d7dfd5] px-6 py-3 text-sm font-semibold text-[#102217] transition hover:border-[#215732]"
          >
            FAQs
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
