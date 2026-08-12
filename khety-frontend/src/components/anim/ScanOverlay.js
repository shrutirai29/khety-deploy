import { motion } from "framer-motion";

/**
 * Futuristic AI scanning overlay for the crop-analysis experience:
 * a scanning line sweeps down, corner brackets frame the image, and a
 * subtle pulse communicates "processing". Pure presentation — the real
 * inference still happens in the existing ML backend.
 */
function ScanOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]">
      {/* corner brackets */}
      {[
        "left-4 top-4 border-l-2 border-t-2",
        "right-4 top-4 border-r-2 border-t-2",
        "left-4 bottom-4 border-l-2 border-b-2",
        "right-4 bottom-4 border-r-2 border-b-2"
      ].map((pos) => (
        <div
          key={pos}
          className={`absolute h-8 w-8 border-[#7fcea1] ${pos} shadow-[0_0_12px_rgba(127,206,161,0.6)]`}
        />
      ))}

      {/* sweeping scan line */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#7fcea1] to-transparent shadow-[0_0_18px_3px_rgba(127,206,161,0.7)]"
        initial={{ top: "4%" }}
        animate={{ top: ["4%", "96%", "4%"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* grid texture */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(127,206,161,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(127,206,161,0.14) 1px, transparent 1px)",
          backgroundSize: "34px 34px"
        }}
      />

      {/* label chip */}
      <motion.div
        className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-[#7fcea1]/50 bg-[#0c1511]/80 px-4 py-1.5 text-xs font-bold tracking-[0.3em] text-[#7fcea1] backdrop-blur"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        AI · ANALYZING
      </motion.div>
    </div>
  );
}

export default ScanOverlay;
