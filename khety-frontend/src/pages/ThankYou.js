import { Link } from "react-router-dom";

function ThankYou() {
  return (
    <div className="min-h-screen px-6 py-16 md:px-10">
      <div className="mx-auto max-w-2xl rounded-[36px] border border-[#dbe3d9] bg-white p-10 text-center shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
          Thank You
        </p>
        <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#215732] text-4xl text-white">
          ✓
        </div>
        <h1 className="mt-6 text-4xl font-extrabold text-[#102217]">
          Your message is on its way.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#5e6b62]">
          Our support team reads every message and usually replies within one
          working day during support hours. Keep an eye on your inbox.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-2xl bg-[#215732] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173d24]"
          >
            Back to home
          </Link>
          <Link
            to="/faq"
            className="rounded-2xl border border-[#d7dfd5] px-6 py-3 text-sm font-semibold text-[#102217] transition hover:border-[#215732]"
          >
            Browse FAQs
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ThankYou;
