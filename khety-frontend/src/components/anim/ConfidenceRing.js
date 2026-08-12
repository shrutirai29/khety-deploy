import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

const CIRCUMFERENCE = 2 * Math.PI * 54;

/**
 * Animated circular gauge for the AI confidence score.
 * Counts up to the real percentage returned by the model.
 */
function ConfidenceRing({ value = 0, size = 148, className = "" }) {
  const [display, setDisplay] = useState(0);
  const progress = useSpring(0, { stiffness: 60, damping: 20 });

  const strokeDashoffset = useTransform(
    progress,
    (v) => CIRCUMFERENCE * (1 - v / 100)
  );

  const ringColor =
    value >= 70 ? "#3f8f5f" : value >= 40 ? "#d9a441" : "#d26b4a";

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setDisplay(value);
      progress.set(value);
      return undefined;
    }

    const start = performance.now();
    const duration = 1200;
    let frame;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(eased * value);
      setDisplay(current);
      progress.set(current);

      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value, progress]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 128 128" className="-rotate-90">
        <circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke="rgba(127,206,161,0.18)"
          strokeWidth="9"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke={ringColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold" style={{ color: ringColor }}>
          {display}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5e6b62]">
          confidence
        </span>
      </div>
    </div>
  );
}

export default ConfidenceRing;
