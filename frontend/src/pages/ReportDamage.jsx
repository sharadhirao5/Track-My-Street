import Navbar from "../components/Navbar";
import "../styles/reportDamage.css";

function ReportDamage() {
  return (
    <>
      <Navbar />

      <div className="report-container">
        <div className="report-card">
          <h1>Report Road Damage</h1>

          <p className="report-subtitle">
            Help improve your community by reporting damaged roads.
          </p>

          <form>
            <div className="form-group">
              <label>Damage Type</label>

              <select>
                <option value="">Select damage type</option>
                <option value="pothole">Pothole</option>
                <option value="crack">Road Crack</option>
                <option value="waterlogging">Waterlogging</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Upload Road Image</label>

              <input type="file" accept="image/*" />
            </div>

            <div className="form-group">
              <label>Location</label>

              <input
                type="text"
                placeholder="Enter road location"
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                rows="5"
                placeholder="Describe the road damage..."
              ></textarea>
            </div>

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