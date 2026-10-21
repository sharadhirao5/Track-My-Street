
import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API = "http://localhost:5000/api";
const IMAGE_SERVER = "http://localhost:5000";
const DEFAULT_CENTER = [20.5937, 78.9629];

const STATUSES = ["Pending", "In Progress", "Resolved"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];

function formatDamageType(value) {
  return String(value || "Unknown")
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

function getStatusColor(status) {
  switch (String(status || "").toLowerCase()) {
    case "resolved":
      return "#16a34a";
    case "in progress":
      return "#2563eb";
    default:
      return "#f97316";
  }
}

function FitMapToComplaints({ complaints }) {
  const map = useMap();

  useEffect(() => {
    if (complaints.length === 1) {
      map.setView(
        [
          Number(complaints[0].latitude),
          Number(complaints[0].longitude),
        ],
        14
      );
    } else if (complaints.length > 1) {
      const bounds = complaints.map((item) => [
        Number(item.latitude),
        Number(item.longitude),
      ]);

      map.fitBounds(bounds, {
        padding: [35, 35],
        maxZoom: 14,
      });
    }
  }, [complaints, map]);

  return null;
}

export default function ComplaintMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [damageTypeFilter, setDamageTypeFilter] = useState("All");

  useEffect(() => {
    const controller = new AbortController();

    async function loadComplaints() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Please log in to view the complaint map."
          );
        }

        const response = await fetch(
          `${API}/map/complaints`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            "Your session may have expired. Please log in again."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load map complaints."
          );
        }

        const list = Array.isArray(data.complaints)
          ? data.complaints
          : [];

        const validComplaints = list.filter((item) => {
          if (
            item.latitude == null ||
            item.longitude == null
          ) {
            return false;
          }

          const latitude = Number(item.latitude);
          const longitude = Number(item.longitude);

          return (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude) &&
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
          );
        });

        setComplaints(validComplaints);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to load the complaint map."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadComplaints();

    return () => controller.abort();
  }, []);

  const damageTypes = useMemo(() => {
    return [
      ...new Set(
        complaints.map((item) =>
          String(item.damageType || "Unknown")
        )
      ),
    ].sort();
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesStatus =
        statusFilter === "All" ||
        String(complaint.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesSeverity =
        severityFilter === "All" ||
        String(complaint.severity || "").toLowerCase() ===
          severityFilter.toLowerCase();

      const matchesDamageType =
        damageTypeFilter === "All" ||
        String(complaint.damageType || "Unknown") ===
          damageTypeFilter;

      return (
        matchesStatus &&
        matchesSeverity &&
        matchesDamageType
      );
    });
  }, [
    complaints,
    statusFilter,
    severityFilter,
    damageTypeFilter,
  ]);

  const center = useMemo(() => {
    if (filteredComplaints.length === 1) {
      return [
        Number(filteredComplaints[0].latitude),
        Number(filteredComplaints[0].longitude),
      ];
    }

    return DEFAULT_CENTER;
  }, [filteredComplaints]);

  function resetFilters() {
    setStatusFilter("All");
    setSeverityFilter("All");
    setDamageTypeFilter("All");
  }

  return (
    <section className="admin-panel road-map-panel">
      <div className="road-map-heading">
        <div>
          <h2 className="admin-panel-heading">
            Road Damage Map
          </h2>
          <p className="road-map-description">
            View reported road damage at its saved GPS location.
          </p>
        </div>

        <span className="road-map-count">
          {loading
            ? "Loading..."
            : `${filteredComplaints.length} of ${complaints.length} complaints`}
        </span>
      </div>

      <div className="road-map-legend">
        <span>
          <i className="map-legend-dot pending-dot" />
          Pending
        </span>
        <span>
          <i className="map-legend-dot progress-dot" />
          In Progress
        </span>
        <span>
          <i className="map-legend-dot resolved-dot" />
          Resolved
        </span>
      </div>

      <div className="road-map-filters">
        <div className="road-map-filter">
          <label htmlFor="map-status-filter">
            Complaint Status
          </label>
          <select
            id="map-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="road-map-filter">
          <label htmlFor="map-severity-filter">
            Severity
          </label>
          <select
            id="map-severity-filter"
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
          >
            <option value="All">All Severities</option>
            {SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </div>

        <div className="road-map-filter">
          <label htmlFor="map-damage-filter">
            Damage Type
          </label>
          <select
            id="map-damage-filter"
            value={damageTypeFilter}
            onChange={(event) =>
              setDamageTypeFilter(event.target.value)
            }
          >
            <option value="All">All Damage Types</option>
            {damageTypes.map((type) => (
              <option key={type} value={type}>
                {formatDamageType(type)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="road-map-reset"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        complaints.length === 0 && (
          <p className="road-map-empty">
            No complaints with valid GPS coordinates were found.
          </p>
        )}

      {!loading &&
        !error &&
        complaints.length > 0 &&
        filteredComplaints.length === 0 && (
          <p className="road-map-empty">
            No complaints match these filters. Try changing
            your selections or reset the filters.
          </p>
        )}

      <div className="road-map-container">
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom={true}
          className="road-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitMapToComplaints
            complaints={filteredComplaints}
          />

          {filteredComplaints.map((complaint, index) => {
            const latitude = Number(complaint.latitude);
            const longitude = Number(complaint.longitude);

            return (
              <CircleMarker
                key={
                  complaint.id ||
                  `${latitude}-${longitude}-${index}`
                }
                center={[latitude, longitude]}
                radius={9}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillColor: getStatusColor(complaint.status),
                  fillOpacity: 0.95,
                }}
              >
                <Popup>
                  <div className="road-map-popup">
                    <strong>
                      {complaint.title || "Road Damage Report"}
                    </strong>

                    <p>
                      <b>Damage:</b>{" "}
                      {formatDamageType(complaint.damageType)}
                    </p>

                    <p>
                      <b>Severity:</b>{" "}
                      {complaint.severity || "Unknown"}
                    </p>

                    <p>
                      <b>Status:</b>{" "}
                      {complaint.status || "Unknown"}
                    </p>

                    <p>
                      <b>Reported:</b>{" "}
                      {formatDate(complaint.createdAt)}
                    </p>

                    <p>
                      <b>GPS:</b>{" "}
                      {latitude.toFixed(5)},{" "}
                      {longitude.toFixed(5)}
                    </p>

                    {complaint.image && (
                      <a
                        href={
                          complaint.image.startsWith("http")
                            ? complaint.image
                            : `${IMAGE_SERVER}${
                                complaint.image.startsWith("/")
                                  ? ""
                                  : "/"
                              }${complaint.image}`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Complaint Image
                      </a>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <p className="road-map-footnote">
        Markers show saved complaint GPS coordinates. Marker
        colors represent complaint status. Filters update the
        displayed markers without deleting or changing reports.
      </p>
    </section>
  );
}