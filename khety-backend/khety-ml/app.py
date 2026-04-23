import io
import os
import re

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
from PIL import Image
import requests
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILENAME = "plant_disease_model.h5"
MODEL_PATH = os.path.join(BASE_DIR, MODEL_FILENAME)

print("Starting ML server...")
print("Loading model...")


def build_model_url(raw_url):
    if not raw_url:
        return ""

    match = re.search(r"/d/([a-zA-Z0-9_-]+)", raw_url)
    if "drive.google.com" in raw_url and match:
        return f"https://drive.google.com/uc?export=download&id={match.group(1)}"

    return raw_url


def download_google_drive_file(url, destination):
    session = requests.Session()
    response = session.get(url, stream=True, allow_redirects=True, timeout=120)

    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            response.close()
            response = session.get(
                url,
                params={"confirm": value},
                stream=True,
                allow_redirects=True,
                timeout=120,
            )
            break

    response.raise_for_status()
    content_type = response.headers.get("content-type", "")

    if "text/html" in content_type.lower():
        preview = response.text[:500]
        raise RuntimeError(
            "Model download returned HTML instead of the model file. "
            "Please confirm the MODEL_URL is a public direct-download link. "
            f"Response preview: {preview}"
        )

    with open(destination, "wb") as file_handle:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                file_handle.write(chunk)


def ensure_model_exists():
    if os.path.exists(MODEL_PATH):
        return

    model_url = build_model_url(os.environ.get("MODEL_URL", "").strip())

    if not model_url:
        raise RuntimeError(
            f"{MODEL_FILENAME} is missing and MODEL_URL is not configured."
        )

    print("Model file not found locally. Downloading from MODEL_URL...")
    download_google_drive_file(model_url, MODEL_PATH)
    print("Model download complete")

try:
    ensure_model_exists()
    model = load_model(MODEL_PATH)
    print("Model loaded successfully")
except Exception as e:
    print("MODEL LOAD ERROR:", e)
    raise

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
    "Tomato - Spider Mites",
]


def preprocess_image(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image


@app.route("/", methods=["GET"])
def home():
    return "ML Server Running"


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        processed = preprocess_image(image)

        prediction = model.predict(processed)
        predicted_class = class_names[np.argmax(prediction)]
        confidence = float(np.max(prediction))

        return jsonify(
            {
                "prediction": predicted_class,
                "confidence": round(confidence * 100, 2),
            }
        )
    except Exception as e:
        print("PREDICTION ERROR:", e)
        return jsonify({"error": "Prediction failed"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5001")), debug=True)
