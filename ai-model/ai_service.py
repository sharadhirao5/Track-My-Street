import os
from pathlib import Path

import cv2
from ultralytics import YOLO


# Get the ai-model folder regardless of where Python is launched.
BASE_DIR = Path(__file__).resolve().parent

# Correct location of your trained model.
MODEL_PATH = BASE_DIR / "models" / "best.pt"

if not MODEL_PATH.is_file():
    raise FileNotFoundError(
        f"Trained YOLO model not found at: {MODEL_PATH}"
    )

# Load the trained model once when the service starts.
model = YOLO(str(MODEL_PATH))


def detect_potholes(image_path, output_dir="uploads/results"):
    """
    Detect road damage and save an annotated image.
    """

    image_path = Path(image_path).resolve()
    output_dir = Path(output_dir).resolve()

    if not image_path.is_file():
        raise FileNotFoundError(
            f"Input image not found: {image_path}"
        )

    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError(
            "The uploaded file is not a valid readable image."
        )

    output_dir.mkdir(parents=True, exist_ok=True)

    results = model.predict(
        source=str(image_path),
        verbose=False
    )

    detections = []
    annotated_path = None

    for result in results:
        boxes = result.boxes

        if boxes is not None:
            for box in boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())

                if isinstance(model.names, dict):
                    class_name = model.names.get(
                        class_id, str(class_id)
                    )
                else:
                    class_name = (
                        model.names[class_id]
                        if class_id < len(model.names)
                        else str(class_id)
                    )

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                # These labels represent model confidence,
                # not the physical severity of the road damage.
                if confidence >= 0.80:
                    confidence_label = "High"
                elif confidence >= 0.50:
                    confidence_label = "Medium"
                else:
                    confidence_label = "Low"

                detections.append({
                    "class": class_name,
                    "confidence": round(confidence, 4),
                    "confidence_label": confidence_label,
                    "bounding_box": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2)
                    }
                })

        # Save the image with YOLO's detection annotations.
        annotated_image = result.plot()
        output_filename = f"detected_{image_path.name}"
        output_path = output_dir / output_filename

        if cv2.imwrite(str(output_path), annotated_image):
            annotated_path = str(output_path)

    return {
        "damage_detected": len(detections) > 0,
        "total_detections": len(detections),
        "detections": detections,
        "annotated_image": annotated_path
    }