import { useState } from "react";
import { API_BASE_URL, ML_API_BASE_URL, apiFetch } from "../lib/api";

// 🌿 Disease Info
const diseaseInfo = {

  "pepper_bell___bacterial_spot": {
    problem: "This is a bacterial infection that affects pepper plants. It starts as small dark spots on leaves and fruits.",
    cause: "It is usually caused by bacteria spreading through water, rain splashes, or infected tools.",
    symptoms: "You will see small brown/black spots on leaves. Leaves may turn yellow and fall early. Fruits may also get damaged spots.",
    damage: "If not treated, it reduces plant growth and affects the quality and size of fruits.",
    solution: "Remove infected leaves immediately. Avoid watering directly on leaves. Use copper-based spray every 7–10 days. Keep proper spacing between plants for airflow."
  },

  "pepper_bell___healthy": {
    problem: "Your plant is completely healthy and shows no signs of disease.",
    cause: "Good care like proper watering, sunlight, and nutrients.",
    symptoms: "Leaves are green, no spots, no damage.",
    damage: "No damage.",
    solution: "Continue doing what you're doing. Check plants regularly to catch any disease early."
  },

  "potato___early_blight": {
    problem: "A fungal disease that mainly affects older leaves first.",
    cause: "Caused by fungus, usually due to high humidity and poor air circulation.",
    symptoms: "Brown spots with circular rings (target-like pattern). Leaves turn yellow and dry.",
    damage: "Reduces plant strength and lowers crop yield.",
    solution: "Remove infected leaves. Use fungicides like chlorothalonil. Avoid watering leaves. Rotate crops every season."
  },

  "potato___late_blight": {
    problem: "A very dangerous fungal disease that spreads quickly.",
    cause: "Occurs in cool and wet conditions.",
    symptoms: "Large dark patches on leaves and stems. White fungus may appear underneath leaves.",
    damage: "Can destroy the entire crop within days.",
    solution: "Remove infected plants immediately. Use fungicides like mancozeb. Avoid excess watering and improve drainage."
  },

  "tomato_early_blight": {
    problem: "Common fungal disease in tomatoes.",
    cause: "High moisture and poor air circulation.",
    symptoms: "Brown spots with rings on older leaves. Leaves fall early.",
    damage: "Weakens plant and reduces fruit production.",
    solution: "Remove affected leaves. Use fungicide spray. Maintain spacing between plants."
  },

  "tomato_late_blight": {
    problem: "Fast-spreading disease affecting tomato plants.",
    cause: "Cool and humid weather.",
    symptoms: "Large dark patches on leaves and stems. Leaves rot quickly.",
    damage: "Destroys plant rapidly if untreated.",
    solution: "Remove infected plants. Use fungicides. Avoid wet conditions."
  },

  "tomato_leaf_mold": {
    problem: "Fungal disease common in humid environments.",
    cause: "High humidity and poor airflow.",
    symptoms: "Yellow spots on top of leaves and mold underneath.",
    damage: "Reduces plant health and fruit quality.",
    solution: "Improve air circulation. Reduce humidity. Use fungicide if needed."
  },

  "tomato_septoria_leaf_spot": {
    problem: "Leaf infection causing small spots.",
    cause: "Fungus spreading through water and wind.",
    symptoms: "Small round spots with grey center and dark border.",
    damage: "Leaves fall early, reducing plant strength.",
    solution: "Remove infected leaves. Avoid overhead watering. Use fungicide regularly."
  },

  "tomato_spider_mites_two_spotted_spider_mite": {
    problem: "Tiny insects sucking plant nutrients.",
    cause: "Dry and hot conditions favor mites.",
    symptoms: "Yellow dots on leaves and web-like structures.",
    damage: "Leaves dry out and fall off.",
    solution: "Spray water on leaves. Use neem oil or insecticides."
  },

  "tomato_target_spot": {
    problem: "Fungal infection causing leaf spots.",
    cause: "Warm and humid conditions.",
    symptoms: "Brown spots with rings on leaves and fruits.",
    damage: "Reduces fruit quality.",
    solution: "Use fungicides. Remove infected leaves."
  },

  "tomato_tomato_mosaic_virus": {
    problem: "Viral disease affecting plant growth.",
    cause: "Spread through infected tools or hands.",
    symptoms: "Leaves show light and dark green patches.",
    damage: "Plant becomes weak and produces less fruit.",
    solution: "Remove infected plants. Avoid touching plants after tobacco use."
  },

  "tomato_tomato_yellow_leaf_curl_virus": {
    problem: "Serious viral infection in tomatoes.",
    cause: "Spread by whiteflies (small insects).",
    symptoms: "Leaves curl upward and turn yellow.",
    damage: "Plant stops growing and produces very little fruit.",
    solution: "Control whiteflies using insecticide. Remove infected plants."
  },

  "tomato_healthy": {
    problem: "Plant is healthy.",
    cause: "Good maintenance.",
    symptoms: "Green leaves, no damage.",
    damage: "No damage.",
    solution: "Continue proper care."
  },

  default: {
    problem: "A plant disease has been detected.",
    cause: "Could be due to bacteria, fungus, virus, or pests.",
    symptoms: "Visible damage on leaves or plant structure.",
    damage: "Can reduce plant growth and yield.",
    solution: "Consult an expert and apply suitable treatment."
  }
};

// 🔧 Fix key mismatch
const formatKey = (prediction) => {
  return prediction
    .replace(/ /g, "_")
    .replace(/-/g, "_")
    .toLowerCase();
};

function Detect() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📁 Select File
  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  // 🚀 Detect + Save
const handleUpload = async () => {
  if (!file) {
    alert("Please select an image");
    return;
  }

  setLoading(true);

  try {
    // =====================
    // 🔥 STEP 1: ML API
    // =====================
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${ML_API_BASE_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("ML API failed");

    const data = await res.json();
    console.log("ML:", data);

    setResult(data);

    // =====================
    // 🔥 STEP 2: UPLOAD IMAGE (IMPORTANT FIX)
    // =====================
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

    console.log("IMAGE URL:", imageUrl);

    // =====================
    // 🔥 STEP 3: SAVE DATA
    // =====================
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (user && user._id) {

      const key = formatKey(data.prediction);
      const info = diseaseInfo[key] || diseaseInfo.default;

      await apiFetch("/api/save-prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          image: imageUrl, // ✅ FIXED (REAL URL)
          result: data.prediction,
          confidence: data.confidence,
          report: info
        }),
      });
    }

  } catch (err) {
    console.log("❌ ERROR:", err);
    alert("Error detecting disease");
  }

  setLoading(false);
};

return (
  <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white flex items-center justify-center p-6">

    <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">

      {/* LEFT SIDE - UPLOAD */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">

        <h1 className="text-2xl font-bold text-green-700 mb-2">
          🌿 Detect Disease
        </h1>

        <p className="text-gray-500 text-sm mb-4">
          Upload your crop image to analyze
        </p>

        {/* Upload Box */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-400 rounded-xl p-6 cursor-pointer hover:bg-green-50 transition">

          <input type="file" onChange={handleFileChange} className="hidden" />

          <span className="text-4xl mb-2">📁</span>
          <p className="text-green-700 font-medium">
            Click to upload image
          </p>
          <p className="text-xs text-gray-400">
            JPG / PNG supported
          </p>

        </label>

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-full h-48 object-cover rounded-xl mt-4 shadow"
          />
        )}

        {/* Button */}
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

      {/* RIGHT SIDE - RESULT */}
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-center">

        {!result ? (
          <div className="text-center text-gray-400">
            <p className="text-lg">🌱</p>
            <p>No results yet</p>
            <p className="text-sm">Upload an image to see report</p>
          </div>
        ) : (
          <>
            {/* RESULT HEADER */}
            <div className="bg-green-100 p-4 rounded-xl mb-4">
              <h2 className="text-lg font-bold text-green-700">
                {result.prediction}
              </h2>
              <p className="text-sm text-gray-600">
                Confidence: {result.confidence}%
              </p>
            </div>

            {/* DETAILS */}
            {(() => {
              const key = formatKey(result.prediction);
              const info = diseaseInfo[key] || diseaseInfo.default;

              return (
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
                    <p className="text-green-700 font-medium">
                      {info.solution}
                    </p>
                  </div>

                </div>
              );
            })()}
          </>
        )}

      </div>

    </div>
  </div>
);
}

export default Detect;
