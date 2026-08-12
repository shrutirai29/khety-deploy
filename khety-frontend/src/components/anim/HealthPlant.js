import { motion } from "framer-motion";

/**
 * Crop-health plant — visualizes the real verdict from the backend:
 *  - healthy  → seed → sprout → healthy upright plant (green)
 *  - disease  → seed → sprout → stressed leaf with spots (amber/red)
 * The verdict string comes from the actual model response.
 */
function HealthPlant({ healthy = true, prediction = "", className = "" }) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stemColor = healthy ? "#3f8f5f" : "#b98a3d";
  const leafColor = healthy ? "#56ab74" : "#c99b4a";
  const spotColor = healthy ? "none" : "#a34a32";

  const seq = (delay) =>
    reduced
      ? {}
      : { opacity: 0, scale: 0.4, transition: { delay, duration: 0.5, ease: "easeOut" } };

  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 140" className="h-32 w-28">
        {/* soil */}
        <motion.ellipse
          cx="60"
          cy="132"
          rx="46"
          ry="7"
          fill="#173d24"
          initial={seq(0)}
          animate={{ opacity: 1, scale: 1 }}
        />
        <motion.ellipse
          cx="60"
          cy="132"
          rx="30"
          ry="4"
          fill="#102217"
          initial={seq(0.1)}
          animate={{ opacity: 1, scale: 1 }}
        />

        {/* stem */}
        <motion.path
          d={healthy ? "M60 128 C 58 104, 64 84, 60 62" : "M60 128 C 58 104, 64 84, 58 70 C 52 66, 60 62, 60 62"}
          stroke={stemColor}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reduced ? { duration: 0 } : { delay: 0.2, duration: 0.6 }}
        />

        {healthy ? (
          <>
            {/* left leaf */}
            <motion.path
              d="M60 92 C 42 86, 28 74, 22 56 C 40 60, 54 72, 60 88 Z"
              fill={leafColor}
              initial={seq(0.55)}
              animate={{ opacity: 1, scale: 1 }}
              style={{ transformOrigin: "60px 92px" }}
            />
            {/* right leaf */}
            <motion.path
              d="M60 70 C 76 66, 90 54, 96 38 C 80 42, 66 54, 60 68 Z"
              fill={leafColor}
              initial={seq(0.75)}
              animate={{ opacity: 1, scale: 1 }}
              style={{ transformOrigin: "60px 70px" }}
            />
            {/* crown leaf */}
            <motion.path
              d="M60 62 C 48 56, 38 44, 34 28 C 50 34, 58 46, 60 60 Z"
              fill="#63bd84"
              initial={seq(0.95)}
              animate={{ opacity: 1, scale: 1 }}
              style={{ transformOrigin: "60px 62px" }}
            />
            <motion.path
              d="M60 62 C 72 56, 82 44, 86 28 C 70 34, 62 46, 60 60 Z"
              fill="#4c9c69"
              initial={seq(1.1)}
              animate={{ opacity: 1, scale: 1 }}
              style={{ transformOrigin: "60px 62px" }}
            />
          </>
        ) : (
          <>
            {/* drooping stressed leaves */}
            <motion.path
              d="M60 96 C 44 92, 26 88, 14 74 C 28 76, 46 82, 58 92 Z"
              fill={leafColor}
              initial={seq(0.55)}
              animate={{ opacity: 1, scale: 1, rotate: 14 }}
              style={{ transformOrigin: "60px 96px" }}
            />
            <motion.path
              d="M60 84 C 76 82, 94 76, 106 62 C 92 66, 74 72, 60 80 Z"
              fill={leafColor}
              initial={seq(0.75)}
              animate={{ opacity: 1, scale: 1, rotate: -14 }}
              style={{ transformOrigin: "60px 84px" }}
            />
            {/* damage spots */}
            <motion.circle
              cx="34"
              cy="80"
              r="3.4"
              fill={spotColor}
              initial={seq(1.0)}
              animate={{ opacity: 1, scale: 1 }}
            />
            <motion.circle
              cx="88"
              cy="70"
              r="2.6"
              fill={spotColor}
              initial={seq(1.1)}
              animate={{ opacity: 1, scale: 1 }}
            />
            <motion.circle
              cx="46"
              cy="86"
              r="2"
              fill={spotColor}
              initial={seq(1.2)}
              animate={{ opacity: 1, scale: 1 }}
            />
            {/* wilt line */}
            <motion.path
              d="M54 120 C 56 116, 54 112, 56 108"
              stroke="#a34a32"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            />
          </>
        )}
      </svg>
    </div>
  );
}

export default HealthPlant;
