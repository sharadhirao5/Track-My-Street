
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

const API_URL = "http://localhost:5000";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setNotifications([]);
        setError("Please log in to view your notifications.");
        return;
      }

      const response = await fetch(`${API_URL}/api/notifications`, {
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
          state: { from: "/notifications" },
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notifications.");
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.notifications)
          ? data.notifications
          : Array.isArray(data.data)
            ? data.data
            : [];

      setNotifications(list);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notification) => {
    const id = notification._id || notification.id;

    if (!id || notification.isRead) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not mark notification as read.");
      }

      setNotifications((previous) =>
        previous.map((item) =>
          (item._id || item.id) === id
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(err.message || "Could not update the notification.");
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const unread = notifications.filter((item) => !item.isRead);

    if (unread.length === 0) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update notifications.");
      }

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(err.message || "Could not update notifications.");
    }
  };

  const getNotificationIcon = (notification) => {
    const type = String(
      notification.type || notification.title || notification.message || ""
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
    notification.title ||
    notification.type ||
    "Complaint Update";

  const getNotificationMessage = (notification) =>
    notification.message ||
    notification.description ||
    "There is an update regarding your complaint.";

  const formatDate = (date) => {
    if (!date) return "Time unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleString();
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <>
      <Navbar />

      <main className="notifications-page">
        <section className="notifications-header">
          <div>
            <p className="complaints-label">UPDATES</p>
            <h1>Notifications</h1>
            <p>Stay informed about your reported road damage complaints.</p>

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
              disabled={loading || unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>
        </section>

        {error && (
          <div className="notification-message notification-error" role="alert">
            <FaExclamationCircle />
            <span>{error}</span>

            {!localStorage.getItem("token") && (
              <Link to="/login">Log in</Link>
            )}

            <button type="button" onClick={() => fetchNotifications()}>
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

              return (
                <article
                  key={id}
                  className={`notification-card ${
                    notification.isRead ? "read" : "unread"
                  }`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification)}
                  </div>

                  <div className="notification-content">
                    <div className="notification-card-heading">
                      <h2>{getNotificationTitle(notification)}</h2>

                      {!notification.isRead && (
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

                    {!notification.isRead && (notification._id || notification.id) && (
                      <button
                        type="button"
                        className="notification-read-button"
                        onClick={() => markAsRead(notification)}
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
