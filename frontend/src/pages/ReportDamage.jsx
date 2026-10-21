import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/reportDamage.css";

function ReportDamage() {
  const navigate = useNavigate();

  const [damageType, setDamageType] = useState("");
  const [severity, setSeverity] = useState("Medium");

  const [image, setImage] = useState(null);

  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);

  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --------------------------------
  // IMAGE SELECTION
  // --------------------------------
  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    setError("");
    setMessage("");

    if (!selectedImage) {
      setImage(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedImage.type)) {
      setError("Only JPG, JPEG and PNG images are allowed.");
      event.target.value = "";
      setImage(null);
      return;
    }

    // Backend upload limit is 5 MB
    if (selectedImage.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      event.target.value = "";
      setImage(null);
      return;
    }

    setImage(selectedImage);
  };

  // --------------------------------
  // GET CURRENT LOCATION
  // --------------------------------
  const getLocation = () => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({
          latitude,
          longitude,
        });

        setLocation(
          `Latitude: ${latitude.toFixed(
            6
          )}, Longitude: ${longitude.toFixed(6)}`
        );

        setLocationLoading(false);
      },

      (locationError) => {
        console.error(
          "Location error:",
          locationError
        );

        if (locationError.code === 1) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (locationError.code === 2) {
          setError(
            "Unable to determine your location."
          );
        } else if (locationError.code === 3) {
          setError(
            "Location request timed out."
          );
        } else {
          setError(
            "Unable to get your location."
          );
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

  // --------------------------------
  // CREATE BACKEND TITLE
  // --------------------------------
  const getComplaintTitle = () => {
    switch (damageType) {
      case "pothole":
        return "Pothole Road Damage";

      case "crack":
        return "Road Crack";

      case "waterlogging":
        return "Waterlogging";

      case "broken_marking":
        return "Broken Road Marking";

      case "road_erosion":
        return "Road Erosion";

      case "surface_damage":
        return "Road Surface Damage";

      case "other":
        return "Road Damage";

      default:
        return "Road Damage";
    }
  };

  // --------------------------------
  // SUBMIT COMPLAINT
  // --------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    // ------------------------------
    // CHECK LOGIN
    // ------------------------------
    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "You are not logged in. Please login first."
      );
      return;
    }

    // ------------------------------
    // VALIDATE DAMAGE TYPE
    // ------------------------------
    if (!damageType) {
      setError(
        "Please select a damage type."
      );
      return;
    }

    // ------------------------------
    // VALIDATE IMAGE
    // ------------------------------
    if (!image) {
      setError(
        "Please upload an image of the damaged road."
      );
      return;
    }

    // ------------------------------
    // VALIDATE LOCATION
    // ------------------------------
    if (!coordinates) {
      setError(
        "Please detect your location before submitting."
      );
      return;
    }

    // ------------------------------
    // VALIDATE DESCRIPTION
    // ------------------------------
    if (!description.trim()) {
      setError(
        "Please enter a description."
      );
      return;
    }

    setSubmitting(true);

    try {
      // ----------------------------
      // CREATE FORM DATA
      // ----------------------------
      const formData = new FormData();

      const complaintTitle =
        getComplaintTitle();

      formData.append(
        "title",
        complaintTitle
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "damageType",
        damageType
      );

      formData.append(
        "severity",
        severity
      );

      formData.append(
        "latitude",
        String(coordinates.latitude)
      );

      formData.append(
        "longitude",
        String(coordinates.longitude)
      );

      formData.append(
        "image",
        image
      );

      // ----------------------------
      // DEBUG INFORMATION
      // ----------------------------
      console.log(
        "Submitting complaint..."
      );

      console.log(
        "Title:",
        complaintTitle
      );

      console.log(
        "Damage Type:",
        damageType
      );

      console.log(
        "Severity:",
        severity
      );

      console.log(
        "Latitude:",
        coordinates.latitude
      );

      console.log(
        "Longitude:",
        coordinates.longitude
      );

      console.log(
        "Image:",
        image.name
      );

      // ----------------------------
      // SEND TO BACKEND
      // ----------------------------
      const response = await fetch(
        "http://localhost:5000/api/complaints",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      // ----------------------------
      // READ RESPONSE
      // ----------------------------
      const data = await response.json();

      console.log(
        "Backend response:",
        data
      );

      // ----------------------------
      // HANDLE ERROR
      // ----------------------------
      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit complaint."
        );
      }

      // ----------------------------
      // SUCCESS
      // ----------------------------
      setMessage(
        "Complaint submitted successfully!"
      );

      // Clear form
      setDamageType("");
      setSeverity("Medium");
      setImage(null);
      setLocation("");
      setCoordinates(null);
      setDescription("");

      // Reset file input
      event.target.reset();

      // ----------------------------
      // GO TO COMPLAINTS PAGE
      // ----------------------------
      setTimeout(() => {
        navigate("/complaints");
      }, 1500);
    } catch (submitError) {
      console.error(
        "Complaint submission error:",
        submitError
      );

      setError(
        submitError.message ||
          "Unable to submit complaint. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="report-container">
        <div className="report-card">

          <h1>Report Road Damage</h1>

          <p className="report-subtitle">
            Help improve your community by
            reporting damaged roads.
          </p>

          <form onSubmit={handleSubmit}>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                style={{
                  backgroundColor: "#ffe6e6",
                  color: "#b00020",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
              <div
                style={{
                  backgroundColor: "#e6f7eb",
                  color: "#146c2e",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                {message}
              </div>
            )}

            {/* DAMAGE TYPE */}
            <div className="form-group">
              <label>
                Damage Type
              </label>

              <select
                value={damageType}
                onChange={(event) => {
                  setDamageType(
                    event.target.value
                  );
                  setError("");
                  setMessage("");
                }}
                disabled={submitting}
              >
                <option value="">
                  Select damage type
                </option>

                <option value="pothole">
                  Pothole
                </option>

                <option value="crack">
                  Road Crack
                </option>

                <option value="waterlogging">
                  Waterlogging
                </option>

                <option value="broken_marking">
                  Broken Road Marking
                </option>

                <option value="road_erosion">
                  Road Erosion
                </option>

                <option value="surface_damage">
                  Surface Damage
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            {/* SEVERITY */}
            <div className="form-group">
              <label>
                Severity
              </label>

              <select
                value={severity}
                onChange={(event) => {
                  setSeverity(
                    event.target.value
                  );
                  setError("");
                  setMessage("");
                }}
                disabled={submitting}
              >
                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>

                <option value="Critical">
                  Critical
                </option>
              </select>
            </div>

            {/* IMAGE */}
            <div className="form-group">
              <label>
                Upload Road Image
              </label>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageChange}
                disabled={submitting}
              />

              {image && (
                <div className="image-preview">

                  <img
                    src={URL.createObjectURL(
                      image
                    )}
                    alt="Road damage preview"
                  />

                  <p>
                    {image.name}
                  </p>

                </div>
              )}
            </div>

            {/* LOCATION */}
            <div className="form-group">
              <label>
                Location
              </label>

              <div className="location-input">

                <input
                  type="text"
                  value={location}
                  onChange={(event) => {
                    setLocation(
                      event.target.value
                    );
                    setError("");
                  }}
                  placeholder="Enter road location"
                  disabled={submitting}
                />

                <button
                  type="button"
                  className="location-btn"
                  onClick={getLocation}
                  disabled={
                    locationLoading ||
                    submitting
                  }
                >
                  {locationLoading
                    ? "Detecting..."
                    : "📍 Use My Location"}
                </button>

              </div>

              {/* COORDINATES */}
              {coordinates && (
                <div className="coordinates">

                  <strong>
                    Location detected
                  </strong>

                  <p>
                    Latitude:{" "}
                    {coordinates.latitude.toFixed(
                      6
                    )}
                  </p>

                  <p>
                    Longitude:{" "}
                    {coordinates.longitude.toFixed(
                      6
                    )}
                  </p>

                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                rows="5"
                value={description}
                onChange={(event) => {
                  setDescription(
                    event.target.value
                  );
                  setError("");
                  setMessage("");
                }}
                placeholder="Describe the road damage..."
                disabled={submitting}
              ></textarea>
            </div>

            {/* READY MESSAGE */}
            {damageType &&
              image &&
              coordinates &&
              description.trim() && (
                <p className="form-message">
                  Complaint details are ready
                  to be submitted.
                </p>
              )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting
                ? "Submitting Complaint..."
                : "Submit Complaint"}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}

export default ReportDamage;