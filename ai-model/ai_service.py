from ultralytics import YOLO
import os

# Path to the trained YOLO model
MODEL_PATH = "runs/detect/results/pothole_model/weights/best.pt"

# Load model once when the service starts
model = YOLO(MODEL_PATH)


def detect_potholes(image_path):
    """
    Detect potholes in a given image.
    Returns detection details.
    """

    results = model(image_path)

    detections = []

    for result in results:
        boxes = result.boxes

        if boxes is not None:
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                # Get class name
                class_name = model.names[class_id]

                # Bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "class": class_name,
                    "confidence": round(confidence, 4),
                    "bounding_box": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2)
                    }
                })

    return {
        "damage_detected": len(detections) > 0,
        "total_detections": len(detections),
        "detections": detections
    }


# Test the service directly
if __name__ == "__main__":
    image_path = "dataset/test/images"

    print("AI Service Ready!")
    print("Use detect_potholes(image_path) to analyze an uploaded image.")