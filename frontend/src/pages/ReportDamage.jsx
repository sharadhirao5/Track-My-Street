import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/reportDamage.css";
import { Link } from "react-router-dom";

function ReportDamage() {
  const [damageType, setDamageType] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    if (selectedImage) {
      setImage(selectedImage);
      setImagePreview(URL.createObjectURL(selectedImage));
      setAnalysisResult(null);
      setMessage("");
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({
          latitude,
          longitude,
        });

        setLocation(
          `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`
        );

        setLocationLoading(false);
      },
      () => {
        setMessage(
          "Unable to get your location. Please allow location access."
        );

        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!damageType || !image || !location || !description) {
      setMessage("Please fill in all fields and upload an image.");
      return;
    }

    setMessage("");
    setAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      const detectedDamage =
        damageType === "crack"
          ? "Road Crack"
          : damageType === "waterlogging"
          ? "Waterlogging"
          : damageType === "other"
          ? "Road Damage"
          : "Pothole";

      setAnalysisResult({
        damage: detectedDamage,
        confidence: "94.7%",
        severity: "High",
      });

      setAnalyzing(false);
    }, 1500);
  };

  return (
    <>
      <Navbar />

      <div className="report-container">
        <div className="report-card">
          {!analysisResult ? (
            <>
              <h1>Report Road Damage</h1>

              <p className="report-subtitle">
                Help improve your community by reporting damaged roads.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Damage Type</label>

                  <select
                    value={damageType}
                    onChange={(event) => setDamageType(event.target.value)}
                  >
                    <option value="">Select damage type</option>
                    <option value="pothole">Pothole</option>
                    <option value="crack">Road Crack</option>
                    <option value="waterlogging">Waterlogging</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Upload Road Image</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  {imagePreview && (
                    <div className="image-preview">
                      <img
                        src={imagePreview}
                        alt="Road damage preview"
                      />

                      <p>{image.name}</p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Location</label>

                  <div className="location-input">
                    <input
                      type="text"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Enter road location"
                    />

                    <button
                      type="button"
                      className="location-btn"
                      onClick={getLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading
                        ? "Detecting..."
                        : "📍 Use My Location"}
                    </button>
                  </div>

                  {coordinates && (
                    <div className="coordinates">
                      <strong>✓ Location detected</strong>

                      <p>
                        Latitude: {coordinates.latitude.toFixed(6)}
                      </p>

                      <p>
                        Longitude: {coordinates.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Description</label>

                  <textarea
                    rows="5"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the road damage..."
                  ></textarea>
                </div>

                {message && (
                  <p className="form-message">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={analyzing}
                >
                  {analyzing
                    ? "🤖 Analyzing Road Image..."
                    : "Submit for AI Analysis"}
                </button>
              </form>
            </>
          ) : (
            <div className="analysis-result">
              <div className="analysis-header">
                <div className="success-icon">✓</div>

                <h1>AI Analysis Complete</h1>

                <p>
                  Our system analyzed the uploaded road image.
                </p>
              </div>

              {imagePreview && (
                <div className="result-image">
                  <img
                    src={imagePreview}
                    alt="Analyzed road"
                  />
                </div>
              )}

              <div className="result-details">
                <div className="result-item">
                  <span>Damage Detected</span>
                  <strong>{analysisResult.damage}</strong>
                </div>

                <div className="result-item">
                  <span>Confidence</span>
                  <strong>{analysisResult.confidence}</strong>
                </div>

                <div className="result-item">
                  <span>Severity</span>
                  <strong className="severity-high">
                    {analysisResult.severity}
                  </strong>
                </div>

                <div className="result-item">
                  <span>GPS Location</span>
                  <strong>
                    {coordinates ? "Detected ✓" : "Provided ✓"}
                  </strong>
                </div>
              </div>

              <div className="result-description">
                <h3>Complaint Description</h3>
                <p>{description}</p>
              </div>

              <div className="result-actions">
                <button
                  className="submit-btn"
                  onClick={() => {
                    setAnalysisResult(null);
                    setMessage(
                      "You can edit your complaint details and analyze again."
                    );
                  }}
                >
                  Analyze Again
                </button>

                <Link
                  to="/dashboard"
                  className="dashboard-btn"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ReportDamage;