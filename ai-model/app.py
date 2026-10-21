from flask import Flask, request, jsonify, send_from_directory
from ai_service import detect_potholes
from werkzeug.utils import secure_filename
from pathlib import Path
import uuid

app = Flask(__name__)

# Use paths relative to this file so the service works
# regardless of the terminal's current directory.
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
RESULT_FOLDER = UPLOAD_FOLDER / "results"

UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
RESULT_FOLDER.mkdir(parents=True, exist_ok=True)

# Allow the local React development server.
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
        "endpoint": "/detect"
    })


@app.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({
            "success": False,
            "error": "No image uploaded"
        }), 400

    image = request.files["image"]

    if not image.filename:
        return jsonify({
            "success": False,
            "error": "No image selected"
        }), 400

    try:
        original_filename = secure_filename(image.filename)

        if not original_filename:
            return jsonify({
                "success": False,
                "error": "Invalid image filename"
            }), 400

        filename = f"{uuid.uuid4().hex}_{original_filename}"
        image_path = UPLOAD_FOLDER / filename

        image.save(str(image_path))

        result = detect_potholes(
            str(image_path),
            str(RESULT_FOLDER)
        )

        annotated_path = result.get("annotated_image")
        annotated_filename = (
            Path(annotated_path).name if annotated_path else None
        )

        return jsonify({
            "success": True,
            "filename": original_filename,
            "result": {
                "damage_detected": result["damage_detected"],
                "total_detections": result["total_detections"],
                "detections": result["detections"],
                "annotated_image": (
                    f"/results/{annotated_filename}"
                    if annotated_filename
                    else None
                )
            }
        })

    except Exception:
        app.logger.exception("AI detection failed")

        return jsonify({
            "success": False,
            "error": "AI detection failed. Check the Flask terminal."
        }), 500


@app.route("/results/<path:filename>", methods=["GET"])
def get_result_image(filename):
    return send_from_directory(str(RESULT_FOLDER), filename)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )