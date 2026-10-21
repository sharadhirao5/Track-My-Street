import Navbar from "../components/Navbar";
import "../styles/viewComplaint.css";

function ViewComplaint() {
  return (
    <>
      <Navbar />

      <main className="complaint-page">
        <div className="complaint-header">
          <h1>View Complaint</h1>
          <p>Track the details and current status of your complaint.</p>
        </div>

        <div className="complaint-card">
          <h2>Complaint Details</h2>

          <div className="complaint-details">
            <div className="detail-box">
              <h3>Complaint ID</h3>
              <p>#TMS001</p>
            </div>

            <div className="detail-box">
              <h3>Damage Type</h3>
              <p>Pothole</p>
            </div>

            <div className="detail-box">
              <h3>Location</h3>
              <p>Location will be displayed here</p>
            </div>

            <div className="detail-box">
              <h3>Status</h3>
              <span className="status">Submitted</span>
            </div>
          </div>

          <div className="complaint-message">
            Your complaint has been successfully submitted. You can track
            its progress here as it moves through the resolution process.
          </div>
        </div>
      </main>
    </>
  );
}

export default ViewComplaint;