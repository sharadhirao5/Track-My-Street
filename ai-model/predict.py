from ultralytics import YOLO

# Load the trained TrackMyStreet model
model = YOLO("models/best.pt")

# Run prediction on test images
results = model.predict(
    source="dataset/test/images",
    conf=0.25,
    save=True
)

print("Prediction completed successfully!")