from ultralytics import YOLO

# Load a lightweight pretrained YOLO model
model = YOLO("yolo11n.pt")

# Train the model
results = model.train(
    data="data.yaml",
    epochs=20,
    imgsz=640,
    batch=4,
    project="results",
    name="pothole_model"
)

print("Training completed successfully!")