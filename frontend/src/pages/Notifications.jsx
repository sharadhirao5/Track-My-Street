
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FaCheckCircle,
  FaClock,
  FaRobot,
  FaTools,
  FaBell,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import "../styles/pageButtons.css";
import "../styles/notifications.css";
import "../styles/navbar.css";

const API_URL = "http://localhost:5000/api";

// Safely read and validate API responses.
async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  let data = {};

  if (contentType.includes("application/json")) {
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("The server returned invalid JSON.");
    }
  } else {
    const preview = text.slice(0, 160).replace(/\s+/g, " ");
    const error = new Error(
      `API returned non-JSON data (${response.status}) at ${response.url}. ${preview}`
    );
    error.status = response.status;
    throw error;
  }

  if (response.status === 401 || response.status === 403) {
    const error = new Error(
      data.message ||
        (response.status === 401
          ? "Your session has expired. Please log in again."
          : "You do not have permission to perform this action.")
    );

    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status}).`
    );
  }

  return data;
}

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleRequestError = useCallback(
    (err) => {
      console.error("Notifications API error:", err);

      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          state: { from: "/notifications" },
          replace: true,
        });
        return;
      }

      setError(err.message || "Unable to complete the request.");
    },
    [navigate]
  );

  const fetchNotifications = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setNotifications([]);
          setError("Please log in to view your notifications.");
          return;
        }

        const response = await fetch(`${API_URL}/notifications`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await readApiResponse(response);

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.notifications)
            ? data.notifications
            : Array.isArray(data.data)
              ? data.data
              : [];

        setNotifications(list);
      } catch (err) {
        handleRequestError(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [handleRequestError]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notification) => {
    const id = notification._id || notification.id;

    if (!id || notification.isRead || actionLoading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: { from: "/notifications" },
      });
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/notifications/${encodeURIComponent(id)}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      await readApiResponse(response);

      setNotifications((previous) =>
        previous.map((item) =>
          (item._id || item.id) === id
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (err) {
      handleRequestError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: { from: "/notifications" },
      });
      return;
    }

    if (
      actionLoading ||
      !notifications.some((item) => !item.isRead)
    ) {
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      await readApiResponse(response);

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );
    } catch (err) {
      handleRequestError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getNotificationIcon = (notification) => {
    const type = String(
      notification.type ||
        notification.title ||
        notification.message ||
        ""
    ).toLowerCase();

    if (type.includes("ai") || type.includes("detect")) {
      return <FaRobot />;
    }

    if (
      type.includes("resolv") ||
      type.includes("success") ||
      type.includes("complete")
    ) {
      return <FaCheckCircle />;
    }

    if (
      type.includes("assign") ||
      type.includes("authority") ||
      type.includes("progress")
    ) {
      return <FaTools />;
    }

    if (type.includes("pending") || type.includes("clock")) {
      return <FaClock />;
    }

    return <FaBell />;
  };

  const getNotificationTitle = (notification) =>
    notification.title || notification.type || "Complaint Update";

  const getNotificationMessage = (notification) =>
    notification.message ||
    notification.description ||
    "There is an update regarding your complaint.";

  const formatDate = (date) => {
    if (!date) return "Time unavailable";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? String(date)
      : parsedDate.toLocaleString();
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <>
      <Navbar />

      <div className="back-button-wrapper">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      <main className="notifications-page">
        <section className="notifications-header">
          <div>
            <p className="complaints-label">UPDATES</p>
            <h1>Notifications</h1>
            <p>
              Stay informed about your reported road damage complaints.
            </p>

            {!loading && !error && (
              <p>
                Unread notifications: <strong>{unreadCount}</strong>
              </p>
            )}
          </div>

          <div className="notification-actions">
            <button
              type="button"
              className="page-action-button"
              onClick={() => fetchNotifications(true)}
              disabled={loading || refreshing}
            >
              <FaSyncAlt />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              className="page-action-button"
              onClick={markAllAsRead}
              disabled={
                loading || unreadCount === 0 || actionLoading
              }
            >
              {actionLoading ? "Updating..." : "Mark all as read"}
            </button>
          </div>
        </section>

        {error && (
          <div
            className="notification-message notification-error"
            role="alert"
          >
            <FaExclamationCircle />
            <span>{error}</span>

            {!localStorage.getItem("token") && (
              <Link to="/login">Log in</Link>
            )}

            <button
              type="button"
              onClick={() => fetchNotifications()}
              disabled={loading}
            >
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="notification-message" role="status">
            Loading notifications...
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="notification-empty">
            <FaBell />
            <h2>You're all caught up!</h2>
            <p>New complaint updates will appear here.</p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <section className="notifications-list">
            {notifications.map((notification, index) => {
              const id = notification._id || notification.id || index;
              const isRead = Boolean(notification.isRead);

              return (
                <article
                  key={id}
                  className={`notification-card ${
                    isRead ? "read" : "unread"
                  }`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification)}
                  </div>

                  <div className="notification-content">
                    <div className="notification-card-heading">
                      <h2>{getNotificationTitle(notification)}</h2>

                      {!isRead && (
                        <span className="notification-unread-label">
                          New
                        </span>
                      )}
                    </div>

                    <p>{getNotificationMessage(notification)}</p>

                    <span className="notification-time">
                      <FaClock />{" "}
                      {formatDate(
                        notification.createdAt ||
                          notification.timestamp ||
                          notification.time
                      )}
                    </span>

                    {!isRead &&
                      (notification._id || notification.id) && (
                        <button
                          type="button"
                          className="notification-read-button"
                          onClick={() => markAsRead(notification)}
                          disabled={actionLoading}
                        >
                          Mark as read
                        </button>
                      )}
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

export default Notifications;
