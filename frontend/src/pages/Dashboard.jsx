import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import {
  FaCamera,
  FaClipboardList,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <h1>Citizen Dashboard</h1>

        <div className="dashboard-cards">

          {/* Report Damage */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/report")}
            style={{ cursor: "pointer" }}
          >
            <FaCamera className="dashboard-icon" />
            <h3>Report Damage</h3>
            <p>Upload images of damaged roads.</p>
          </div>

          {/* My Complaints */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/complaints")}
            style={{ cursor: "pointer" }}
          >
            <FaClipboardList className="dashboard-icon" />
            <h3>My Complaints</h3>
            <p>View submitted complaints.</p>
          </div>

          {/* Notifications */}
          <div
  className="dashboard-card"
  onClick={() => navigate("/notifications")}
  style={{ cursor: "pointer" }}
>
  <FaBell className="dashboard-icon" />

  <h3>Notifications</h3>

  <p>Track complaint updates.</p>
</div>

          {/* Profile */}
          <div
  className="dashboard-card"
  onClick={() => navigate("/profile")}
  style={{ cursor: "pointer" }}
>
  <FaUserCircle className="dashboard-icon" />

  <h3>Profile</h3>

  <p>Manage your account.</p>
</div>

        </div>
      </div>
    </>
  );
}

export default Dashboard;