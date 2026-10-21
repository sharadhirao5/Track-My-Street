
from pathlib import Path

import cv2
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "best.pt"
OUTPUT_DIR = BASE_DIR / "uploads" / "results"

CONFIDENCE_THRESHOLD = 0.50
NMS_IOU_THRESHOLD = 0.45
MAX_DETECTIONS = 30

# Only allow classes representing potholes.
# Add another name only if it exists in your dataset.
ROAD_DAMAGE_CLASSES = {
    "pothole",
    "potholes",
}

if not MODEL_PATH.is_file():
    raise FileNotFoundError(
        f"Trained YOLO model not found at: {MODEL_PATH}"
    )

model = YOLO(str(MODEL_PATH))

print("YOLO model loaded:", MODEL_PATH)
print("Model class names:", model.names)


def get_class_name(class_id):
    """Return the normalized name for a model class."""

    if isinstance(model.names, dict):
        name = model.names.get(class_id, str(class_id))
    else:
        name = (
            model.names[class_id]
            if 0 <= class_id < len(model.names)
            else str(class_id)
        )

    return str(name).strip().lower().replace("-", "_").replace(" ", "_")


def detect_potholes(image_path, output_dir=None):
    """Detect potholes, filter unsupported classes, and save the image."""

    image_path = Path(image_path).resolve()

    if not image_path.is_file():
        raise FileNotFoundError(
            f"Input image not found: {image_path}"
        )

    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError(
            "The uploaded file is not a readable image."
        )

    destination = (
        Path(output_dir).resolve()
        if output_dir
        else OUTPUT_DIR
    )
    destination.mkdir(parents=True, exist_ok=True)

    results = model.predict(
        source=image,
        conf=CONFIDENCE_THRESHOLD,
        iou=NMS_IOU_THRESHOLD,
        max_det=MAX_DETECTIONS,
        verbose=False,
    )

    detections = []
    annotated_path = None

    for result in results:
        if result.boxes is not None:
            for box in result.boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                class_name = get_class_name(class_id)

                # Reject classes not labelled as potholes.
                if class_name not in ROAD_DAMAGE_CLASSES:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                if confidence >= 0.80:
                    confidence_label = "High"
                elif confidence >= 0.65:
                    confidence_label = "Medium"
                else:
                    confidence_label = "Low"

                detections.append({
                    "class": class_name,
                    "confidence": round(confidence, 4),
                    "confidence_label": confidence_label,
                    "severity": confidence_label,
                    "bounding_box": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2),
                    },
                })

                print(
                    f"Accepted pothole: {confidence:.1%} confidence"
                )

        # Draw only the accepted detections, not every raw prediction.
        annotated_image = image.copy()

        for detection in detections:
            box = detection["bounding_box"]
            x1, y1 = int(box["x1"]), int(box["y1"])
            x2, y2 = int(box["x2"]), int(box["y2"])

            label = (
                f'{detection["class"]} '
                f'{detection["confidence"]:.2f}'
            )

            cv2.rectangle(
                annotated_image,
                (x1, y1),
                (x2, y2),
                (255, 0, 0),
                2,
            )

            cv2.putText(
                annotated_image,
                label,
                (x1, max(y1 - 8, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 0, 0),
                2,
                cv2.LINE_AA,
            )

        output_path = destination / f"detected_{image_path.name}"

        if cv2.imwrite(str(output_path), annotated_image):
            annotated_path = str(output_path)
        else:
            raise OSError(
                f"Could not save annotated image: {output_path}"
            )

    return {
        "damage_detected": len(detections) > 0,
        "total_detections": len(detections),
        "detections": detections,
        "annotated_image": annotated_path,
    }
