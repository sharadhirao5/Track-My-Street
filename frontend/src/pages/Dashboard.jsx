import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import { Link } from "react-router-dom";
import {
  FaCamera,
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaPlus,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Dashboard() {
  const complaints = [
    {
      id: "TMS001",
      type: "Pothole",
      location: "Main Road",
      date: "Aug 11, 2026",
      status: "Pending",
    },
    {
      id: "TMS002",
      type: "Road Crack",
      location: "College Road",
      date: "Aug 10, 2026",
      status: "In Progress",
    },
    {
      id: "TMS003",
      type: "Waterlogging",
      location: "Market Road",
      date: "Aug 08, 2026",
      status: "Resolved",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="dashboard">

        {/* Welcome Section */}
        <section className="dashboard-header">
          <div>
            <p className="dashboard-label">CITIZEN DASHBOARD</p>

            <h1>Welcome Back! 👋</h1>

            <p>
              Monitor your reported road damage and track complaint updates.
            </p>
          </div>

          <Link to="/report" className="dashboard-report-btn">
            <FaPlus />
            Report Damage
          </Link>
        </section>


        {/* Statistics */}
        <section className="dashboard-stats">

          <div className="stat-card">
            <div className="stat-icon blue">
              <FaClipboardList />
            </div>

            <div>
              <h2>12</h2>
              <p>Total Reports</p>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon orange">
              <FaClock />
            </div>

            <div>
              <h2>5</h2>
              <p>Pending Reports</p>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon green">
              <FaCheckCircle />
            </div>

            <div>
              <h2>7</h2>
              <p>Resolved Reports</p>
            </div>
          </div>

        </section>


        {/* Quick Actions */}
        <section className="quick-actions">

          <h2>Quick Actions</h2>

          <div className="action-grid">

            {/* Report Damage */}
            <Link to="/report" className="action-card">
              <FaCamera className="action-icon" />

              <div>
                <h3>Report Road Damage</h3>

                <p>
                  Upload an image and report a damaged road.
                </p>
              </div>
            </Link>


            {/* My Complaints */}
            <Link
              to="/complaints"
              className="action-card"
            >
              <FaClipboardList className="action-icon" />

              <div>
                <h3>View My Complaints</h3>

                <p>
                  Track the status of your submitted complaints.
                </p>
              </div>
            </Link>

          </div>

        </section>


        {/* Recent Complaints */}
        <section className="complaints-section">

          <div className="section-heading">

            <div>
              <h2>Recent Complaints</h2>

              <p>
                Your latest reported road damage.
              </p>
            </div>

            <span className="complaint-count">
              {complaints.length} Recent
            </span>

          </div>


          <div className="complaints-table">

            {/* Table Header */}
            <div className="table-header">
              <span>Complaint</span>
              <span>Location</span>
              <span>Date</span>
              <span>Status</span>
            </div>


            {/* Complaint Rows */}
            {complaints.map((complaint) => (

              <div
                className="complaint-row"
                key={complaint.id}
              >

                <div className="complaint-info">

                  <div className="complaint-icon">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <h3>{complaint.type}</h3>

                    <p>{complaint.id}</p>
                  </div>

                </div>


                <span>
                  {complaint.location}
                </span>


                <span>
                  {complaint.date}
                </span>


                <span
                  className={`status ${complaint.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {complaint.status}
                </span>

              </div>

            ))}

          </div>

        </section>

      </main>
    </>
  );
}

export default Dashboard;