import io
import json
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
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")
REMOTE_ML_URL = os.environ.get("REMOTE_ML_URL", "").strip().rstrip("/")

print("Starting ML server...")
if REMOTE_ML_URL:
    print(f"Remote proxy mode enabled -> {REMOTE_ML_URL}")
else:
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

model = None

if not REMOTE_ML_URL:
    try:
        ensure_model_exists()
        model = load_model(MODEL_PATH)
        print("Model loaded successfully")
    except Exception as e:
        print("MODEL LOAD ERROR:", e)
        raise

DEFAULT_CLASS_NAMES = [
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


def load_class_names():
    if os.path.exists(CLASS_NAMES_PATH):
        with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file_handle:
            data = json.load(file_handle)

        if isinstance(data, list) and data:
            return [str(item) for item in data]

        raise RuntimeError("class_names.json must contain a non-empty array.")

    return DEFAULT_CLASS_NAMES


class_names = load_class_names() if not REMOTE_ML_URL else DEFAULT_CLASS_NAMES


def preprocess_image(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image


def compute_image_quality(image):
    image_array = np.array(image).astype("float32")
    grayscale = np.mean(image_array, axis=2)

    brightness = float(np.mean(grayscale))
    contrast = float(np.std(grayscale))
    grad_x = np.diff(grayscale, axis=1)
    grad_y = np.diff(grayscale, axis=0)
    sharpness = float(np.var(grad_x) + np.var(grad_y))

    green_channel = image_array[:, :, 1]
    red_channel = image_array[:, :, 0]
    blue_channel = image_array[:, :, 2]
    green_dominance = float(
        np.mean((green_channel > red_channel + 10) & (green_channel > blue_channel + 10))
    )
    dark_ratio = float(np.mean(grayscale < 45))
    bright_ratio = float(np.mean(grayscale > 210))

    max_channel = np.max(image_array, axis=2)
    min_channel = np.min(image_array, axis=2)
    saturation = max_channel - min_channel
    saturation_mean = float(np.mean(saturation))

    flat_horizontal = np.mean(np.abs(np.diff(image_array, axis=1)) < 3)
    flat_vertical = np.mean(np.abs(np.diff(image_array, axis=0)) < 3)
    flat_ratio = float((flat_horizontal + flat_vertical) / 2)

    quantized = (image_array // 32).astype(np.int16)
    packed = (
        quantized[:, :, 0] * 64
        + quantized[:, :, 1] * 8
        + quantized[:, :, 2]
    ).reshape(-1)
    _, counts = np.unique(packed, return_counts=True)
    dominant_color_share = float(np.max(counts) / packed.size)

    plant_pixel_ratio = float(
        np.mean(
            (green_channel > red_channel * 1.05)
            & (green_channel > blue_channel * 1.05)
            & (saturation > 18)
        )
    )

    warnings = []
    if brightness < 35:
        warnings.append("Image is too dark.")
    if brightness > 225:
        warnings.append("Image is too bright.")
    if contrast < 18:
        warnings.append("Image has very low contrast.")
    if sharpness < 120:
        warnings.append("Image looks blurry.")
    if green_dominance < 0.12 or plant_pixel_ratio < 0.08:
        warnings.append("Image may not contain a clear plant leaf.")
    if dark_ratio > 0.55:
        warnings.append("Image contains too much dark screen-like background.")
    if bright_ratio > 0.45:
        warnings.append("Image contains too much bright flat background.")
    if flat_ratio > 0.82:
        warnings.append("Image looks like a screenshot or graphic instead of a natural photo.")
    if dominant_color_share > 0.28:
        warnings.append("Image has large flat color blocks and may not be a real leaf photo.")
    if saturation_mean < 22:
        warnings.append("Image colors are too flat for a reliable leaf analysis.")

    return {
        "brightness": round(brightness, 2),
        "contrast": round(contrast, 2),
        "sharpness": round(sharpness, 2),
        "green_dominance": round(green_dominance, 4),
        "plant_pixel_ratio": round(plant_pixel_ratio, 4),
        "dark_ratio": round(dark_ratio, 4),
        "bright_ratio": round(bright_ratio, 4),
        "flat_ratio": round(flat_ratio, 4),
        "dominant_color_share": round(dominant_color_share, 4),
        "saturation_mean": round(saturation_mean, 2),
        "warnings": warnings,
    }


def assess_leaf_validity(quality):
    score = 0
    reasons = []

    if quality["green_dominance"] < 0.12:
        score += 2
        reasons.append("Low green dominance")
    if quality["plant_pixel_ratio"] < 0.08:
        score += 3
        reasons.append("Not enough leaf-like pixels")
    if quality["flat_ratio"] > 0.82:
        score += 4
        reasons.append("Looks like a screenshot or graphic")
    if quality["dominant_color_share"] > 0.28:
        score += 3
        reasons.append("Contains large flat color areas")
    if quality["dark_ratio"] > 0.55:
        score += 2
        reasons.append("Too much dark screen-like background")
    if quality["bright_ratio"] > 0.45:
        score += 2
        reasons.append("Too much bright flat background")
    if quality["saturation_mean"] < 22:
        score += 2
        reasons.append("Colors are too flat")
    if quality["contrast"] < 18:
        score += 1
        reasons.append("Low contrast")
    if quality["sharpness"] < 120:
        score += 1
        reasons.append("Blurry image")

    return {
        "is_valid_leaf": score < 5,
        "rejection_score": score,
        "signals": reasons,
    }


def build_top_predictions(prediction, limit=3):
    scores = prediction[0]
    top_indices = np.argsort(scores)[::-1][:limit]
    top_predictions = []

    for index in top_indices:
        top_predictions.append(
            {
                "label": class_names[int(index)],
                "confidence": round(float(scores[int(index)]) * 100, 2),
            }
        )

    return top_predictions


def build_unknown_response(top_predictions, quality, reason, validity=None):
    return {
        "prediction": "Sorry, cannot detect this image reliably",
        "confidence": round(top_predictions[0]["confidence"], 2) if top_predictions else 0,
        "status": "uncertain",
        "recognized": False,
        "reason": reason,
        "message": (
            "Please upload a sharp close-up photo of a single pepper, potato, or tomato leaf."
        ),
        "supported_crops": ["Pepper Bell", "Potato", "Tomato"],
        "top_predictions": top_predictions,
        "image_quality": quality,
        "leaf_validation": validity or {},
    }


@app.route("/", methods=["GET"])
def home():
    mode = "proxy" if REMOTE_ML_URL else "local"
    return jsonify({"status": "running", "mode": mode})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        if REMOTE_ML_URL:
            file.stream.seek(0)
            response = requests.post(
                f"{REMOTE_ML_URL}/predict",
                files={
                    "file": (
                        file.filename or "upload.jpg",
                        file.stream.read(),
                        file.mimetype or "application/octet-stream",
                    )
                },
                timeout=180,
            )

            payload = response.json()
            return jsonify(payload), response.status_code

        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        width, height = image.size

        if width < 96 or height < 96:
            return (
                jsonify(
                    {
                        "error": "Image is too small. Please upload a larger image.",
                    }
                ),
                400,
            )

        quality = compute_image_quality(image)
        validity = assess_leaf_validity(quality)
        processed = preprocess_image(image)

        prediction = model.predict(processed, verbose=0)
        predicted_index = int(np.argmax(prediction))
        predicted_class = class_names[predicted_index]
        confidence = float(np.max(prediction))
        sorted_scores = np.sort(prediction[0])[::-1]
        margin = float(sorted_scores[0] - sorted_scores[1]) if len(sorted_scores) > 1 else float(sorted_scores[0])
        top_predictions = build_top_predictions(prediction)

        if not validity["is_valid_leaf"]:
            return jsonify(
                build_unknown_response(
                    top_predictions,
                    quality,
                    "This image does not look like a supported leaf photo.",
                    validity,
                )
            )

        if confidence < 0.65 or margin < 0.20:
            return jsonify(
                build_unknown_response(
                    top_predictions,
                    quality,
                    "Model confidence is too low for a safe diagnosis.",
                    validity,
                )
            )

        return jsonify(
            {
                "prediction": predicted_class,
                "confidence": round(confidence * 100, 2),
                "status": "recognized",
                "recognized": True,
                "message": "Prediction generated from the current plant disease model.",
                "supported_crops": ["Pepper Bell", "Potato", "Tomato"],
                "top_predictions": top_predictions,
                "image_quality": quality,
                "leaf_validation": validity,
                "margin": round(margin * 100, 2),
            }
        )
    except Exception as e:
        print("PREDICTION ERROR:", e)
        return jsonify({"error": "Prediction failed"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5001")), debug=True)
