import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ML_API_BASE_URL } from "../../lib/api";
import ScanOverlay from "./ScanOverlay";
import ConfidenceRing from "./ConfidenceRing";

const DISEASE_SHORTHAND = {
  healthy: "Healthy leaf — no disease detected",
  bacterial_spot: "Bacterial spot detected",
  early_blight: "Early blight (fungal) detected",
  late_blight: "Late blight (fungal) detected",
  leaf_mold: "Leaf mold detected",
  mosaic: "Mosaic virus detected",
  yellow_leaf_curl: "Yellow leaf curl virus detected",
  septoria: "Septoria leaf spot detected",
  spider_mites: "Spider mite damage detected",
  target_spot: "Target spot detected"
};

const friendlyPrediction = (label = "") => {
  const lower = label.toLowerCase();

  if (lower.includes("healthy")) return { tone: "good", text: DISEASE_SHORTHAND.healthy };
  if (lower.includes("yellow leaf curl")) return { tone: "warn", text: DISEASE_SHORTHAND.yellow_leaf_curl };
  if (lower.includes("mosaic")) return { tone: "warn", text: DISEASE_SHORTHAND.mosaic };
  if (lower.includes("leaf mold")) return { tone: "warn", text: DISEASE_SHORTHAND.leaf_mold };
  if (lower.includes("septoria")) return { tone: "warn", text: DISEASE_SHORTHAND.septoria };
  if (lower.includes("spider mite")) return { tone: "warn", text: DISEASE_SHORTHAND.spider_mites };
  if (lower.includes("target spot")) return { tone: "warn", text: DISEASE_SHORTHAND.target_spot };
  if (lower.includes("early blight")) return { tone: "warn", text: DISEASE_SHORTHAND.early_blight };
  if (lower.includes("late blight")) return { tone: "bad", text: DISEASE_SHORTHAND.late_blight };
  if (lower.includes("bacterial spot")) return { tone: "warn", text: DISEASE_SHORTHAND.bacterial_spot };

  if (lower.includes("unclear") || lower.includes("cannot detect")) {
    return { tone: "muted", text: "Image not suitable — no reliable diagnosis possible" };
  }

  return { tone: "neutral", text: label };
};

/**
 * The showpiece section: upload a leaf → cinematic scanning animation →
 * the REAL existing ML model returns its verdict → animated results.
 * This only calls the existing /predict endpoint — nothing is mocked.
 */
function AICropAnalysis() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | scanning | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const acceptFile = (selected) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please choose an image file (JPG / PNG).");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("Image is larger than 5 MB — please choose a smaller photo.");
      return;
    }

    setError("");
    setResult(null);
    setPhase("idle");
    setFile(selected);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(selected);
    });
  };

  const runAnalysis = async () => {
    if (!file || phase === "scanning") return;

    setError("");
    setPhase("scanning");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${ML_API_BASE_URL}/predict`, {
        method: "POST",
        body: formData
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Analysis service is unavailable right now.");
      }

      // Give the scanning animation a moment to breathe before results.
      setTimeout(() => {
        setResult(data);
        setPhase("done");
      }, 1400);
    } catch (err) {
      setError(err.message || "Something went wrong while analyzing the image.");
      setPhase("idle");
    }
  };

  const verdict = result ? friendlyPrediction(result.prediction) : null;
  const topPredictions = Array.isArray(result?.top_predictions)
    ? result.top_predictions.slice(0, 4)
    : [];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      {/* LEFT — the scanner */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            acceptFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            acceptFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <motion.div
          layout
          className={`relative overflow-hidden rounded-[32px] border transition-colors ${
            dragActive
              ? "border-[#7fcea1] bg-[#0c1511]"
              : "border-[#294036] bg-[#0c1511]"
          }`}
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/3]"
              >
                <img
                  src={preview}
                  alt="Leaf upload preview"
                  className="h-full w-full object-cover"
                />
                {phase === "scanning" && <ScanOverlay />}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent p-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setResult(null);
                      setPhase("idle");
                    }}
                    className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    Change image
                  </button>
                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={phase === "scanning"}
                    className="khety-keep-dark-text rounded-full bg-[#7fcea1] px-5 py-1.5 text-xs font-bold text-[#102217] transition hover:bg-[#96dcb2] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {phase === "scanning" ? "Analyzing…" : "Analyze leaf"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="drop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  acceptFile(e.dataTransfer?.files?.[0]);
                }}
                className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-4 p-10 text-center"
                onClick={() => inputRef.current?.click()}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-[#7fcea1]/40 bg-[#7fcea1]/10 text-4xl"
                >
                  🌱
                </motion.div>
                <div>
                  <p className="text-lg font-bold text-white">
                    Drop a leaf photo here
                  </p>
                  <p className="mt-1 text-sm text-[#8fa296]">
                    or click to browse · pepper, potato &amp; tomato
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="rounded-full border border-[#294036] px-4 py-1.5 text-xs font-semibold text-[#b9c8bd]">
                    JPG / PNG
                  </span>
                  <span className="rounded-full border border-[#294036] px-4 py-1.5 text-xs font-semibold text-[#b9c8bd]">
                    up to 5 MB
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraRef.current?.click();
                    }}
                    className="rounded-full bg-[#215732] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#173d24]"
                  >
                    📷 Camera
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ambient glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-3/4 -translate-x-1/2 rounded-full bg-[#7fcea1]/10 blur-3xl"
          />
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-[#d26b4a]/40 bg-[#d26b4a]/10 px-4 py-3 text-sm text-[#f0b49d]"
          >
            ⚠️ {error}
          </motion.p>
        )}
      </div>

      {/* RIGHT — results / status */}
      <div className="min-h-[420px]">
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-[32px] border border-[#294036] bg-[#0c1511] p-10 text-center"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-[#7fcea1]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#7fcea1]" />
                Model online
              </div>
              <p className="mt-6 max-w-sm text-2xl font-extrabold leading-snug text-white">
                Upload a leaf. Get a real diagnosis.
              </p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#8fa296]">
                Powered by the live Khety AI model — this is the same engine behind
                the Detect page, running on every scan.
              </p>
              <div className="mt-8 grid w-full max-w-sm grid-cols-3 gap-3 text-center">
                {[
                  ["3", "crops"],
                  ["15", "classes"],
                  ["100%", "real"]
                ].map(([num, label]) => (
                  <div key={label} className="rounded-2xl border border-[#294036] bg-[#14201a] p-4">
                    <p className="text-xl font-extrabold text-[#7fcea1]">{num}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[#8fa296]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-[32px] border border-[#294036] bg-[#0c1511] p-10 text-center"
            >
              <div className="flex items-center gap-3 text-sm font-bold tracking-[0.3em] text-[#7fcea1]">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  ●
                </motion.span>
                NEURAL NETWORK ACTIVE
              </div>
              <div className="mt-8 w-full max-w-xs space-y-4">
                {["Extracting leaf features", "Comparing 15 disease classes", "Validating image quality"].map(
                  (step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.35 }}
                      className="flex items-center justify-between rounded-2xl border border-[#294036] bg-[#14201a] px-4 py-3"
                    >
                      <span className="text-sm text-[#b9c8bd]">{step}</span>
                      <motion.span
                        animate={{ scale: [1, 1.25, 1] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.3 }}
                        className="text-[#7fcea1]"
                      >
                        ✦
                      </motion.span>
                    </motion.div>
                  )
                )}
              </div>
              <motion.div
                className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[#1d2d24]"
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#215732] via-[#7fcea1] to-[#d9a441]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          )}

          {phase === "done" && result && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] border border-[#294036] bg-[#0c1511] p-8"
            >
              <div className="flex flex-wrap items-center gap-6">
                <ConfidenceRing value={Number(result.confidence) || 0} />
                <div className="min-w-[200px] flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7fcea1]">
                    Diagnosis
                  </p>
                  <p className="mt-2 text-2xl font-extrabold leading-tight text-white">
                    {result.prediction}
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      verdict?.tone === "good"
                        ? "text-[#7fcea1]"
                        : verdict?.tone === "warn"
                          ? "text-[#e6b45e]"
                          : "text-[#8fa296]"
                    }`}
                  >
                    {verdict?.text}
                  </p>
                  {result.reason && (
                    <p className="mt-1 text-xs text-[#8fa296]">{result.reason}</p>
                  )}
                </div>
              </div>

              {topPredictions.length > 0 && (
                <div className="mt-7 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8fa296]">
                    Top matches
                  </p>
                  {topPredictions.map((item, i) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-[#b9c8bd]">{item.label}</span>
                        <span className="font-bold text-white">{item.confidence}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#1d2d24]">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#215732] to-[#7fcea1]"
                          initial={{ width: "0%" }}
                          animate={{ width: `${item.confidence}%` }}
                          transition={{ delay: 0.15 + i * 0.12, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(result.image_quality?.warnings) &&
                result.image_quality.warnings.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-[#d9a441]/30 bg-[#d9a441]/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e6b45e]">
                      Photo tips
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-[#e8c98d]">
                      {result.image_quality.warnings.map((w) => (
                        <li key={w}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setResult(null);
                  setPhase("idle");
                }}
                className="mt-6 w-full rounded-2xl border border-[#7fcea1]/40 bg-[#7fcea1]/10 px-4 py-3 text-sm font-bold text-[#7fcea1] transition hover:bg-[#7fcea1]/20"
              >
                Scan another leaf
              </button>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-[32px] border border-[#d26b4a]/40 bg-[#0c1511] p-10 text-center"
            >
              <p className="text-4xl">🌧️</p>
              <p className="mt-4 text-lg font-bold text-white">Analysis failed</p>
              <p className="mt-2 text-sm text-[#8fa296]">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AICropAnalysis;
