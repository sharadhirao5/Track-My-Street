
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import {
  FaCamera,
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaPlus,
  FaMapMarkerAlt,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/complaints",
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load complaints."
          );
        }

        const items = Array.isArray(data)
          ? data
          : data.complaints || data.data || [];

        setComplaints(items);
      } catch (err) {
        setError(err.message || "Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const totalReports = complaints.length;

  const pendingReports = complaints.filter((complaint) =>
    ["pending", "submitted", "in progress", "in-progress"].includes(
      String(complaint.status || "").toLowerCase()
    )
  ).length;

  const resolvedReports = complaints.filter(
    (complaint) =>
      String(complaint.status || "").toLowerCase() === "resolved"
  ).length;

  const getComplaintId = (complaint) =>
    complaint._id || complaint.id || complaint.complaintId || "N/A";

  const getComplaintType = (complaint) =>
    complaint.damageType ||
    complaint.type ||
    complaint.title ||
    "Road Damage";

  const getLocation = (complaint) =>
    complaint.location?.address ||
    complaint.location?.name ||
    complaint.address ||
    (typeof complaint.location === "string"
      ? complaint.location
      : "") ||
    "Location not available";

  const getDate = (complaint) => {
    const value =
      complaint.createdAt ||
      complaint.date ||
      complaint.created_at;

    if (!value) return "N/A";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString();
  };

  const getStatus = (complaint) =>
    complaint.status || "Pending";

  return (
    <>
      <Navbar />

      <main className="dashboard">
        <section className="dashboard-header">
          <div>
            <p className="dashboard-label">CITIZEN DASHBOARD</p>
            <h1>Welcome Back!</h1>
            <p>
              Monitor your reported road damage and track complaint
              updates.
            </p>
          </div>

          <Link to="/report" className="dashboard-report-btn">
            <FaPlus /> Report Damage
          </Link>
        </section>

        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon blue">
              <FaClipboardList />
            </div>
            <div>
              <h2>{loading ? "..." : totalReports}</h2>
              <p>Total Reports</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <FaClock />
            </div>
            <div>
              <h2>{loading ? "..." : pendingReports}</h2>
              <p>Pending / In Progress</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <FaCheckCircle />
            </div>
            <div>
              <h2>{loading ? "..." : resolvedReports}</h2>
              <p>Resolved Reports</p>
            </div>
          </div>
        </section>

        <section className="dashboard-cards">
          <button
            type="button"
            className="dashboard-card"
            onClick={() => navigate("/report")}
          >
            <FaCamera className="dashboard-icon" />
            <h3>Report Damage</h3>
            <p>Upload images of damaged roads.</p>
          </button>

          <button
            type="button"
            className="dashboard-card"
            onClick={() => navigate("/complaints")}
          >
            <FaClipboardList className="dashboard-icon" />
            <h3>My Complaints</h3>
            <p>View submitted complaints.</p>
          </button>

          <button
            type="button"
            className="dashboard-card"
            onClick={() => navigate("/notifications")}
          >
            <FaBell className="dashboard-icon" />
            <h3>Notifications</h3>
            <p>Track complaint updates.</p>
          </button>

          <button
            type="button"
            className="dashboard-card"
            onClick={() => navigate("/profile")}
          >
            <FaUserCircle className="dashboard-icon" />
            <h3>Profile</h3>
            <p>Manage your account.</p>
          </button>
        </section>

      

        <section className="complaints-section">
          <div className="section-heading">
            <div>
              <h2>Recent Complaints</h2>
              <p>Your latest reported road damage.</p>
            </div>

            <span className="complaint-count">
              {loading
                ? "Loading..."
                : `${complaints.length} Recent`}
            </span>
          </div>

          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}

          {!loading && !error && complaints.length === 0 && (
            <p>
              No complaints found yet. Report road damage to get
              started.
            </p>
          )}

          {complaints.length > 0 && (
            <div className="complaints-table">
              <div className="table-header">
                <span>Complaint</span>
                <span>Location</span>
                <span>Date</span>
                <span>Status</span>
              </div>

              {complaints.slice(0, 5).map((complaint) => {
                const status = getStatus(complaint);

                return (
                  <div
                    className="complaint-row"
                    key={getComplaintId(complaint)}
                  >
                    <div className="complaint-info">
                      <div className="complaint-icon">
                        <FaMapMarkerAlt />
                      </div>

                      <div>
                        <h3>{getComplaintType(complaint)}</h3>
                        <p>{getComplaintId(complaint)}</p>
                      </div>
                    </div>

                    <span>{getLocation(complaint)}</span>
                    <span>{getDate(complaint)}</span>

                    <span
                      className={`status ${String(status)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Dashboard;
