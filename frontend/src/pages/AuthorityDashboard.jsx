import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000/api";

function AuthorityDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/authority/my-complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load assigned complaints."
        );
      }

      setComplaints(
        Array.isArray(data.complaints) ? data.complaints : []
      );
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const updateStatus = async (complaintId, status) => {
    setError("");
    setMessage("");
    setUpdatingId(complaintId);

    try {
      const response = await fetch(
        `${API}/authority/update-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            complaintId,
            status,
            remark: remarks[complaintId] || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update complaint status."
        );
      }

      setMessage("Complaint status updated successfully.");

      await loadComplaints();
    } catch (err) {
      setError(err.message || "Status update failed.");
    } finally {
      setUpdatingId("");
    }
  };

  if (!token || !user || user.role !== "authority") {
    return null;
  }

  const pendingCount = complaints.filter(
    (item) => item.status === "Pending"
  ).length;

  const progressCount = complaints.filter(
    (item) => item.status === "In Progress"
  ).length;

  const resolvedCount = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  const styles = {
    page: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "24px",
      color: "#1f2937",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "24px",
    },
    button: {
      border: "none",
      borderRadius: "7px",
      padding: "10px 15px",
      cursor: "pointer",
      fontWeight: "600",
    },
    stats: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      marginBottom: "26px",
    },
    statCard: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
      background: "#ffffff",
    },
    card: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "18px",
      background: "#ffffff",
    },
    field: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px",
      border: "1px solid #d1d5db",
      borderRadius: "7px",
      marginTop: "6px",
    },
    alert: {
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "16px",
    },
  };

  return (
    <>
      <Navbar />

      <main style={styles.page}>
        <header style={styles.header}>
          <div>
            <h1 style={{ marginBottom: "6px" }}>
              Authority Dashboard
            </h1>
            <p style={{ margin: 0, color: "#6b7280" }}>
              Welcome, {user.name || "Authority"}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              ...styles.button,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            Logout
          </button>
        </header>

        {error && (
          <div
            role="alert"
            style={{
              ...styles.alert,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            style={{
              ...styles.alert,
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            {message}
          </div>
        )}

        <section style={styles.stats}>
          {[
            ["Total Assigned", complaints.length],
            ["Pending", pendingCount],
            ["In Progress", progressCount],
            ["Resolved", resolvedCount],
          ].map(([label, value]) => (
            <div key={label} style={styles.statCard}>
              <p style={{ margin: 0, color: "#6b7280" }}>
                {label}
              </p>
              <h2 style={{ marginBottom: 0 }}>{value}</h2>
            </div>
          ))}
        </section>

        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Assigned Complaints</h2>

          <button
            type="button"
            onClick={loadComplaints}
            disabled={loading}
            style={{
              ...styles.button,
              background: "#dbeafe",
              color: "#1d4ed8",
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p>Loading assigned complaints...</p>
        ) : complaints.length === 0 ? (
          <div style={styles.card}>
            <h3>No assigned complaints yet</h3>
            <p>
              Complaints assigned to your authority account will
              appear here.
            </p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <article
              key={complaint._id}
              style={styles.card}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <h3 style={{ marginTop: 0 }}>
                    {complaint.title || "Road Damage Complaint"}
                  </h3>
                  <p>
                    {complaint.description ||
                      "No description provided."}
                  </p>
                </div>

                <span
                  style={{
                    background:
                      complaint.status === "Resolved"
                        ? "#dcfce7"
                        : complaint.status === "In Progress"
                        ? "#fef3c7"
                        : "#fee2e2",
                    color:
                      complaint.status === "Resolved"
                        ? "#166534"
                        : complaint.status === "In Progress"
                        ? "#92400e"
                        : "#991b1b",
                    padding: "7px 10px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {complaint.status}
                </span>
              </div>

              <p>
                <strong>Damage type:</strong>{" "}
                {complaint.damageType || "Not specified"}
              </p>

              <p>
                <strong>Severity:</strong>{" "}
                {complaint.severity || "Not specified"}
              </p>

              <p>
                <strong>Reported by:</strong>{" "}
                {complaint.user?.name || "Citizen"}
              </p>

              {complaint.latitude != null &&
                complaint.longitude != null && (
                  <p>
                    <strong>Location:</strong>{" "}
                    {complaint.latitude}, {complaint.longitude}
                  </p>
                )}

              {complaint.image && (
                <p>
                  <a
                    href={
                      complaint.image.startsWith("http")
                        ? complaint.image
                        : `http://localhost:5000/${complaint.image.replace(
                            /^\/+/,
                            ""
                          )}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    View complaint image
                  </a>
                </p>
              )}

              <label
                htmlFor={`remark-${complaint._id}`}
                style={{ display: "block", marginTop: "16px" }}
              >
                Work remarks
              </label>

              <textarea
                id={`remark-${complaint._id}`}
                value={remarks[complaint._id] || ""}
                onChange={(e) =>
                  setRemarks((previous) => ({
                    ...previous,
                    [complaint._id]: e.target.value,
                  }))
                }
                placeholder="Enter progress details or remarks..."
                rows={3}
                style={styles.field}
                disabled={
                  complaint.status === "Resolved" ||
                  updatingId === complaint._id
                }
              />

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                <button
                  type="button"
                  disabled={
                    updatingId === complaint._id ||
                    complaint.status === "In Progress" ||
                    complaint.status === "Resolved"
                  }
                  onClick={() =>
                    updateStatus(complaint._id, "In Progress")
                  }
                  style={{
                    ...styles.button,
                    background: "#fef3c7",
                    color: "#92400e",
                    opacity:
                      complaint.status === "Resolved" ? 0.5 : 1,
                  }}
                >
                  {updatingId === complaint._id
                    ? "Updating..."
                    : "Mark In Progress"}
                </button>

                <button
                  type="button"
                  disabled={
                    updatingId === complaint._id ||
                    complaint.status === "Resolved"
                  }
                  onClick={() =>
                    updateStatus(complaint._id, "Resolved")
                  }
                  style={{
                    ...styles.button,
                    background: "#dcfce7",
                    color: "#166534",
                  }}
                >
                  Mark Resolved
                </button>
              </div>
            </article>
          ))
        )}
      </main>
    </>
  );
}

export default AuthorityDashboard;