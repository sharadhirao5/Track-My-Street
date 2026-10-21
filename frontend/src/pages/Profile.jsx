import Navbar from "../components/Navbar";
import "../styles/profile.css";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaEdit,
} from "react-icons/fa";

function Profile() {
  const user = {
    name: "Vaishnavi Vinod",
    email: "vaishnavi@example.com",
    phone: "+91 9876543210",
  };

  return (
    <>
      <Navbar />

      <main className="profile-page">

        <section className="profile-header">
          <p className="profile-label">MY PROFILE</p>

          <h1>Account Profile</h1>

          <p>
            Manage your Track My Street account information.
          </p>
        </section>


        <section className="profile-content">

          <div className="profile-card">

            <div className="profile-avatar">
              <FaUser />
            </div>

            <h2>{user.name}</h2>

            <p className="profile-role">
              Citizen
            </p>

            <button className="edit-profile-btn">
              <FaEdit />
              Edit Profile
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
                <strong>{user.name}</strong>
              </div>
            </div>


            <div className="detail-item">
              <div className="detail-icon">
                <FaEnvelope />
              </div>

              <div>
                <span>Email Address</span>
                <strong>{user.email}</strong>
              </div>
            </div>


            <div className="detail-item">
              <div className="detail-icon">
                <FaPhone />
              </div>

              <div>
                <span>Phone Number</span>
                <strong>{user.phone}</strong>
              </div>
            </div>

          </div>

        </section>


        <section className="profile-statistics">

          <div className="profile-stat">
            <FaClipboardList />

            <div>
              <h2>12</h2>
              <p>Total Complaints</p>
            </div>
          </div>


          <div className="profile-stat">
            <FaCheckCircle />

            <div>
              <h2>7</h2>
              <p>Resolved</p>
            </div>
          </div>


          <div className="profile-stat">
            <FaClock />

            <div>
              <h2>5</h2>
              <p>Pending</p>
            </div>
          </div>

        </section>

      </main>
    </>
  );
}

export default Profile;