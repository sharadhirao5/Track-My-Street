from flask import Flask, request, jsonify
from ai_service import detect_potholes
import os

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "TrackMyStreet AI Service is running"
    })


@app.route("/detect", methods=["POST"])
def detect():
    # Check whether an image was uploaded
    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded"
        }), 400

    image = request.files["image"]

    if image.filename == "":
        return jsonify({
            "error": "No image selected"
        }), 400

    # Save uploaded image
    image_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(image_path)

    try:
        # Run AI detection
        result = detect_potholes(image_path)

        return jsonify({
            "success": True,
            "filename": image.filename,
            "result": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)