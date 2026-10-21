from ultralytics import YOLO
import os

# Path to trained YOLO model
MODEL_PATH = "runs/detect/results/pothole_model/weights/best.pt"

# Load model once
model = YOLO(MODEL_PATH)


def detect_potholes(image_path, output_dir="uploads/results"):
    """
    Detect potholes and save an annotated image with bounding boxes.
    """

    # Create output folder
    os.makedirs(output_dir, exist_ok=True)

    # Run YOLO detection
    results = model(image_path)

    detections = []

    for result in results:

        boxes = result.boxes

        if boxes is not None:

            for box in boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                # Class name
                class_name = model.names[class_id]

                # Bounding box
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                # Severity
                if confidence >= 0.80:
                    severity = "High"
                elif confidence >= 0.50:
                    severity = "Medium"
                else:
                    severity = "Low"

                detections.append({
                    "class": class_name,
                    "confidence": round(confidence, 4),
                    "severity": severity,
                    "bounding_box": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2)
                    }
                })

        # Create annotated image
        annotated_image = result.plot()

        # Create output filename
        original_name = os.path.basename(image_path)
        output_filename = "detected_" + original_name

        output_path = os.path.join(
            output_dir,
            output_filename
        )

        # Save annotated image
        import cv2
        cv2.imwrite(output_path, annotated_image)

    return {
        "damage_detected": len(detections) > 0,
        "total_detections": len(detections),
        "detections": detections,
        "annotated_image": output_path if detections else None
    }