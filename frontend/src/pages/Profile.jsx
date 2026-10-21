
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaSignOutAlt,
} from "react-icons/fa";
import "../styles/profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Error reading user information:", error);
      localStorage.removeItem("user");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  if (!user) {
    return (
      <>
        <Navbar />

        <main className="profile-page">
          <section className="profile-header">
            <p className="profile-label">MY PROFILE</p>
            <h1>Account Profile</h1>
            <p>Please log in to view your account information.</p>
          </section>

          <div className="profile-content">
            <Link to="/login" className="edit-profile-btn">
              Go to Login
            </Link>
          </div>
        </main>
      </>
    );
  }

  const name = user.name || user.fullName || "User";
  const email = user.email || "Not provided";
  const phone = user.phone || user.phoneNumber || "Not provided";

  const role = user.role
    ? String(user.role).charAt(0).toUpperCase() +
      String(user.role).slice(1)
    : "Citizen";

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <section className="profile-header">
          <p className="profile-label">MY PROFILE</p>
          <h1>Account Profile</h1>
          <p>Manage your Track My Street account information.</p>
        </section>

        <section className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar">
              <FaUser />
            </div>

            <h2>{name}</h2>
            <p className="profile-role">{role}</p>

            <button
              type="button"
              className="edit-profile-btn"
              onClick={() =>
                window.alert(
                  "Profile editing is not available yet."
                )
              }
            >
              <FaEdit /> Edit Profile
            </button>

            <button
              type="button"
              className="edit-profile-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Log Out
            </button>
          </div>

          <div className="profile-details">
            <h2>Personal Information</h2>

            <div className="detail-item">
              <div className="detail-icon">
                <FaUser />
              </div>

              <div>
                <span>Full Name</span>
                <strong>{name}</strong>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaEnvelope />
              </div>

              <div>
                <span>Email Address</span>
                <strong>{email}</strong>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaPhone />
              </div>

              <div>
                <span>Phone Number</span>
                <strong>{phone}</strong>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaUser />
              </div>

              <div>
                <span>Account Role</span>
                <strong>{role}</strong>
              </div>
            </div>

            <div className="profile-quick-links">
              <h2>My Activity</h2>

              <Link to="/complaints">
                <FaClipboardList /> My Complaints
              </Link>

              <Link to="/notifications">
                <FaClock /> Notifications
              </Link>

              <Link to="/dashboard">
                <FaCheckCircle /> Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Profile;
