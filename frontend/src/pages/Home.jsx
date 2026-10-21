import Navbar from "../components/Navbar";
import "../styles/home.css";
import { Link, useNavigate } from "react-router-dom";
import heroImg from "../assets/hero-road.png";
import {
  FaCamera,
  FaMapMarkedAlt,
  FaRobot,
  FaClipboardList,
} from "react-icons/fa";

function Home() {
  const navigate = useNavigate();

  const handleReportClick = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      navigate("/register");
      return;
    }

    navigate("/report");
  };

  const handleComplaintsClick = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      navigate("/register");
      return;
    }

    navigate("/complaints");
  };

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-left">
          <h1>AI Powered Road Damage Detection</h1>

          <p>
            Detect potholes, road cracks and damaged roads using Artificial
            Intelligence and report them instantly with GPS location.
          </p>

          <div className="hero-buttons">
            <button
              type="button"
              className="btn-primary"
              onClick={handleReportClick}
            >
              Report Damage
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleComplaintsClick}
            >
              View Complaints
            </button>
          </div>
        </div>

        <div className="hero-right">
          <img src={heroImg} alt="Road Damage Monitoring" />
        </div>
      </section>

      <section className="stats">
        <div className="stat-box">
          <h2>1200+</h2>
          <p>Complaints Reported</p>
        </div>

        <div className="stat-box">
          <h2>850+</h2>
          <p>Resolved Cases</p>
        </div>

        <div className="stat-box">
          <h2>98%</h2>
          <p>AI Detection Accuracy</p>
        </div>

        <div className="stat-box">
          <h2>25+</h2>
          <p>Cities Covered</p>
        </div>
      </section>

      <section className="features">
        <div className="card">
          <FaCamera className="icon" />
          <h3>Upload Image</h3>
          <p>Upload a road image for AI analysis.</p>
        </div>

        <div className="card">
          <FaRobot className="icon" />
          <h3>AI Detection</h3>
          <p>Detect potholes and road cracks automatically.</p>
        </div>

        <div className="card">
          <FaMapMarkedAlt className="icon" />
          <h3>GPS Location</h3>
          <p>Capture the exact location of road damage.</p>
        </div>

        <div className="card">
          <FaClipboardList className="icon" />
          <h3>Complaint Tracking</h3>
          <p>Track complaint status in real time.</p>
        </div>
      </section>

      <footer className="footer">
        <h2>Track My Street</h2>

        <p>
          AI Powered Road Damage Detection & Smart Complaint Management System
        </p>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <a href="mailto:support@trackmystreet.example">Contact</a>
        </div>

        <p className="copyright">
          © 2026 Track My Street. All Rights Reserved.
        </p>
      </footer>
    </>
  );
}

export default Home;