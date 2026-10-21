
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import "../styles/myComplaints.css";

const API_URL = "http://localhost:5000";

function MyComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchComplaints = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setComplaints([]);
        setError("Please log in to view your complaints.");
        return;
      }

      const response = await fetch(`${API_URL}/api/complaints`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", {
          state: { from: "/complaints" },
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load complaints.");
      }

      let complaintList = [];

      if (Array.isArray(data)) {
        complaintList = data;
      } else if (Array.isArray(data.complaints)) {
        complaintList = data.complaints;
      } else if (Array.isArray(data.data)) {
        complaintList = data.data;
      }

      setComplaints(complaintList);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError(
        err.message || "Unable to load complaints. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const getStatus = (status) => {
    const normalized = String(status || "Pending")
      .toLowerCase()
      .replace(/[_-]/g, " ");

    if (normalized.includes("resolv") || normalized.includes("clos")) {
      return "Resolved";
    }

    if (
      normalized.includes("progress") ||
      normalized.includes("assigned") ||
      normalized.includes("investigat")
    ) {
      return "In Progress";
    }

    return "Pending";
  };

  const getSeverityStyle = (severity) => {
    const normalized = String(severity || "Low").toLowerCase();

    if (normalized === "critical") {
      return { color: "#b00020", fontWeight: 700 };
    }

    if (normalized === "high") {
      return { color: "#d93025", fontWeight: 600 };
    }

    if (normalized === "medium") {
      return { color: "#8a5700", fontWeight: 600 };
    }

    return { color: "#146c2e", fontWeight: 600 };
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString();
  };

  const getComplaintType = (complaint) =>
    complaint.damageType ||
    complaint.type ||
    complaint.title ||
    complaint.category ||
    "Road Damage";

  const getComplaintId = (complaint) =>
    complaint._id || complaint.id || "ID unavailable";

  const getLocation = (complaint) =>
    complaint.location ||
    complaint.address ||
    complaint.roadName ||
    "Location unavailable";

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return "";

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  return (
    <>
      <Navbar />

      <main className="complaints-page">
        <section className="complaints-header">
          <div>
            <p className="complaints-label">MY COMPLAINTS</p>
            <h1>Reported Road Damage</h1>
            <p>
              View and track the road damage complaints you have reported.
            </p>

            {!loading && !error && (
              <p className="complaints-total">
                Total complaints: <strong>{complaints.length}</strong>
              </p>
            )}
          </div>

          <div className="complaints-header-actions">
            <button
              type="button"
              className="refresh-complaints-btn"
              onClick={() => fetchComplaints(true)}
              disabled={refreshing || loading}
            >
              <FaSyncAlt />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link to="/report" className="new-complaint-btn">
              + Report New Damage
            </Link>
          </div>
        </section>

        {loading && (
          <section className="complaints-message" role="status">
            Loading your complaints...
          </section>
        )}

        {!loading && error && (
          <section className="complaints-message complaints-error" role="alert">
            <FaExclamationCircle />
            <span>{error}</span>

            {!localStorage.getItem("token") && (
              <Link to="/login">Log in</Link>
            )}

            <button type="button" onClick={() => fetchComplaints()}>
              Try again
            </button>
          </section>
        )}

        {!loading && !error && complaints.length === 0 && (
          <section className="complaints-message complaints-empty">
            <FaMapMarkerAlt />
            <h2>No complaints yet</h2>
            <p>
              You have not reported any road damage yet. Help improve your
              streets by reporting an issue.
            </p>
            <Link to="/report" className="new-complaint-btn">
              Report Road Damage
            </Link>
          </section>
        )}

        {!loading && !error && complaints.length > 0 && (
          <section className="complaints-list">
            {complaints.map((complaint, index) => {
              const status = getStatus(
                complaint.status || complaint.complaintStatus
              );
              const complaintId = getComplaintId(complaint);
              const imageUrl = getImageUrl(
                complaint.image ||
                  complaint.imageUrl ||
                  complaint.photo
              );

              return (
                <article
                  className="complaint-card"
                  key={complaintId === "ID unavailable" ? index : complaintId}
                >
                  <div className="complaint-card-top">
                    <div className="complaint-title">
                      <div className="complaint-type-icon">
                        <FaMapMarkerAlt />
                      </div>

                      <div>
                        <h2>{getComplaintType(complaint)}</h2>
                        <p className="complaint-id">
                          ID: {complaintId}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`complaint-status ${status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="complaint-card-details">
                    <div>
                      <FaMapMarkerAlt />
                      <span>{getLocation(complaint)}</span>
                    </div>

                    <div>
                      <FaClock />
                      <span>
                        {formatDate(
                          complaint.createdAt ||
                            complaint.reportedAt ||
                            complaint.date
                        )}
                      </span>
                    </div>

                    {complaint.severity && (
                      <div>
                        <strong>Severity:</strong>
                        <span style={getSeverityStyle(complaint.severity)}>
                          {complaint.severity}
                        </span>
                      </div>
                    )}
                  </div>

                  {(complaint.description || complaint.details) && (
                    <p className="complaint-description">
                      {complaint.description || complaint.details}
                    </p>
                  )}

                  {(complaint.latitude != null ||
                    complaint.longitude != null) && (
                    <div className="complaint-location-coordinates">
                      <strong>Coordinates</strong>
                      <p>
                        Latitude: {complaint.latitude ?? "N/A"}
                      </p>
                      <p>
                        Longitude: {complaint.longitude ?? "N/A"}
                      </p>
                    </div>
                  )}

                  {imageUrl && (
                    <div className="complaint-image-container">
                      <strong>Reported Road Damage</strong>
                      <img
                        src={imageUrl}
                        alt="Reported road damage"
                        className="complaint-image"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="complaint-card-footer">
                    <span className="complaint-footer-status">
                      {status === "Resolved" ? (
                        <>
                          <FaCheckCircle /> Complaint resolved
                        </>
                      ) : (
                        <>
                          <FaClock /> Awaiting further action
                        </>
                      )}
                    </span>

                    <Link
                      to="/complaint-tracking"
                      state={{ complaint }}
                      className="view-complaint-btn"
                    >
                      View Details <FaArrowRight />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}

export default MyComplaints;
