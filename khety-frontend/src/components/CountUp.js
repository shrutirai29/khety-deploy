import { useEffect, useRef, useState } from "react";

/**
 * Counts up to `value` when scrolled into view. Handles strings like "3"
 * and "24/7" (non-numeric parts render statically after the count).
 * Respects prefers-reduced-motion.
 */
function CountUp({ value, duration = 1200, className = "" }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState("0");
  const [started, setStarted] = useState(false);

  const numeric = parseFloat(value);

  useEffect(() => {
    if (!ref.current || Number.isNaN(numeric)) {
      return undefined;
    }

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      setStarted(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [numeric, value]);

  useEffect(() => {
    if (!started || Number.isNaN(numeric)) {
      return undefined;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplay(value);
      return undefined;
    }

    let frame;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(String(Math.round(eased * numeric)));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [started, numeric, duration, value]);

  return (
    <span ref={ref} className={className}>
      {Number.isNaN(numeric) ? value : display}
    </span>
  );
}

export default CountUp;
