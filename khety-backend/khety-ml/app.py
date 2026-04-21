import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import io

app = Flask(__name__)
CORS(app)  # ✅ React se connect ke liye

print("🚀 Starting ML server...")
print("📦 Loading model...")

# ✅ LOAD MODEL (IMPORTANT PATH)
try:
    model = load_model("plant_disease_model.h5")
    print("✅ Model loaded successfully")
except Exception as e:
    print("❌ MODEL LOAD ERROR:", e)

# ✅ CLASS NAMES (YOUR DATASET)
class_names = [
    "Pepper Bell - Bacterial Spot",
    "Pepper Bell - Healthy",
    "Potato - Early Blight",
    "Potato - Healthy",
    "Potato - Late Blight",
    "Tomato - Target Spot",
    "Tomato - Mosaic Virus",
    "Tomato - Yellow Leaf Curl Virus",
    "Tomato - Bacterial Spot",
    "Tomato - Early Blight",
    "Tomato - Healthy",
    "Tomato - Late Blight",
    "Tomato - Leaf Mold",
    "Tomato - Septoria Leaf Spot",
    "Tomato - Spider Mites"
]

# ✅ IMAGE PREPROCESS
def preprocess_image(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

# ✅ TEST ROUTE (VERY IMPORTANT)
@app.route("/", methods=["GET"])
def home():
    return "ML Server Running ✅"

# ✅ PREDICT ROUTE
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"})

        file = request.files["file"]
        image = Image.open(io.BytesIO(file.read())).convert("RGB")

        processed = preprocess_image(image)

        prediction = model.predict(processed)
        predicted_class = class_names[np.argmax(prediction)]
        confidence = float(np.max(prediction))

        return jsonify({
            "prediction": predicted_class,
            "confidence": round(confidence * 100, 2)
        })

    except Exception as e:
        print("❌ PREDICTION ERROR:", e)
        return jsonify({"error": "Prediction failed"}), 500


# ✅ RUN SERVER
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)