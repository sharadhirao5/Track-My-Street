
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintMap from "../components/ComplaintMap";
import "../styles/adminDashboard.css";

const API = "http://localhost:5000/api";
const STATUSES = ["Pending", "In Progress", "Resolved"];

function formatDamageType(value) {
  return String(value || "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function getConfidencePercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return `${(number <= 1 ? number * 100 : number).toFixed(1)}%`;
}

function AIResults({ ai }) {
  if (!ai) {
    return <span className="admin-muted">No AI results saved</span>;
  }

  const detections = Array.isArray(ai.detections) ? ai.detections : [];
  const detected = Boolean(ai.damage_detected);
  const total = Number(ai.total_detections ?? detections.length);

  return (
    <div className="admin-ai-box">
      <div
        className={`admin-ai-title ${
          detected ? "admin-ai-detected" : "admin-ai-clear"
        }`}
      >
        {detected ? "Road damage detected" : "No damage detected"}
      </div>

      <div className="admin-ai-total">
        Total detections: {Number.isFinite(total) ? total : 0}
      </div>

      {detections.length > 0 ? (
        <ul className="admin-ai-list">
          {detections.map((item, index) => (
            <li key={`${item.class || "damage"}-${index}`}>
              <strong>{formatDamageType(item.class)}</strong>
              <div className="admin-ai-confidence">
                Confidence: {getConfidencePercent(item.confidence)}
                {item.confidence_label
                  ? ` · ${item.confidence_label}`
                  : ""}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="admin-muted admin-ai-empty">
          No individual detections available.
        </div>
      )}

      {ai.annotated_image && (
        <div className="admin-ai-image-wrap">
          <p>Annotated detection image</p>

          <img
            src={
              String(ai.annotated_image).startsWith("http")
                ? ai.annotated_image
                : `http://localhost:5001${
                    String(ai.annotated_image).startsWith("/") ? "" : "/"
                  }${ai.annotated_image}`
            }
            alt="AI-detected road damage"
            className="admin-ai-image"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [statistics, setStatistics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadData = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      logout();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsResponse, complaintsResponse] = await Promise.all([
        fetch(`${API}/dashboard/statistics`, { headers }),
        fetch(`${API}/complaints/admin`, { headers }),
      ]);

      const statsData = await statsResponse.json();
      const complaintsData = await complaintsResponse.json();

      if (
        statsResponse.status === 401 ||
        statsResponse.status === 403 ||
        complaintsResponse.status === 401 ||
        complaintsResponse.status === 403
      ) {
        logout();
        return;
      }

      if (!statsResponse.ok) {
        throw new Error(
          statsData.message || "Unable to load dashboard statistics."
        );
      }

      if (!complaintsResponse.ok) {
        throw new Error(
          complaintsData.message || "Unable to load complaints."
        );
      }

      const complaintList = Array.isArray(complaintsData.complaints)
        ? complaintsData.complaints
        : [];

      setStatistics(statsData);
      setComplaints(complaintList);

      setSelectedStatuses((previous) => {
        const next = { ...previous };

        for (const complaint of complaintList) {
          if (!(complaint._id in next)) {
            next[complaint._id] = complaint.status;
          }
        }

        return next;
      });
    } catch (err) {
      setError(err.message || "Unable to load the admin dashboard.");
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const user = getStoredUser();

    if (!localStorage.getItem("token") || user?.role !== "admin") {
      navigate("/login", { replace: true });
      return;
    }

    loadData();
  }, [loadData, navigate]);

  const updateStatus = async (complaint) => {
    const newStatus = selectedStatuses[complaint._id];

    if (!newStatus || newStatus === complaint.status) {
      setMessage("Choose a status different from the current status.");
      return;
    }

    const token = localStorage.getItem("token");

    setUpdatingId(complaint._id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/complaints/${complaint._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            remark: "Status updated by administrator.",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status.");
      }

      setMessage(`Complaint status updated to ${newStatus}.`);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to update complaint status.");
    } finally {
      setUpdatingId("");
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus =
      statusFilter === "All" || complaint.status === statusFilter;

    const matchesSeverity =
      severityFilter === "All" || complaint.severity === severityFilter;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        complaint.title,
        complaint.description,
        complaint.damageType,
        complaint.user?.name,
        complaint.user?.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const statCards = [
    {
      label: "Total Complaints",
      value: statistics?.total ?? "—",
      className: "admin-stat-total",
    },
    {
      label: "Pending",
      value: statistics?.pending ?? "—",
      className: "admin-stat-pending",
    },
    {
      label: "In Progress",
      value: statistics?.inProgress ?? "—",
      className: "admin-stat-progress",
    },
    {
      label: "Resolved",
      value: statistics?.resolved ?? "—",
      className: "admin-stat-resolved",
    },
    {
      label: "High / Critical",
      value: statistics?.highSeverity ?? "—",
      className: "admin-stat-severity",
    },
  ];

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>🚧 Track My Street</h1>
          <p>Admin Dashboard</p>
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-button admin-button-light"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="admin-button admin-button-danger"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-heading">
          <div>
            <h2>Overview</h2>
            <p>Review reports, AI results and manage complaint progress.</p>
          </div>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-alert admin-alert-success" role="status">
            {message}
          </div>
        )}

        <section className="admin-stats">
          {statCards.map((item) => (
            <article
              key={item.label}
              className={`admin-stat-card ${item.className}`}
            >
              <p>{item.label}</p>
              <h3>{item.value}</h3>
            </article>
          ))}
        </section>

        {/* New map section. Uses the existing protected /api/map/complaints API. */}
        <ComplaintMap />

        <section className="admin-panel">
          <div className="admin-panel-heading-row">
            <h2 className="admin-panel-heading">Complaint Management</h2>
            <span className="admin-result-count">
              {filteredComplaints.length} complaints
            </span>
          </div>

          <div className="admin-filters">
            <input
              className="admin-input"
              type="search"
              placeholder="Search complaints or citizens"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="admin-input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              className="admin-input"
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              aria-label="Filter by severity"
            >
              <option value="All">All severities</option>
              {["Low", "Medium", "High", "Critical"].map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="admin-empty">Loading complaints...</p>
          ) : filteredComplaints.length === 0 ? (
            <p className="admin-empty">No complaints match your filters.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    {[
                      "Complaint",
                      "Citizen",
                      "Damage",
                      "Severity",
                      "Location",
                      "AI Detection",
                      "Submitted",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td>
                        <strong>{complaint.title || "Untitled"}</strong>
                        <p className="admin-complaint-description">
                          {complaint.description || ""}
                        </p>

                        {complaint.image && (
                          <a
                            href={`http://localhost:5000${complaint.image}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View image
                          </a>
                        )}
                      </td>

                      <td>
                        {complaint.user?.name || "Unknown"}
                        <br />
                        <small>{complaint.user?.email || ""}</small>
                      </td>

                      <td>{formatDamageType(complaint.damageType)}</td>

                      <td>
                        <span
                          className={`admin-severity-badge admin-severity-${String(
                            complaint.severity || "unknown"
                          ).toLowerCase()}`}
                        >
                          {complaint.severity || "—"}
                        </span>
                      </td>

                      <td>
                        {complaint.latitude ?? "—"},{" "}
                        {complaint.longitude ?? "—"}
                      </td>

                      <td>
                        <AIResults ai={complaint.aiDetection} />
                      </td>

                      <td>{formatDate(complaint.createdAt)}</td>

                      <td>
                        <select
                          className="admin-status-select"
                          value={
                            selectedStatuses[complaint._id] ??
                            complaint.status
                          }
                          onChange={(event) =>
                            setSelectedStatuses((previous) => ({
                              ...previous,
                              [complaint._id]: event.target.value,
                            }))
                          }
                          aria-label={`Status for ${
                            complaint.title || "complaint"
                          }`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <button
                          className="admin-button admin-button-primary admin-update-button"
                          disabled={
                            updatingId === complaint._id ||
                            (selectedStatuses[complaint._id] ??
                              complaint.status) === complaint.status
                          }
                          onClick={() => updateStatus(complaint)}
                        >
                          {updatingId === complaint._id
                            ? "Saving..."
                            : "Update"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-panel">
          <h2 className="admin-panel-heading">Complaints by Damage Type</h2>

          {!statistics?.byDamageType?.length ? (
            <p className="admin-empty">
              No damage-type statistics available.
            </p>
          ) : (
            <ul className="admin-damage-list">
              {statistics.byDamageType.map((item, index) => (
                <li key={item._id || `unknown-${index}`}>
                  <span>{formatDamageType(item._id)}</span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;