import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL, ML_API_BASE_URL, apiFetch } from "../lib/api";
import ScanOverlay from "../components/anim/ScanOverlay";
import ConfidenceRing from "../components/anim/ConfidenceRing";

const diseaseInfo = {
  pepper_bell___bacterial_spot: {
    problem: "This is a bacterial infection that affects pepper plants. It starts as small dark spots on leaves and fruits.",
    cause: "It is usually caused by bacteria spreading through water, rain splashes, or infected tools.",
    symptoms: "You will see small brown or black spots on leaves. Leaves may turn yellow and fall early. Fruits may also get damaged spots.",
    damage: "If not treated, it reduces plant growth and affects the quality and size of fruits.",
    solution: "Remove infected leaves immediately. Avoid watering directly on leaves. Use copper-based spray every 7 to 10 days. Keep proper spacing between plants for airflow."
  },
  pepper_bell___healthy: {
    problem: "Your plant is completely healthy and shows no signs of disease.",
    cause: "Good care like proper watering, sunlight, and nutrients.",
    symptoms: "Leaves are green, no spots, and no visible damage.",
    damage: "No damage.",
    solution: "Continue doing what you are doing and inspect plants regularly."
  },
  potato___early_blight: {
    problem: "A fungal disease that mainly affects older leaves first.",
    cause: "Caused by fungus, usually due to high humidity and poor air circulation.",
    symptoms: "Brown spots with circular rings and yellowing leaves.",
    damage: "Reduces plant strength and lowers crop yield.",
    solution: "Remove infected leaves. Use fungicides like chlorothalonil. Avoid watering leaves and rotate crops."
  },
  potato___healthy: {
    problem: "The potato leaf appears healthy.",
    cause: "Normal healthy growth.",
    symptoms: "Green, intact leaf surface with no disease spots.",
    damage: "No damage.",
    solution: "Continue regular monitoring and balanced crop care."
  },
  potato___late_blight: {
    problem: "A dangerous fungal disease that spreads quickly.",
    cause: "Usually appears in cool and wet conditions.",
    symptoms: "Large dark patches on leaves and stems, sometimes with white fungal growth underneath.",
    damage: "Can destroy the entire crop within days.",
    solution: "Remove infected plants quickly. Use fungicides like mancozeb and improve drainage."
  },
  tomato_target_spot: {
    problem: "Fungal infection causing leaf spots.",
    cause: "Warm and humid conditions.",
    symptoms: "Brown spots with rings on leaves and fruits.",
    damage: "Reduces fruit quality and plant vigor.",
    solution: "Use fungicides and remove infected leaves."
  },
  tomato_mosaic_virus: {
    problem: "Viral disease affecting tomato plant growth.",
    cause: "Spread through infected tools, hands, or plant material.",
    symptoms: "Leaves show a light and dark green mosaic pattern and distorted growth.",
    damage: "Plants become weak and yields drop.",
    solution: "Remove infected plants and disinfect tools before touching healthy plants."
  },
  tomato_yellow_leaf_curl_virus: {
    problem: "Serious viral infection in tomatoes.",
    cause: "Spread by whiteflies.",
    symptoms: "Leaves curl upward and turn yellow.",
    damage: "Plant growth slows and yield drops sharply.",
    solution: "Control whiteflies, remove infected plants, and protect healthy plants early."
  },
  tomato_bacterial_spot: {
    problem: "Bacterial disease affecting tomato leaves and fruits.",
    cause: "Usually spreads through infected seeds, splashing water, or tools.",
    symptoms: "Small dark spots on leaves and rough spots on fruits.",
    damage: "Can reduce fruit quality and weaken plant growth.",
    solution: "Remove affected leaves, avoid wetting foliage, and use a copper-based spray."
  },
  tomato_early_blight: {
    problem: "Common fungal disease in tomatoes.",
    cause: "High moisture and poor air circulation.",
    symptoms: "Brown spots with rings on older leaves. Leaves may fall early.",
    damage: "Weakens the plant and reduces fruit production.",
    solution: "Remove affected leaves, use fungicide spray, and maintain spacing between plants."
  },
  tomato_healthy: {
    problem: "The tomato plant appears healthy.",
    cause: "Good maintenance and growing conditions.",
    symptoms: "Green leaves with no visible disease damage.",
    damage: "No damage.",
    solution: "Continue proper care and check plants regularly."
  },
  tomato_late_blight: {
    problem: "Fast-spreading disease affecting tomato plants.",
    cause: "Cool and humid weather.",
    symptoms: "Large dark patches on leaves and stems. Leaves rot quickly.",
    damage: "Can destroy the plant rapidly if untreated.",
    solution: "Remove infected plants, use fungicides, and avoid wet conditions."
  },
  tomato_leaf_mold: {
    problem: "Fungal disease common in humid environments.",
    cause: "High humidity and poor airflow.",
    symptoms: "Yellow spots on top of leaves and mold underneath.",
    damage: "Reduces plant health and fruit quality.",
    solution: "Improve air circulation, reduce humidity, and use fungicide if needed."
  },
  tomato_septoria_leaf_spot: {
    problem: "Leaf infection causing small spots.",
    cause: "Fungus spreading through water and wind.",
    symptoms: "Small round spots with gray center and dark border.",
    damage: "Leaves fall early, reducing plant strength.",
    solution: "Remove infected leaves, avoid overhead watering, and use fungicide regularly."
  },
  tomato_spider_mites_two_spotted_spider_mite: {
    problem: "Tiny pests sucking plant nutrients.",
    cause: "Dry and hot conditions favor mites.",
    symptoms: "Yellow dots on leaves and web-like structures.",
    damage: "Leaves dry out and may fall off.",
    solution: "Spray water on leaves and use neem oil or an appropriate miticide."
  },
  unclear_or_unsupported_image: {
    problem: "This image is not suitable for disease detection.",
    cause: "The upload looks like a screenshot, a non-leaf image, or an unclear crop photo.",
    symptoms: "The model cannot safely verify a crop disease from this image.",
    damage: "Using this result would be misleading.",
    solution: "Upload one close-up photo of a real leaf in good light with the leaf filling most of the frame."
  },
  sorry_cannot_detect_this_image_reliably: {
    problem: "This image is not suitable for disease detection.",
    cause: "The upload looks like a screenshot, a non-leaf image, an unsupported crop, or an unclear crop photo.",
    symptoms: "The safety gate blocked disease prediction because the image is not reliable enough.",
    damage: "Using a disease name here would likely be wrong.",
    solution: "Upload one sharp close-up photo of a single pepper, potato, or tomato leaf in natural light."
  },
  default: {
    problem: "A plant issue may be present.",
    cause: "Could be due to bacteria, fungus, virus, pests, or an unclear image.",
    symptoms: "Visible damage on leaves or plant structure.",
    damage: "Can reduce plant growth and yield.",
    solution: "Retake the photo clearly and consult an expert if symptoms persist."
  }
};

const predictionKeyMap = {
  "Pepper Bell - Bacterial Spot": "pepper_bell___bacterial_spot",
  "Pepper Bell - Healthy": "pepper_bell___healthy",
  "Potato - Early Blight": "potato___early_blight",
  "Potato - Healthy": "potato___healthy",
  "Potato - Late Blight": "potato___late_blight",
  "Tomato - Target Spot": "tomato_target_spot",
  "Tomato - Mosaic Virus": "tomato_mosaic_virus",
  "Tomato - Yellow Leaf Curl Virus": "tomato_yellow_leaf_curl_virus",
  "Tomato - Bacterial Spot": "tomato_bacterial_spot",
  "Tomato - Early Blight": "tomato_early_blight",
  "Tomato - Healthy": "tomato_healthy",
  "Tomato - Late Blight": "tomato_late_blight",
  "Tomato - Leaf Mold": "tomato_leaf_mold",
  "Tomato - Septoria Leaf Spot": "tomato_septoria_leaf_spot",
  "Tomato - Spider Mites": "tomato_spider_mites_two_spotted_spider_mite",
  "Unclear or Unsupported Image": "unclear_or_unsupported_image",
  "Sorry, cannot detect this image reliably": "sorry_cannot_detect_this_image_reliably"
};

const formatKey = (prediction = "") =>
  prediction
    .replace(/[()]/g, "")
    .replace(/ /g, "_")
    .replace(/-/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();

const getDiseaseInfo = (prediction, recognized = true) => {
  if (!recognized) {
    const exactKey = predictionKeyMap[prediction];
    return (exactKey && diseaseInfo[exactKey]) || diseaseInfo.sorry_cannot_detect_this_image_reliably;
  }

  const exactKey = predictionKeyMap[prediction];
  if (exactKey && diseaseInfo[exactKey]) {
    return diseaseInfo[exactKey];
  }

  const normalizedKey = formatKey(prediction);
  return diseaseInfo[normalizedKey] || diseaseInfo.default;
};

function Detect() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analysisSeconds, setAnalysisSeconds] = useState(null);

  const acceptFile = (selected) => {
    if (!selected) {
      return;
    }

    if (!selected.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      alert("Please choose an image smaller than 5 MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  };

  const handleFileChange = (e) => {
    acceptFile(e.target.files?.[0]);
    // Allow re-selecting the same file for a fresh scan.
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    acceptFile(e.dataTransfer?.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image");
      return;
    }

    setLoading(true);
    setAnalysisSeconds(null);

    const startedAt = performance.now();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${ML_API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ML API failed");
      }

      setAnalysisSeconds(Number(((performance.now() - startedAt) / 1000).toFixed(1)));
      setResult(data);

      if (!data.recognized) {
        setLoading(false);
        return;
      }

      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const uploadResponse = await fetch(`${API_BASE_URL}/api/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`
        },
        body: uploadForm,
      });

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url;
      const user = JSON.parse(sessionStorage.getItem("user"));

      if (user && user._id) {
        const info = getDiseaseInfo(data.prediction, data.recognized);

        await apiFetch("/api/save-prediction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user._id,
            image: imageUrl,
            result: data.prediction,
            confidence: data.confidence,
            report: info
          }),
        });
      }
    } catch (err) {
      console.log("Detection error:", err);
      alert(err.message || "Error detecting disease");
    }

    setLoading(false);
  };

  const info = result ? getDiseaseInfo(result.prediction, result.recognized) : null;

  return (
    <div className="min-h-screen bg-[#0c1511] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* header */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#7fcea1]/30 bg-[#7fcea1]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-[#7fcea1]"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7fcea1]" />
            AI Disease Detection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-4xl font-extrabold text-white md:text-5xl"
          >
            Scan a leaf. Get the truth.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8fa296]"
          >
            Current model support: pepper, potato, and tomato leaves. Screenshots,
            scrap images, unsupported crops, and unclear photos return a
            "cannot detect" result instead of a guess.
          </motion.p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* LEFT — upload + scan */}
          <div className="rounded-[32px] border border-[#294036] bg-[#14201a] p-6">
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed p-8 text-center transition ${
                dragActive
                  ? "border-[#7fcea1] bg-[#0c1511] scale-[1.01]"
                  : "border-[#355245] hover:border-[#7fcea1]/50 hover:bg-[#0c1511]/60"
              }`}
            >
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

              {preview ? (
                <>
                  <img src={preview} alt="Leaf preview" className="absolute inset-0 h-full w-full object-cover" />
                  {loading && <ScanOverlay />}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 text-left">
                    <p className="text-xs font-semibold text-white/80">
                      {loading ? "AI is scanning this leaf…" : "Ready to analyze"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#7fcea1]/40 bg-[#7fcea1]/10 text-4xl"
                  >
                    🌱
                  </motion.div>
                  <p className="mt-5 text-lg font-bold text-white">
                    {dragActive ? "Drop it here to analyze" : "Click to upload or drag an image"}
                  </p>
                  <p className="mt-1 text-xs text-[#8fa296]">JPG / PNG supported • up to 5 MB</p>
                </div>
              )}
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => document.getElementById("detect-camera-input")?.click()}
                className="rounded-2xl border border-[#355245] bg-[#0c1511] px-4 py-3 text-sm font-bold text-white transition hover:border-[#7fcea1]/50"
              >
                📷 Use camera
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="khety-shine khety-keep-dark-text rounded-2xl bg-[#7fcea1] px-4 py-3 text-sm font-extrabold text-[#102217] transition hover:bg-[#96dcb2] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Analyzing…" : "Detect Disease"}
              </button>
            </div>
            <input
              id="detect-camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 rounded-2xl border border-[#294036] bg-[#0c1511] p-4"
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.25em] text-[#7fcea1]">
                  <span>Neural network active</span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    ●
                  </motion.span>
                </div>
                <div className="mt-3 space-y-2">
                  {["Extracting features", "Comparing 15 classes", "Validating quality"].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.3 }}
                      className="flex items-center gap-3 text-sm text-[#b9c8bd]"
                    >
                      <span className="text-[#7fcea1]">✦</span> {step}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT — results */}
          <div className="min-h-[480px]">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-[32px] border border-[#294036] bg-[#14201a] p-10 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#355245] bg-[#0c1511] text-3xl">
                    🔬
                  </div>
                  <p className="mt-6 text-lg font-bold text-white">No results yet</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[#8fa296]">
                    Upload a clear leaf photo and run the scan — the live model
                    will return a confidence-scored diagnosis.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* verdict card */}
                  <div className="rounded-[32px] border border-[#294036] bg-[#14201a] p-7">
                    <div className="flex flex-wrap items-center gap-6">
                      <ConfidenceRing value={Number(result.confidence) || 0} />
                      <div className="min-w-[180px] flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7fcea1]">
                          Diagnosis
                        </p>
                        <h2 className={`mt-2 text-2xl font-extrabold ${result.recognized ? "text-white" : "text-[#e6b45e]"}`}>
                          {result.prediction}
                        </h2>
                        {result.message && (
                          <p className="mt-2 text-sm leading-6 text-[#b9c8bd]">{result.message}</p>
                        )}
                        {analysisSeconds !== null && (
                          <p className="mt-2 text-xs text-[#8fa296]">
                            ⚡ Analysis completed in {analysisSeconds}s
                          </p>
                        )}
                      </div>
                    </div>

                    {result.reason && (
                      <p className="mt-5 rounded-2xl border border-[#d9a441]/30 bg-[#d9a441]/10 px-4 py-3 text-sm text-[#e8c98d]">
                        Reason: {result.reason}
                      </p>
                    )}

                    {Array.isArray(result.leaf_validation?.signals) && result.leaf_validation.signals.length > 0 && (
                      <p className="mt-3 rounded-2xl border border-[#d9a441]/30 bg-[#d9a441]/10 px-4 py-3 text-xs text-[#e8c98d]">
                        Validation: {result.leaf_validation.signals.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* top matches */}
                  {Array.isArray(result.top_predictions) && result.top_predictions.length > 0 && (
                    <div className="rounded-[32px] border border-[#294036] bg-[#14201a] p-7">
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8fa296]">
                        Top matches
                      </p>
                      <div className="mt-4 space-y-3">
                        {result.top_predictions.map((item, i) => (
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
                    </div>
                  )}

                  {/* image quality tips */}
                  {Array.isArray(result.image_quality?.warnings) && result.image_quality.warnings.length > 0 && (
                    <div className="rounded-[32px] border border-[#d9a441]/30 bg-[#d9a441]/10 p-7">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e6b45e]">
                        Photo tips
                      </p>
                      <ul className="mt-3 space-y-1.5 text-sm text-[#e8c98d]">
                        {result.image_quality.warnings.map((warning) => (
                          <li key={warning}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* full report */}
                  {info && (
                    <div className="grid gap-4 rounded-[32px] border border-[#294036] bg-[#14201a] p-7 md:grid-cols-2">
                      {[
                        ["Problem", info.problem, "#d9a441"],
                        ["Cause", info.cause, "#7fcea1"],
                        ["Symptoms", info.symptoms, "#7fcea1"],
                        ["Solution", info.solution, "#96dcb2"]
                      ].map(([label, text, color]) => (
                        <div key={label} className="rounded-2xl border border-[#294036] bg-[#0c1511] p-5">
                          <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color }}>
                            {label}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#b9c8bd]">{text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detect;
