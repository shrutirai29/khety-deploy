import { useState } from "react";
import { API_BASE_URL, ML_API_BASE_URL, apiFetch } from "../lib/api";

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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Detect Disease
          </h1>

          <p className="text-gray-500 text-sm mb-4">
            Upload a clear leaf photo to analyze
          </p>

          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            Current model support: pepper, potato, and tomato leaves. Screenshots, scrap images, unsupported crops, and unclear photos will return a sorry-cannot-detect result.
          </p>

          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${
              dragActive
                ? "border-green-600 bg-green-50 scale-[1.01]"
                : "border-green-400 hover:bg-green-50"
            }`}
          >
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <span className="text-4xl mb-2">Upload</span>
            <p className="text-green-700 font-medium">
              {dragActive ? "Drop it here to analyze" : "Click to upload or drag an image"}
            </p>
            <p className="text-xs text-gray-400">JPG / PNG supported • up to 5 MB</p>
          </label>

          <button
            type="button"
            onClick={() => document.getElementById("detect-camera-input")?.click()}
            className="mt-3 w-full rounded-xl border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
          >
            📷 Use camera
          </button>
          <input
            id="detect-camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-full h-48 object-cover rounded-xl mt-4 shadow"
            />
          )}

          <button
            onClick={handleUpload}
            className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            {loading ? "Analyzing..." : "Detect Disease"}
          </button>

          {loading && (
            <p className="text-center text-gray-500 mt-2 animate-pulse">
              AI is analyzing your crop...
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-center">
          {!result ? (
            <div className="text-center text-gray-400">
              <p className="text-lg">No results yet</p>
              <p className="text-sm">Upload an image to see report</p>
            </div>
          ) : (
            <>
              <div className={`p-4 rounded-xl mb-4 ${result.recognized ? "bg-green-100" : "bg-amber-100"}`}>
                <h2 className={`text-lg font-bold ${result.recognized ? "text-green-700" : "text-amber-800"}`}>
                  {result.prediction}
                </h2>
                <p className="text-sm text-gray-600">
                  Confidence: {result.confidence}%
                </p>
                {result.message && (
                  <p className="text-sm text-gray-700 mt-2">
                    {result.message}
                  </p>
                )}
                {analysisSeconds !== null && (
                  <p className="text-xs text-gray-400 mt-2">
                    Analysis completed in {analysisSeconds}s
                  </p>
                )}
                {result.reason && (
                  <p className="text-sm text-amber-700 mt-2">
                    Reason: {result.reason}
                  </p>
                )}
                {Array.isArray(result.leaf_validation?.signals) && result.leaf_validation.signals.length > 0 && (
                  <p className="text-xs text-amber-800 mt-2">
                    Validation: {result.leaf_validation.signals.join(", ")}
                  </p>
                )}
              </div>

              {Array.isArray(result.image_quality?.warnings) && result.image_quality.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <p className="font-semibold text-amber-800 mb-2">Image tips</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {result.image_quality.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(result.top_predictions) && result.top_predictions.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                  <p className="font-semibold text-slate-800 mb-2">Top matches</p>
                  <div className="space-y-2 text-sm">
                    {result.top_predictions.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="font-medium text-slate-900">{item.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Problem</p>
                  <p className="text-gray-600">{info.problem}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Cause</p>
                  <p className="text-gray-600">{info.cause}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Symptoms</p>
                  <p className="text-gray-600">{info.symptoms}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Solution</p>
                  <p className="text-green-700 font-medium">{info.solution}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Detect;
