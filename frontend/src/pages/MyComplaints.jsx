import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

function MyComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------
  // FETCH COMPLAINTS
  // ---------------------------------------
  const fetchComplaints = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      // Check login
      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/complaints",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("My Complaints response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load complaints."
        );
      }

      // Backend can return:
      // 1. An array
      // 2. { complaints: [...] }
      let complaintList = [];

      if (Array.isArray(data)) {
        complaintList = data;
      } else if (Array.isArray(data.complaints)) {
        complaintList = data.complaints;
      }

      setComplaints(complaintList);
    } catch (error) {
      console.error(
        "Error fetching complaints:",
        error
      );

      setError(
        error.message ||
          "Unable to load complaints. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ---------------------------------------
  // LOAD WHEN PAGE OPENS
  // ---------------------------------------
  useEffect(() => {
    fetchComplaints();
  }, []);

  // ---------------------------------------
  // STATUS CLASS
  // ---------------------------------------
  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved":
        return {
          color: "#146c2e",
          backgroundColor: "#e6f7eb",
          padding: "5px 10px",
          borderRadius: "15px",
          fontWeight: "600",
        };

      case "In Progress":
        return {
          color: "#8a5700",
          backgroundColor: "#fff3cd",
          padding: "5px 10px",
          borderRadius: "15px",
          fontWeight: "600",
        };

      case "Pending":
      default:
        return {
          color: "#174ea6",
          backgroundColor: "#e8f0fe",
          padding: "5px 10px",
          borderRadius: "15px",
          fontWeight: "600",
        };
    }
  };

  // ---------------------------------------
  // SEVERITY STYLE
  // ---------------------------------------
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "Critical":
        return {
          color: "#b00020",
          fontWeight: "700",
        };

      case "High":
        return {
          color: "#d93025",
          fontWeight: "600",
        };

      case "Medium":
        return {
          color: "#8a5700",
          fontWeight: "600",
        };

      case "Low":
      default:
        return {
          color: "#146c2e",
          fontWeight: "600",
        };
    }
  };

  // ---------------------------------------
  // FORMAT DATE
  // ---------------------------------------
  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    try {
      return new Date(date).toLocaleString();
    } catch {
      return "Not available";
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard">

        {/* -------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------- */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div>
            <h1>My Complaints</h1>

            {!loading && !error && (
              <p
                style={{
                  color: "#666",
                  marginTop: "5px",
                }}
              >
                Total complaints:{" "}
                <strong>
                  {complaints.length}
                </strong>
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            {/* BACK */}
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#6b7280",
                color: "white",
                cursor: "pointer",
              }}
            >
              ← Dashboard
            </button>

            {/* REFRESH */}
            <button
              type="button"
              onClick={() =>
                fetchComplaints(true)
              }
              disabled={refreshing}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#2563eb",
                color: "white",
                cursor: refreshing
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* -------------------------------- */}
        {/* LOADING */}
        {/* -------------------------------- */}

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
            }}
          >
            <h3>Loading complaints...</h3>

            <p>
              Please wait while we retrieve
              your submitted complaints.
            </p>
          </div>
        )}

        {/* -------------------------------- */}
        {/* ERROR */}
        {/* -------------------------------- */}

        {!loading && error && (
          <div
            style={{
              backgroundColor: "#ffe6e6",
              color: "#b00020",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h3>
              Unable to load complaints
            </h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                fetchComplaints(true)
              }
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#b00020",
                color: "white",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* -------------------------------- */}
        {/* EMPTY STATE */}
        {/* -------------------------------- */}

        {!loading &&
          !error &&
          complaints.length === 0 && (
            <div
              style={{
                backgroundColor: "#eef5ff",
                padding: "40px 25px",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <h2>
                No Complaints Yet
              </h2>

              <p
                style={{
                  marginTop: "10px",
                  color: "#555",
                }}
              >
                You have not submitted any
                road damage complaints yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/report")
                }
                style={{
                  marginTop: "20px",
                  padding: "12px 25px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                📷 Report Road Damage
              </button>
            </div>
          )}

        {/* -------------------------------- */}
        {/* COMPLAINT LIST */}
        {/* -------------------------------- */}

        {!loading &&
          !error &&
          complaints.length > 0 && (
            <div className="dashboard-cards">

              {complaints.map((complaint) => (
                <div
                  className="dashboard-card"
                  key={complaint._id}
                  style={{
                    textAlign: "left",
                  }}
                >

                  {/* TITLE */}
                  <h3>
                    {complaint.title ||
                      "Road Damage Complaint"}
                  </h3>

                  {/* DESCRIPTION */}
                  <p>
                    <strong>
                      Description:
                    </strong>{" "}
                    {complaint.description ||
                      "No description provided."}
                  </p>

                  {/* DAMAGE TYPE */}
                  <p>
                    <strong>
                      Damage Type:
                    </strong>{" "}
                    {complaint.damageType ||
                      "Not specified"}
                  </p>

                  {/* SEVERITY */}
                  <p>
                    <strong>
                      Severity:
                    </strong>{" "}
                    <span
                      style={getSeverityStyle(
                        complaint.severity
                      )}
                    >
                      {complaint.severity ||
                        "Medium"}
                    </span>
                  </p>

                  {/* STATUS */}
                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    <span
                      style={getStatusStyle(
                        complaint.status
                      )}
                    >
                      {complaint.status ||
                        "Pending"}
                    </span>
                  </p>

                  {/* LOCATION */}
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                    }}
                  >
                    <strong>
                      📍 Location
                    </strong>

                    <p
                      style={{
                        marginTop: "6px",
                      }}
                    >
                      Latitude:{" "}
                      {complaint.latitude ??
                        "N/A"}
                    </p>

                    <p>
                      Longitude:{" "}
                      {complaint.longitude ??
                        "N/A"}
                    </p>
                  </div>

                  {/* IMAGE */}
                  {complaint.image && (
                    <div
                      style={{
                        marginTop: "15px",
                      }}
                    >
                      <strong>
                        Road Damage Image
                      </strong>

                      <br />

                      <img
                        src={`http://localhost:5000${complaint.image}`}
                        alt="Reported road damage"
                        style={{
                          width: "100%",
                          maxWidth: "350px",
                          maxHeight: "250px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          marginTop: "8px",
                        }}
                      />
                    </div>
                  )}

                  {/* DATE */}
                  <p
                    style={{
                      marginTop: "15px",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    <strong>
                      Submitted:
                    </strong>{" "}
                    {formatDate(
                      complaint.createdAt
                    )}
                  </p>

                  {/* COMPLAINT ID */}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      wordBreak: "break-all",
                    }}
                  >
                    Complaint ID:{" "}
                    {complaint._id}
                  </p>

                </div>
              ))}

            </div>
          )}

      </div>
    </>
  );
}

export default MyComplaints;