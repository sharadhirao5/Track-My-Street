
from flask import Flask, request, jsonify, send_from_directory
from ai_service import detect_potholes
from werkzeug.utils import secure_filename
from pathlib import Path
import uuid

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
RESULT_FOLDER = UPLOAD_FOLDER / "results"

UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
RESULT_FOLDER.mkdir(parents=True, exist_ok=True)

MAX_IMAGE_SIZE = 5 * 1024 * 1024

ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
}


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")

    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, OPTIONS"
        )
        response.headers["Access-Control-Allow-Headers"] = (
            "Content-Type, Authorization"
        )

    return response


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "TrackMyStreet AI Service is running",
        "endpoint": "/detect",
    })


@app.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({
            "success": False,
            "error": "No image uploaded.",
        }), 400

    image = request.files["image"]

    if not image.filename:
        return jsonify({
            "success": False,
            "error": "No image selected.",
        }), 400

    original_filename = secure_filename(image.filename)

    if not original_filename:
        return jsonify({
            "success": False,
            "error": "Invalid image filename.",
        }), 400

    extension = Path(original_filename).suffix.lower()

    if extension not in {".jpg", ".jpeg", ".png"}:
        return jsonify({
            "success": False,
            "error": "Please upload a JPG or PNG road image.",
        }), 400

    filename = f"{uuid.uuid4().hex}_{original_filename}"
    image_path = UPLOAD_FOLDER / filename

    try:
        image.save(str(image_path))

        # Enforce the upload size limit on the server too.
        if image_path.stat().st_size > MAX_IMAGE_SIZE:
            image_path.unlink(missing_ok=True)
            return jsonify({
                "success": False,
                "error": "Image size must be less than 5 MB.",
            }), 413

        result = detect_potholes(
            str(image_path),
            str(RESULT_FOLDER),
        )

        damage_detected = result.get("damage_detected")
        total_detections = result.get("total_detections")
        detections = result.get("detections")

        if (
            not isinstance(damage_detected, bool)
            or not isinstance(total_detections, int)
            or not isinstance(detections, list)
        ):
            raise ValueError("Unexpected response from the AI model.")

        annotated_path = result.get("annotated_image")
        annotated_filename = (
            Path(annotated_path).name if annotated_path else None
        )

        message = (
            "Road damage detected. Please review the AI results."
            if damage_detected and total_detections > 0
            else (
                "The AI model did not detect any road damage. "
                "Please upload a clear image showing a pothole "
                "or other supported road damage."
            )
        )

        return jsonify({
            "success": True,
            "message": message,
            "result": {
                "damage_detected": damage_detected,
                "total_detections": total_detections,
                "detections": detections,
                "annotated_image": (
                    f"/results/{annotated_filename}"
                    if annotated_filename
                    else None
                ),
            },
        })

    except Exception:
        app.logger.exception("AI detection failed")

        return jsonify({
            "success": False,
            "error": "AI detection failed. Check the Flask terminal.",
        }), 500


@app.route("/results/<path:filename>", methods=["GET"])
def get_result_image(filename):
    return send_from_directory(str(RESULT_FOLDER), filename)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False,
    )
