import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/reportDamage.css";

function ReportDamage() {
  const [damageType, setDamageType] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    if (selectedImage) {
      setImage(selectedImage);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!damageType || !image || !location || !description) {
      setMessage("Please fill in all fields and upload an image.");
      return;
    }

    setMessage("Complaint details are ready to be submitted.");
  };

  return (
    <>
      <Navbar />

      <div className="report-container">
        <div className="report-card">
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

              {image && (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Road damage preview"
                  />

                  <p>{image.name}</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Location</label>

              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Enter road location"
              />
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

            <button type="submit" className="submit-btn">
              Submit Complaint
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ReportDamage;