
from pathlib import Path
from predict import detect_potholes as run_detection

BASE_DIR = Path(__file__).resolve().parent
RESULT_FOLDER = BASE_DIR / "uploads" / "results"


def detect_potholes(image_path, output_dir=None):
    """Run YOLO detection using the function from predict.py."""

    destination = (
        Path(output_dir).resolve()
        if output_dir
        else RESULT_FOLDER
    )
    destination.mkdir(parents=True, exist_ok=True)

    # Call the imported function from predict.py.
    # The alias prevents this function from calling itself.
    result = run_detection(
        image_path,
        str(destination),
    )

    return {
        "damage_detected": bool(result.get("damage_detected", False)),
        "total_detections": int(result.get("total_detections", 0)),
        "detections": result.get("detections", []),
        "annotated_image": result.get("annotated_image"),
    }
