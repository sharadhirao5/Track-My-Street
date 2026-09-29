from ai_service import detect_potholes
import os

# Select one test image
test_folder = "dataset/test/images"

images = [
    f for f in os.listdir(test_folder)
    if f.lower().endswith((".jpg", ".jpeg", ".png"))
]

if images:
    image_path = os.path.join(test_folder, images[0])

    result = detect_potholes(image_path)

    print("\nAI DETECTION RESULT")
    print("=" * 40)
    print(result)
else:
    print("No test image found.")