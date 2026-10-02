from flask import Flask, request, jsonify, send_from_directory
from ai_service import detect_potholes
from werkzeug.utils import secure_filename
import os
import uuid

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = os.path.join(UPLOAD_FOLDER, "results")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)


@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "TrackMyStreet AI Service is running",
        "endpoint": "/detect"
    })


@app.route("/detect", methods=["POST"])
def detect():

    # Check image
    if "image" not in request.files:
        return jsonify({
            "success": False,
            "error": "No image uploaded"
        }), 400

    image = request.files["image"]

    if image.filename == "":
        return jsonify({
            "success": False,
            "error": "No image selected"
        }), 400

    try:

        # Secure original filename
        original_filename = secure_filename(image.filename)

        # Create unique filename
        filename = f"{uuid.uuid4().hex}_{original_filename}"

        # Save uploaded image
        image_path = os.path.join(
            UPLOAD_FOLDER,
            filename
        )

        image.save(image_path)

        # Run AI
        result = detect_potholes(
            image_path,
            RESULT_FOLDER
        )

        # Get annotated image filename
        annotated_path = result.get("annotated_image")

        annotated_filename = None

        if annotated_path:
            annotated_filename = os.path.basename(
                annotated_path
            )

        return jsonify({

            "success": True,

            "filename": original_filename,

            "result": {
                "damage_detected":
                    result["damage_detected"],

                "total_detections":
                    result["total_detections"],

                "detections":
                    result["detections"],

                "annotated_image":
                    f"/results/{annotated_filename}"
                    if annotated_filename
                    else None
            }

        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/results/<filename>", methods=["GET"])
def get_result_image(filename):

    return send_from_directory(
        RESULT_FOLDER,
        filename
    )


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )