from ultralytics import YOLO

# Load the best trained model
model = YOLO("runs/detect/results/pothole_model/weights/best.pt")

# Evaluate the model using the test dataset
metrics = model.val(
    data="data.yaml",
    split="test",
    imgsz=640
)

print("\nModel Evaluation Completed!")
print(f"Precision: {metrics.box.mp:.4f}")
print(f"Recall: {metrics.box.mr:.4f}")
print(f"mAP@50: {metrics.box.map50:.4f}")
print(f"mAP@50-95: {metrics.box.map:.4f}")