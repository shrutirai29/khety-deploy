import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Magnetic button — the whole element gently follows the cursor on hover
 * and springs back when the mouse leaves. Respects reduced motion.
 */
function MagneticButton({ children, className = "", onClick, strength = 0.35, ...rest }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

  const handleMove = (e) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <motion.button
      ref={ref}
      onMouseMove={prefersReduced() ? undefined : handleMove}
      onMouseLeave={prefersReduced() ? undefined : reset}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export default MagneticButton;
