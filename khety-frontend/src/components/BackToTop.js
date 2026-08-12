import { useEffect, useState } from "react";

/** Floating "back to top" button, visible after scrolling down 600px. */
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="khety-back-to-top fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#215732] text-lg text-white shadow-[0_14px_34px_rgba(33,87,50,0.35)] transition hover:-translate-y-0.5 hover:bg-[#173d24] sm:bottom-6 sm:right-6"
    >
      ↑
    </button>
  );
}

export default BackToTop;
