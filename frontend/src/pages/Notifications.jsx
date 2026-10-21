import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import "../styles/pageButtons.css";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/notifications",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Notifications response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications."
        );
      }

      const notificationList = Array.isArray(data)
        ? data
        : data.notifications || [];

      setNotifications(notificationList);
    } catch (err) {
      console.error(
        "Error fetching notifications:",
        err
      );

      setError(
        err.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "Mark notification response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Error marking notification:",
        err
      );
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "Mark all notifications response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notifications as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(
        "Error marking all notifications:",
        err
      );
    }
  };

  // =====================================================
  // NOTIFICATION ICON
  // =====================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Complaint Created":
        return "📝";

      case "Status Updated":
        return "🔄";

      case "Complaint Resolved":
        return "✅";

      case "AI Detection":
        return "🤖";

      default:
        return "🔔";
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <>
      <Navbar />

      <div className="dashboard">

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "30px",
          }}
        >

          {/* TITLE */}

          <div>

            <h1
              style={{
                marginBottom: "6px",
              }}
            >
              Notifications
            </h1>

            {!loading && (
              <p
                style={{
                  color: "#64748b",
                  margin: 0,
                  fontSize: "15px",
                }}
              >
                Total notifications:{" "}
                <strong
                  style={{
                    color: "#0f172a",
                  }}
                >
                  {notifications.length}
                </strong>
              </p>
            )}

          </div>


          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="page-actions">

            {/* DASHBOARD */}

            <button
              type="button"
              className="page-action-btn page-action-btn--dark"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <span className="page-action-icon">
                ←
              </span>

              Dashboard
            </button>


            {/* MARK ALL READ */}

            <button
              type="button"
              className="page-action-btn page-action-btn--primary"
              onClick={markAllAsRead}
              disabled={
                notifications.length === 0
              }
            >
              <span className="page-action-icon">
                ✓
              </span>

              Mark All Read
            </button>


            {/* REFRESH */}

            <button
              type="button"
              className="page-action-btn page-action-btn--secondary"
              onClick={fetchNotifications}
            >
              <span className="page-action-icon">
                ↻
              </span>

              Refresh
            </button>

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
              color: "#475569",
            }}
          >
            <h3>
              Loading notifications...
            </h3>
          </div>
        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "24px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >

            <h3>
              Unable to load notifications
            </h3>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="page-action-btn page-action-btn--danger"
              onClick={fetchNotifications}
              style={{
                marginTop: "10px",
              }}
            >
              Try Again
            </button>

          </div>
        )}


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          !error &&
          notifications.length === 0 && (

            <div
              style={{
                background:
                  "linear-gradient(135deg, #f8fafc 0%, #eef5ff 100%)",

                border:
                  "1px solid #dbeafe",

                padding:
                  "55px 25px",

                borderRadius:
                  "14px",

                textAlign:
                  "center",

                boxShadow:
                  "0 4px 15px rgba(15, 23, 42, 0.05)",
              }}
            >

              <div
                style={{
                  fontSize: "42px",
                  marginBottom: "10px",
                }}
              >
                🔔
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0f172a",
                }}
              >
                No Notifications
              </h2>

              <p
                style={{
                  color: "#64748b",
                  marginTop: "10px",
                }}
              >
                You don't have any notifications yet.
              </p>

            </div>

          )}


        {/* =================================================
            NOTIFICATIONS LIST
        ================================================= */}

        {!loading &&
          !error &&
          notifications.length > 0 && (

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >

              {notifications.map(
                (notification) => (

                  <div
                    key={notification._id}
                    onClick={() =>
                      !notification.isRead &&
                      markAsRead(
                        notification._id
                      )
                    }
                    style={{
                      padding: "20px",
                      borderRadius: "14px",

                      backgroundColor:
                        notification.isRead
                          ? "#ffffff"
                          : "#eff6ff",

                      border:
                        notification.isRead
                          ? "1px solid #e2e8f0"
                          : "1px solid #bfdbfe",

                      boxShadow:
                        "0 3px 10px rgba(15, 23, 42, 0.06)",

                      cursor:
                        notification.isRead
                          ? "default"
                          : "pointer",

                      transition:
                        "all 0.2s ease",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "15px",
                      }}
                    >

                      {/* ICON */}

                      <div
                        style={{
                          fontSize: "28px",
                          width: "42px",
                          height: "42px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#ffffff",
                          borderRadius: "10px",
                          flexShrink: 0,
                        }}
                      >
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>


                      {/* CONTENT */}

                      <div
                        style={{
                          flex: 1,
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >

                          <h3
                            style={{
                              margin: 0,
                              color: "#0f172a",
                            }}
                          >
                            {notification.title ||
                              "Notification"}
                          </h3>


                          {!notification.isRead && (
                            <span
                              style={{
                                background:
                                  "#2563eb",
                                color:
                                  "#ffffff",
                                padding:
                                  "5px 10px",
                                borderRadius:
                                  "20px",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  "700",
                                letterSpacing:
                                  "0.5px",
                              }}
                            >
                              NEW
                            </span>
                          )}

                        </div>


                        <p
                          style={{
                            marginTop: "8px",
                            color: "#475569",
                            lineHeight: "1.6",
                          }}
                        >
                          {notification.message}
                        </p>


                        {notification.type && (
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#64748b",
                              marginBottom: "5px",
                            }}
                          >
                            Type:{" "}
                            {notification.type}
                          </p>
                        )}


                        <p
                          style={{
                            fontSize: "13px",
                            color: "#94a3b8",
                            margin: 0,
                          }}
                        >
                          {notification.createdAt
                            ? new Date(
                                notification.createdAt
                              ).toLocaleString()
                            : "Date unavailable"}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

      </div>
    </>
  );
}

export default Notifications;