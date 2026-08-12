import { useRef, useState } from "react";

/**
 * Card with a soft spotlight that follows the cursor. Mouse-follow radial
 * highlight — premium interactive card effect.
 */
function SpotlightCard({ children, className = "", spotlightColor = "rgba(127, 206, 161, 0.22)" }) {
  const ref = useRef(null);
  const [spot, setSpot] = useState({ x: -200, y: -200, opacity: 0 });

  const handleMove = (e) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    setSpot({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, opacity: 0 }))}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: spot.opacity,
          background: `radial-gradient(340px circle at ${spot.x}px ${spot.y}px, ${spotlightColor}, transparent 70%)`
        }}
      />
      {children}
    </div>
  );
}

export default SpotlightCard;
