import Navbar from "../components/Navbar";
import "../styles/notifications.css";
import {
  FaCheckCircle,
  FaClock,
  FaRobot,
  FaTools,
} from "react-icons/fa";

function Notifications() {
  const notifications = [
    {
      id: 1,
      icon: <FaCheckCircle />,
      title: "Complaint Submitted",
      message:
        "Your pothole complaint TMS001 has been successfully submitted.",
      time: "Today, 10:30 AM",
      type: "success",
    },
    {
      id: 2,
      icon: <FaRobot />,
      title: "AI Analysis Completed",
      message:
        "AI detected a pothole with 94.7% confidence in your uploaded image.",
      time: "Today, 10:31 AM",
      type: "ai",
    },
    {
      id: 3,
      icon: <FaTools />,
      title: "Complaint Assigned",
      message:
        "Your complaint has been assigned for inspection by the responsible authority.",
      time: "Today, 11:15 AM",
      type: "assigned",
    },
    {
      id: 4,
      icon: <FaClock />,
      title: "Complaint Status Updated",
      message:
        "Your road damage complaint TMS002 is currently in progress.",
      time: "Yesterday, 4:20 PM",
      type: "pending",
    },
    {
      id: 5,
      icon: <FaCheckCircle />,
      title: "Road Damage Resolved",
      message:
        "The reported waterlogging issue in Market Road has been marked as resolved.",
      time: "Aug 08, 2026",
      type: "resolved",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="notifications-page">

        <section className="notifications-header">
          <div>
            <p className="notifications-label">UPDATES</p>

            <h1>Notifications</h1>

            <p>
              Stay updated about your reported road damage complaints.
            </p>
          </div>

          <span className="notification-count">
            {notifications.length} Updates
          </span>
        </section>


        <section className="notifications-list">

          {notifications.map((notification) => (
            <div
              className="notification-card"
              key={notification.id}
            >

              <div
                className={`notification-icon ${notification.type}`}
              >
                {notification.icon}
              </div>


              <div className="notification-content">

                <div className="notification-title-row">
                  <h2>{notification.title}</h2>

                  <span className="notification-time">
                    {notification.time}
                  </span>
                </div>

                <p>{notification.message}</p>

              </div>

            </div>
          ))}

        </section>

      </main>
    </>
  );
}

export default Notifications;