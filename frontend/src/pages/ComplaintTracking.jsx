import Navbar from "../components/Navbar";
import "../styles/complaintTracking.css";
import { FaCheckCircle, FaClock, FaMapMarkerAlt } from "react-icons/fa";

function ComplaintTracking() {
  const complaint = {
    id: "TMS001",
    damage: "Pothole",
    location: "Main Road",
    date: "August 11, 2026",
    status: "In Progress",
  };

  return (
    <>
      <Navbar />

      <main className="tracking-page">
        <div className="tracking-header">
          <div>
            <p className="tracking-label">COMPLAINT TRACKING</p>

            <h1>Track Your Complaint</h1>

            <p>
              Follow the progress of your reported road damage.
            </p>
          </div>

          <div className="complaint-id">
            Complaint ID
            <strong>{complaint.id}</strong>
          </div>
        </div>

        <section className="complaint-summary">
          <div>
            <span>Damage Type</span>
            <strong>{complaint.damage}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>
              <FaMapMarkerAlt /> {complaint.location}
            </strong>
          </div>

          <div>
            <span>Date Reported</span>
            <strong>{complaint.date}</strong>
          </div>

          <div>
            <span>Current Status</span>
            <strong className="current-status">
              {complaint.status}
            </strong>
          </div>
        </section>

        <section className="timeline-card">
          <h2>Complaint Progress</h2>

          <div className="timeline">

            <div className="timeline-item completed">
              <div className="timeline-icon">
                <FaCheckCircle />
              </div>

              <div>
                <h3>Complaint Submitted</h3>
                <p>
                  Your road damage complaint was successfully submitted.
                </p>
                <span>August 11, 2026</span>
              </div>
            </div>

            <div className="timeline-item completed">
              <div className="timeline-icon">
                <FaCheckCircle />
              </div>

              <div>
                <h3>AI Analysis Completed</h3>
                <p>
                  AI detected a pothole with 94.7% confidence.
                </p>
                <span>August 11, 2026</span>
              </div>
            </div>

            <div className="timeline-item active">
              <div className="timeline-icon">
                <FaClock />
              </div>

              <div>
                <h3>Assigned for Inspection</h3>
                <p>
                  The complaint has been assigned for road inspection.
                </p>
                <span>In Progress</span>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon">
                <FaCheckCircle />
              </div>

              <div>
                <h3>Repair Completed</h3>
                <p>
                  The road damage will be marked resolved after repair.
                </p>
                <span>Pending</span>
              </div>
            </div>

          </div>
        </section>

        <section className="tracking-note">
          <h3>What happens next?</h3>

          <p>
            The reported damage will be reviewed and assigned to the
            responsible authority. You can continue checking this page
            for status updates.
          </p>
        </section>
      </main>
    </>
  );
}

export default ComplaintTracking;