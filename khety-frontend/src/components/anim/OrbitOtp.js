import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Orbit OTP — inspired by the "4 boxes → one ring → verified tile" reference.
 * The four digits curl onto an orbit, spin a turn and a quarter, then screw
 * down into a single verified tile. Colour is reserved for verdicts:
 * neutral while typing, green only when verification succeeds, red shake
 * when it fails.
 *
 * Completely frontend: it only composes the OTP string and hands it to
 * `onComplete` — the existing backend /api/auth/verify-otp call is untouched.
 */
function OrbitOtp({ length = 4, onComplete, onVerify, onChange, resetKey = 0 }) {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const [phase, setPhase] = useState("entry"); // entry | orbit | verify | success | error
  const inputsRef = useRef([]);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);

    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    onChange?.(next.join(""));

    if (cleaned && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // The last digit lands → curl onto the orbit
    if (index === length - 1 && cleaned && next.every((d) => d)) {
      const code = next.join("");
      setPhase("orbit");
      setTimeout(() => {
        setPhase("verify");
        setTimeout(async () => {
          try {
            await onVerify(code);
            setPhase("success");
            onComplete?.(code);
          } catch (err) {
            setPhase("error");
            setTimeout(() => {
              setPhase("entry");
              setDigits(Array(length).fill(""));
              inputsRef.current[0]?.focus();
            }, 900);
          }
        }, 750);
      }, 1100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const next = [...digits];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    onChange?.(next.join(""));

    if (pasted.length === length) {
      const code = next.join("");
      setPhase("orbit");
      setTimeout(() => {
        setPhase("verify");
        setTimeout(async () => {
          try {
            await onVerify(code);
            setPhase("success");
            onComplete?.(code);
          } catch (err) {
            setPhase("error");
            setTimeout(() => {
              setPhase("entry");
              setDigits(Array(length).fill(""));
              inputsRef.current[0]?.focus();
            }, 900);
          }
        }, 750);
      }, 1100);
    } else {
      inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  };

  // Orbit positions — tiles fan out around the hub
  const orbitTransform = (i) => {
    const angle = (i / (length - 1)) * 100 - 50; // degrees offset
    const radius = 56;
    const rad = (angle * Math.PI) / 180;
    return { x: Math.sin(rad) * radius, y: -Math.cos(rad) * radius * 0.55 };
  };

  if (reduced) {
    // Reduced motion: plain inputs, no orbit — verify still works.
    return (
      <div className="flex items-center justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
            maxLength={1}
            aria-label={`OTP digit ${i + 1}`}
            className="h-14 w-12 rounded-2xl border-2 border-[#355245] bg-[#0c1511] text-center text-2xl font-extrabold text-white outline-none focus:border-[#7fcea1]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex h-32 items-center justify-center" key={resetKey}>
      <AnimatePresence>
        {phase === "entry" && (
          <motion.div
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-3"
          >
            {digits.map((d, i) => (
              <motion.div
                key={i}
                animate={
                  phase === "error"
                    ? { x: [0, -7, 7, -5, 5, 0] }
                    : {}
                }
                transition={{ duration: 0.45 }}
                className={
                  phase === "error"
                    ? "border-[#d26b4a]"
                    : "border-[#355245]"
                }
              >
                <input
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`OTP digit ${i + 1}`}
                  className="h-14 w-12 rounded-2xl border-2 border-inherit bg-[#0c1511] text-center text-2xl font-extrabold text-white outline-none transition-colors focus:border-[#7fcea1]"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {(phase === "orbit" || phase === "verify") && (
          <motion.div
            key="orbit"
            className="relative flex h-28 w-56 items-center justify-center"
            animate={{ rotate: phase === "orbit" ? 450 : 470 }}
            transition={{ duration: phase === "orbit" ? 1.1 : 1.4, ease: [0.3, 0.6, 0.25, 1] }}
          >
            {digits.map((d, i) => {
              const pos = orbitTransform(i);
              return (
                <motion.div
                  key={i}
                  className="absolute flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#355245] bg-[#0c1511] text-xl font-extrabold text-white"
                  initial={{ x: 0, y: 0 }}
                  animate={{ x: pos.x, y: pos.y }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                  style={{ transformOrigin: "0px 110px" }}
                >
                  {d}
                </motion.div>
              );
            })}
            {/* hub */}
            <div className="absolute h-16 w-16 rounded-full border border-dashed border-[#355245]" />
          </motion.div>
        )}

        {phase === "success" && (
          <motion.div
            key="success"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3f8f5f] shadow-[0_0_34px_rgba(63,143,95,0.55)]"
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M4 12.5 L9.5 18 L20 6.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
              />
            </motion.svg>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: [0, -8, 8, -6, 6, 0] }}
            transition={{ duration: 0.5 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#d26b4a] bg-[#2a1510] text-2xl"
          >
            ✕
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrbitOtp;
