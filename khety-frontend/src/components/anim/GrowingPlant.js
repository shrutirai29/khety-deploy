import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * The "interface grows as you scroll" centerpiece: an SVG plant whose stem
 * draws and whose leaves sprout in sequence, tied to scroll progress through
 * the section. Respects prefers-reduced-motion (renders fully grown).
 */
function GrowingPlant({ className = "", height = 340, id = "grow" }) {
  const ref = useRef(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hooks must be called unconditionally.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 45%"]
  });

  const spring = useSpring(prefersReduced ? 1 : scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.5
  });

  const stemLength = useTransform(spring, [0, 1], [0, 1]);
  const leafA = useTransform(spring, [0.2, 0.45], [0, 1]);
  const leafB = useTransform(spring, [0.4, 0.65], [0, 1]);
  const leafC = useTransform(spring, [0.62, 0.85], [0, 1]);
  const sprout = useTransform(spring, [0.82, 1], [0, 1]);
  const fadeIn = useTransform(spring, [0.05, 0.25], [0, 1]);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 200 360"
        className="h-full w-auto"
        fill="none"
        aria-hidden="true"
      >
        {/* soil */}
        <motion.ellipse
          cx="100"
          cy="338"
          rx="86"
          ry="18"
          fill="#173d24"
          style={{ opacity: fadeIn }}
        />
        <motion.ellipse
          cx="100"
          cy="338"
          rx="62"
          ry="12"
          fill="#102217"
          style={{ opacity: fadeIn }}
        />

        {/* main stem */}
        <motion.path
          d="M100 336 C 98 290, 106 250, 100 210 C 94 172, 104 138, 100 96"
          stroke="#3f8f5f"
          strokeWidth="5"
          strokeLinecap="round"
          style={{ pathLength: stemLength }}
        />

        {/* leaf A (left, low) */}
        <motion.path
          d="M100 262 C 72 250, 52 236, 38 210 C 64 212, 84 224, 100 248 Z"
          fill="#4c9c69"
          style={{ scale: leafA, transformOrigin: "100px 262px" }}
        />
        {/* leaf B (right, mid) */}
        <motion.path
          d="M100 182 C 128 174, 148 160, 162 134 C 138 138, 118 150, 102 170 Z"
          fill="#56ab74"
          style={{ scale: leafB, transformOrigin: "100px 182px" }}
        />
        {/* leaf C (left, high) */}
        <motion.path
          d="M100 118 C 74 108, 56 92, 44 66 C 68 72, 88 86, 100 108 Z"
          fill="#63bd84"
          style={{ scale: leafC, transformOrigin: "100px 118px" }}
        />

        {/* sprout tip */}
        <motion.circle
          cx="100"
          cy="96"
          r="7"
          fill="#7fcea1"
          style={{ scale: sprout, transformOrigin: "100px 96px" }}
        />
        <motion.circle
          cx="100"
          cy="96"
          r="11"
          fill="rgba(127,206,161,0.35)"
          style={{ scale: sprout, transformOrigin: "100px 96px" }}
        />
      </svg>

      {/* glowing nodes along the stem — pure decoration */}
      <motion.div
        className="pointer-events-none absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#7fcea1] shadow-[0_0_14px_2px_rgba(127,206,161,0.55)]"
        style={{ top: "64%", opacity: leafA }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#7fcea1] shadow-[0_0_14px_2px_rgba(127,206,161,0.55)]"
        style={{ top: "44%", opacity: leafB }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#7fcea1] shadow-[0_0_14px_2px_rgba(127,206,161,0.55)]"
        style={{ top: "26%", opacity: leafC }}
      />
    </div>
  );
}

export default GrowingPlant;
