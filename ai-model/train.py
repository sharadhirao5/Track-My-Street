
from pathlib import Path
import shutil

from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent

DATA_YAML = BASE_DIR / "data.yaml"
PRETRAINED_MODEL = BASE_DIR / "yolo11n.pt"

RESULTS_DIR = BASE_DIR / "results"
RUN_NAME = "pothole_model"

MODEL_DIR = BASE_DIR / "models"
FINAL_MODEL_PATH = MODEL_DIR / "best.pt"

EPOCHS = 50
IMAGE_SIZE = 640
BATCH_SIZE = 4

def main():
    if not DATA_YAML.is_file():
        raise FileNotFoundError(
            f"Dataset configuration not found: {DATA_YAML}"
        )

    if not PRETRAINED_MODEL.is_file():
        raise FileNotFoundError(
            f"Pretrained YOLO model not found: {PRETRAINED_MODEL}"
        )

    print("Loading pretrained YOLO model...")
    model = YOLO(str(PRETRAINED_MODEL))

    print("Starting pothole model training...")

    model.train(
        data=str(DATA_YAML),
        epochs=EPOCHS,
        imgsz=IMAGE_SIZE,
        batch=BATCH_SIZE,
        project=str(RESULTS_DIR),
        name=RUN_NAME,
        exist_ok=True,
        patience=10,
        plots=True,
        verbose=True,
    )

    trained_model_path = (
        RESULTS_DIR / RUN_NAME / "weights" / "best.pt"
    )

    if not trained_model_path.is_file():
        raise FileNotFoundError(
            "Training finished, but best.pt was not found at: "
            f"{trained_model_path}"
        )

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(trained_model_path, FINAL_MODEL_PATH)

    print("\nTraining completed successfully!")
    print(f"Trained model: {trained_model_path}")
    print(f"Prediction model updated: {FINAL_MODEL_PATH}")


if __name__ == "__main__":
    main()
