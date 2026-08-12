import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem("khety-cookie-consent");

    if (!choice) {
      const timer = window.setTimeout(() => setVisible(true), 1200);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, []);

  const choose = (value) => {
    localStorage.setItem("khety-cookie-consent", value);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-xl rounded-3xl border border-[#dbe3d9] bg-white p-5 shadow-[0_24px_70px_rgba(16,34,23,0.22)]"
      role="region"
      aria-label="Cookie consent"
    >
      <p className="text-sm font-semibold text-[#102217]">We respect your privacy 🍪</p>
      <p className="mt-2 text-sm leading-6 text-[#5e6b62]">
        Khety uses essential cookies to keep you signed in and to remember your
        language and theme preferences. We never sell your data.{" "}
        <Link to="/privacy" className="font-semibold text-[#215732] underline">
          Read the privacy policy
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="rounded-2xl bg-[#215732] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173d24]"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose("declined")}
          className="rounded-2xl border border-[#d7dfd5] px-5 py-2.5 text-sm font-semibold text-[#102217] transition hover:border-[#215732]"
        >
          Decline optional
        </button>
      </div>
    </div>
  );
}

export default CookieConsent;
