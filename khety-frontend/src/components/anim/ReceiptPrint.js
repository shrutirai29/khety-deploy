import { motion } from "framer-motion";

/**
 * Receipt-print reveal — inspired by the thermal receipt reference.
 * Content "prints" line by line: a printer head slides down, each line
 * types in, and the final line lands with the accent colour. It only
 * presents data passed by the caller (the real backend result).
 */
function ReceiptPrint({
  items = [],
  header = "Khety · Diagnostics",
  footer = "End of report",
  className = ""
}) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-dashed border-[#355245] bg-[#f7f4ea] px-6 py-5 ${className}`}
    >
      {/* perforated top */}
      <div className="absolute inset-x-0 top-0 flex justify-between px-1 opacity-40">
        {Array.from({ length: 26 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1 rounded-full bg-[#5e6b62]" />
        ))}
      </div>

      {/* header */}
      <div className="mt-1 border-b border-dashed border-[#9aa48c] pb-2 text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#8a5b21]">
          {header}
        </p>
      </div>

      <div className="relative mt-3 space-y-2.5 font-mono">
        {items.map((item, i) => {
          const isVerdict = item.verdict;

          return (
            <motion.div
              key={`${i}-${item.label || item.text}`}
              initial={reduced ? { opacity: 1 } : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { delay: 0.35 + i * 0.38, duration: 0.3 }
              }
              className={isVerdict ? "mt-2 pt-2" : ""}
            >
              {isVerdict && (
                <div className="mb-1 border-t border-dashed border-[#9aa48c]" />
              )}
              {item.label && (
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.25em] ${
                    isVerdict ? "text-[#3f8f5f]" : "text-[#8a5b21]"
                  }`}
                >
                  {item.label}
                </p>
              )}
              <p
                className={`text-sm leading-6 ${
                  isVerdict
                    ? "text-[#1c5b36]"
                    : item.muted
                      ? "text-[#8a9488]"
                      : "text-[#33443a]"
                }`}
              >
                {item.text}
              </p>
            </motion.div>
          );
        })}

        {/* printer head that slides down during printing */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 h-[2px] bg-[#215732]/70"
            initial={{ top: "0%" }}
            animate={{ top: `${Math.min(items.length * 42, 100)}%` }}
            transition={{ duration: 0.35 + items.length * 0.38, ease: "linear" }}
          />
        )}
      </div>

      <div className="mt-3 border-t border-dashed border-[#9aa48c] pt-2 text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#8a9488]">
          — {footer} —
        </p>
      </div>
    </div>
  );
}

export default ReceiptPrint;
