import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * 3D tilt card — rotates toward the cursor with a glare sheen.
 * Disabled for reduced-motion users.
 */
function TiltCard({ children, className = "", maxTilt = 10, glare = true }) {
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 160,
    damping: 18
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 160,
    damping: 18
  });

  const glareBackground = useTransform(
    [px, py],
    ([x, y]) =>
      `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.18), transparent 55%)`
  );

  const handleMove = (e) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 900 }}
      className={className}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBackground, opacity: 0.7 }}
        />
      )}
    </motion.div>
  );
}

export default TiltCard;
