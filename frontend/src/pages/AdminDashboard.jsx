import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/adminDashboard.css";

const API = "http://localhost:5000/api";
const STATUSES = ["Pending", "In Progress", "Resolved"];

function formatDamageType(value) {
  return (value || "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
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
    const user = getStoredUser();

    if (!token || user?.role !== "admin") {
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
        throw new Error(
          "Access denied. Please log in with a valid administrator account."
        );
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
          next[complaint._id] =
            previous[complaint._id] || complaint.status;
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
    { label: "Total Complaints", value: statistics?.total ?? "—", type: "total" },
    { label: "Pending", value: statistics?.pending ?? "—", type: "pending" },
    { label: "In Progress", value: statistics?.inProgress ?? "—", type: "progress" },
    { label: "Resolved", value: statistics?.resolved ?? "—", type: "resolved" },
    { label: "High / Critical", value: statistics?.highSeverity ?? "—", type: "severity" },
  ];

  return (
    <div className="admin-page">
      <Navbar />

      <main className="admin-main">
        <section className="admin-heading">
          <div>
            <p className="admin-eyebrow">ADMINISTRATION</p>
            <h1>Admin Dashboard</h1>
            <p className="admin-subtitle">
              Monitor road damage reports and manage complaint progress.
            </p>
          </div>

          <div className="admin-heading-actions">
            <button
              className="admin-button admin-button-primary"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>

            <button
              className="admin-button admin-button-danger"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </section>

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
              className={`admin-stat-card admin-stat-${item.type}`}
              key={item.label}
            >
              <p>{item.label}</p>
              <h2>{item.value}</h2>
            </article>
          ))}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Complaint Management</h2>
              <p>Search reports, filter results and update complaint status.</p>
            </div>

            <span className="admin-result-count">
              {filteredComplaints.length} complaints
            </span>
          </div>

          <div className="admin-filters">
            <input
              type="search"
              className="admin-input admin-search"
              placeholder="Search complaints or citizens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="admin-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              onChange={(e) => setSeverityFilter(e.target.value)}
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
                        <p className="admin-description">
                          {complaint.description || ""}
                        </p>
                      </td>

                      <td>
                        <strong>{complaint.user?.name || "Unknown"}</strong>
                        <small>{complaint.user?.email || ""}</small>
                      </td>

                      <td>{formatDamageType(complaint.damageType)}</td>

                      <td>
                        <span
                          className={`admin-severity admin-severity-${(
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

                      <td>{formatDate(complaint.createdAt)}</td>

                      <td>
                        <select
                          className="admin-input admin-status-select"
                          value={
                            selectedStatuses[complaint._id] ||
                            complaint.status
                          }
                          onChange={(e) =>
                            setSelectedStatuses((previous) => ({
                              ...previous,
                              [complaint._id]: e.target.value,
                            }))
                          }
                          aria-label={`Status for ${complaint.title || "complaint"}`}
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
                            (selectedStatuses[complaint._id] ||
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

        <section className="admin-panel admin-damage-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Complaints by Damage Type</h2>
              <p>Breakdown of reported road damage.</p>
            </div>
          </div>

          {!statistics?.byDamageType?.length ? (
            <p className="admin-empty">
              No damage-type statistics available.
            </p>
          ) : (
            <div className="admin-damage-list">
              {statistics.byDamageType.map((item) => (
                <div
                  className="admin-damage-item"
                  key={item._id || "unknown"}
                >
                  <span>{formatDamageType(item._id)}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;