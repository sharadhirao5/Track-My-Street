import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import {
  FaCamera,
  FaClipboardList,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";

function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="dashboard">
        <h1>Citizen Dashboard</h1>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <FaCamera className="dashboard-icon" />
            <h3>Report Damage</h3>
            <p>Upload images of damaged roads.</p>
          </div>

          <div className="dashboard-card">
            <FaClipboardList className="dashboard-icon" />
            <h3>My Complaints</h3>
            <p>View submitted complaints.</p>
          </div>

          <div className="dashboard-card">
            <FaBell className="dashboard-icon" />
            <h3>Notifications</h3>
            <p>Track complaint updates.</p>
          </div>

          <div className="dashboard-card">
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