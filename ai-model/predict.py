from ultralytics import YOLO

# Load the trained pothole detection model
model = YOLO("runs/detect/results/pothole_model/weights/best.pt")

# Run prediction on test images
results = model.predict(
    source="dataset/test/images",
    conf=0.25,
    save=True
)

print("Prediction completed successfully!")