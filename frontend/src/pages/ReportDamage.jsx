
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/reportDamage.css";

const API_URL = "http://localhost:5000/api";
const AI_URL = "http://localhost:5001";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

function ReportDamage() {
  const navigate = useNavigate();

  const [damageType, setDamageType] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  const handleImageChange = (event) => {
    const selectedImage = event.target.files?.[0];

    setError("");
    setMessage("");
    setAiError("");
    setAiResult(null);

    if (!selectedImage) return;

    if (!ALLOWED_IMAGE_TYPES.includes(selectedImage.type)) {
      setError("Only JPG, JPEG, and PNG images are allowed.");
      event.target.value = "";
      setImage(null);
      return;
    }

    if (selectedImage.size > MAX_IMAGE_SIZE) {
      setError("Image size must be less than 5 MB.");
      event.target.value = "";
      setImage(null);
      return;
    }

    setImage(selectedImage);
  };

  const removeImage = () => {
    setImage(null);
    setAiResult(null);
    setAiError("");
    setMessage("");

    const cameraInput = document.getElementById("roadImageCamera");
    const galleryInput = document.getElementById("roadImageGallery");

    if (cameraInput) cameraInput.value = "";
    if (galleryInput) galleryInput.value = "";
  };

  const getLocation = () => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({ latitude, longitude });
        setLocation(
          `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`
        );
        setLocationLoading(false);
      },
      (locationError) => {
        if (locationError.code === 1) {
          setError("Location permission denied. Please allow location access.");
        } else if (locationError.code === 2) {
          setError("Unable to determine your location.");
        } else if (locationError.code === 3) {
          setError("Location request timed out.");
        } else {
          setError("Unable to get your location.");
        }

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const getComplaintTitle = () => {
    const titles = {
      pothole: "Pothole Road Damage",
      crack: "Road Crack",
      waterlogging: "Waterlogging",
      broken_marking: "Broken Road Marking",
      road_erosion: "Road Erosion",
      surface_damage: "Road Surface Damage",
      other: "Road Damage",
    };

    return titles[damageType] || "Road Damage";
  };

  const handleDetectDamage = async () => {
    setError("");
    setMessage("");
    setAiError("");
    setAiResult(null);

    if (!image) {
      setError("Please take a photo or select a road image first.");
      return;
    }

    setDetecting(true);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch(`${AI_URL}/detect`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.result) {
        throw new Error(
          data.error || "AI detection failed. Please try again."
        );
      }

      const result = data.result;

      if (
        typeof result.damage_detected !== "boolean" ||
        !Number.isInteger(result.total_detections) ||
        !Array.isArray(result.detections)
      ) {
        throw new Error("The AI service returned an unexpected response.");
      }

      if (
        result.damage_detected !== true ||
        result.total_detections <= 0 ||
        result.detections.length === 0
      ) {
        setAiResult(null);
        setAiError(
          "No road damage was detected. Please upload a clear image showing a pothole or other supported road damage."
        );
        return;
      }

      setAiResult(result);
      setMessage("Road damage detected. Please review the AI results.");
    } catch (detectionError) {
      console.error("AI detection error:", detectionError);

      setAiError(
        detectionError.message ||
          "Unable to connect to the AI service. Check that Flask is running on port 5001."
      );
    } finally {
      setDetecting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!damageType) {
      setError("Please select a damage type.");
      return;
    }

    if (!image) {
      setError("Please take a photo or upload an image of the damaged road.");
      return;
    }

    if (
      !aiResult ||
      aiResult.damage_detected !== true ||
      !Number.isInteger(aiResult.total_detections) ||
      aiResult.total_detections <= 0 ||
      !Array.isArray(aiResult.detections) ||
      aiResult.detections.length === 0
    ) {
      setError(
        "Please run AI detection and upload an image with detected road damage before submitting."
      );
      return;
    }

    if (!coordinates) {
      setError("Please detect your GPS location before submitting.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", getComplaintTitle());
      formData.append("description", description.trim());
      formData.append("damageType", damageType);
      formData.append("severity", severity);
      formData.append("latitude", String(coordinates.latitude));
      formData.append("longitude", String(coordinates.longitude));
      formData.append("location", location);
      formData.append("image", image);
      formData.append("aiDetection", JSON.stringify(aiResult));

      const response = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        throw new Error(data.message || "Failed to submit complaint.");
      }

      setMessage("Complaint submitted successfully with AI detection results!");

      setDamageType("");
      setSeverity("Medium");
      setImage(null);
      setLocation("");
      setCoordinates(null);
      setDescription("");
      setAiResult(null);
      setAiError("");

      const cameraInput = document.getElementById("roadImageCamera");
      const galleryInput = document.getElementById("roadImageGallery");

      if (cameraInput) cameraInput.value = "";
      if (galleryInput) galleryInput.value = "";

      window.setTimeout(() => {
        navigate("/complaints");
      }, 1500);
    } catch (submitError) {
      console.error("Complaint submission error:", submitError);
      setError(
        submitError.message || "Unable to submit complaint. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="back-button-wrapper">
  <button
    type="button"
    className="back-button"
    onClick={() => navigate("/dashboard")}
  >
    ← Back to Dashboard
  </button>
</div>

      <div className="report-container">
        <div className="report-card">
          <h1>Report Road Damage</h1>

          <p className="report-subtitle">
            Help improve your community by reporting damaged roads.
          </p>

          {error && (
            <div className="report-error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="report-success" role="status">
              {message}
            </div>
          )}

          {aiError && (
            <div
              role="alert"
              style={{
                color: "#b00020",
                backgroundColor: "#ffe6e6",
                border: "1px solid #f5b5b5",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "15px",
              }}
            >
              {aiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="damageType">Damage Type</label>
              <select
                id="damageType"
                value={damageType}
                onChange={(event) => setDamageType(event.target.value)}
                disabled={submitting}
                required
              >
                <option value="">Select damage type</option>
                <option value="pothole">Pothole</option>
                <option value="crack">Road Crack</option>
                <option value="waterlogging">Waterlogging</option>
                <option value="broken_marking">Broken Road Marking</option>
                <option value="road_erosion">Road Erosion</option>
                <option value="surface_damage">Surface Damage</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity">Reported Severity</label>
              <select
                id="severity"
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
                disabled={submitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="roadImageCamera">
                Take a Road Photo Using Camera
              </label>

              <input
                id="roadImageCamera"
                type="file"
                accept="image/jpeg,image/png"
                capture="environment"
                onChange={handleImageChange}
                disabled={submitting || detecting}
              />

              <label
                htmlFor="roadImageGallery"
                style={{ display: "block", marginTop: "16px" }}
              >
                Or Upload from Gallery / Computer
              </label>

              <input
                id="roadImageGallery"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                disabled={submitting || detecting}
              />

              {image && imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Selected road damage" />
                  <p>{image.name}</p>

                  <button
                    type="button"
                    className="location-btn"
                    onClick={removeImage}
                    disabled={submitting || detecting}
                  >
                    Remove Image
                  </button>
                </div>
              )}

              <button
                type="button"
                className="submit-btn"
                onClick={handleDetectDamage}
                disabled={!image || detecting || submitting}
                style={{ marginTop: "12px" }}
              >
                {detecting
                  ? "Analyzing Image..."
                  : "Detect Road Damage with AI"}
              </button>

              {aiResult && (
                <div
                  className="ai-result"
                  style={{
                    marginTop: "16px",
                    padding: "16px",
                    border: "1px solid #d7e3ef",
                    borderRadius: "10px",
                  }}
                >
                  <h3>AI Detection Results</h3>

                  <p>
                    <strong>Damage detected:</strong>{" "}
                    {aiResult.damage_detected ? "Yes" : "No"}
                  </p>

                  <p>
                    <strong>Total detections:</strong>{" "}
                    {aiResult.total_detections}
                  </p>

                  {aiResult.detections.length > 0 && (
                    <ul>
                      {aiResult.detections.map((detection, index) => (
                        <li key={`${detection.class}-${index}`}>
                          {detection.class} —{" "}
                          {(Number(detection.confidence || 0) * 100).toFixed(1)}
                          % confidence
                          {detection.confidence_label
                            ? ` (${detection.confidence_label} confidence)`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  )}

                  {aiResult.annotated_image && (
                    <div>
                      <h4>Annotated Image</h4>
                      <img
                        src={`${AI_URL}${aiResult.annotated_image}`}
                        alt="AI road damage detections"
                        style={{
                          display: "block",
                          width: "100%",
                          maxWidth: "600px",
                          height: "auto",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  )}

                  <p style={{ fontSize: "13px", color: "#555" }}>
                    AI predictions are assistive results and should be reviewed
                    before deciding the actual damage severity.
                  </p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>

              <div className="location-input">
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Enter road location"
                  disabled={submitting}
                />

                <button
                  type="button"
                  className="location-btn"
                  onClick={getLocation}
                  disabled={locationLoading || submitting}
                >
                  {locationLoading
                    ? "Detecting..."
                    : "📍 Use My Location"}
                </button>
              </div>

              {coordinates && (
                <div className="coordinates">
                  <strong>Location detected</strong>
                  <p>Latitude: {coordinates.latitude.toFixed(6)}</p>
                  <p>Longitude: {coordinates.longitude.toFixed(6)}</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows="5"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the road damage..."
                disabled={submitting}
                required
              />
            </div>

            {damageType &&
              image &&
              aiResult?.damage_detected === true &&
              coordinates &&
              description.trim() && (
                <p className="form-message">
                  Complaint details are ready to be submitted.
                </p>
              )}

            <button
              type="submit"
              className="submit-btn"
              disabled={submitting || detecting}
            >
              {submitting ? "Submitting Complaint..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ReportDamage;
