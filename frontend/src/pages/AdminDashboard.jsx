
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";
const STATUSES = ["Pending", "In Progress", "Resolved"];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    color: "#172033",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    background: "#142b4a",
    color: "#fff",
    padding: "18px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  main: {
    width: "90%",
    maxWidth: "1400px",
    margin: "28px auto",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    margin: "24px 0",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(20,43,74,0.07)",
  },
  panel: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "22px",
    boxShadow: "0 2px 10px rgba(20,43,74,0.07)",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#fff",
    maxWidth: "100%",
  },
  button: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },
  tableWrap: {
    overflowX: "auto",
    width: "100%",
  },
  table: {
    width: "100%",
    minWidth: "850px",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  cell: {
    padding: "12px",
    borderBottom: "1px solid #e5eaf1",
    verticalAlign: "top",
  },
};

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

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
  }, []);

  useEffect(() => {
    const storedUser = (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    })();

    if (!localStorage.getItem("token") || storedUser?.role !== "admin") {
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
    ["Total Complaints", statistics?.total ?? "—"],
    ["Pending", statistics?.pending ?? "—"],
    ["In Progress", statistics?.inProgress ?? "—"],
    ["Resolved", statistics?.resolved ?? "—"],
    ["High / Critical", statistics?.highSeverity ?? "—"],
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>
            Track My Street
          </h1>
          <p style={{ margin: "6px 0 0", opacity: 0.85 }}>
            Admin Dashboard
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            style={{ ...styles.button, background: "#fff", color: "#142b4a" }}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            style={{ ...styles.button, background: "#b42318", color: "#fff" }}
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <h2>Overview</h2>
        <p>Review reports and manage complaint progress.</p>

        {error && (
          <div
            role="alert"
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "16px",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "16px",
            }}
          >
            {message}
          </div>
        )}

        <section style={styles.cards}>
          {statCards.map(([label, value]) => (
            <div key={label} style={styles.card}>
              <p style={{ color: "#64748b", marginTop: 0 }}>{label}</p>
              <h2 style={{ marginBottom: 0, fontSize: "30px" }}>{value}</h2>
            </div>
          ))}
        </section>

        <section style={styles.panel}>
          <h2 style={{ marginTop: 0 }}>Complaint Management</h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <input
              style={styles.input}
              type="search"
              placeholder="Search complaints or citizens"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              style={styles.input}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              style={styles.input}
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
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
            <p>Loading complaints...</p>
          ) : filteredComplaints.length === 0 ? (
            <p>No complaints match your filters.</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
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
                      <th key={heading} style={styles.cell}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td style={styles.cell}>
                        <strong>{complaint.title || "Untitled"}</strong>
                        <p style={{ marginBottom: 0, maxWidth: "240px" }}>
                          {complaint.description || ""}
                        </p>
                      </td>

                      <td style={styles.cell}>
                        {complaint.user?.name || "Unknown"}
                        <br />
                        <small>{complaint.user?.email || ""}</small>
                      </td>

                      <td style={styles.cell}>
                        {formatDamageType(complaint.damageType)}
                      </td>

                      <td style={styles.cell}>
                        {complaint.severity || "—"}
                      </td>

                      <td style={styles.cell}>
                        {complaint.latitude}, {complaint.longitude}
                      </td>

                      <td style={styles.cell}>
                        {formatDate(complaint.createdAt)}
                      </td>

                      <td style={styles.cell}>
                        <select
                          style={styles.input}
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
                          aria-label={`Status for ${complaint.title}`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td style={styles.cell}>
                        <button
                          style={{
                            ...styles.button,
                            background: "#2563eb",
                            color: "#fff",
                          }}
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

        <section style={styles.panel}>
          <h2 style={{ marginTop: 0 }}>Complaints by Damage Type</h2>

          {!statistics?.byDamageType?.length ? (
            <p>No damage-type statistics available.</p>
          ) : (
            <ul>
              {statistics.byDamageType.map((item) => (
                <li key={item._id || "unknown"}>
                  {formatDamageType(item._id)}: {item.count}
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
