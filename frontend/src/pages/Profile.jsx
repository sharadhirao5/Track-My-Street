import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Error reading user information:",
          error
        );
      }
    }
  }, []);

  // --------------------------------
  // LOGOUT
  // --------------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // --------------------------------
  // NO USER
  // --------------------------------
  if (!user) {
    return (
      <>
        <Navbar />

        <div
          style={{
            maxWidth: "700px",
            margin: "60px auto",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h2>
            Please login to view your profile.
          </h2>

          <button
            onClick={() => navigate("/login")}
            style={{
              marginTop: "20px",
              padding: "12px 25px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "white",
              cursor: "pointer",
            }}
          >
            Go to Login
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="dashboard">

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <h1>My Profile</h1>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#6b7280",
              color: "white",
              cursor: "pointer",
            }}
          >
            ← Dashboard
          </button>
        </div>

        {/* PROFILE CARD */}
        <div
          style={{
            maxWidth: "650px",
            margin: "0 auto",
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "15px",
            boxShadow:
              "0 4px 15px rgba(0, 0, 0, 0.1)",
          }}
        >

          {/* USER ICON */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                fontSize: "40px",
              }}
            >
              👤
            </div>

            <h2
              style={{
                marginTop: "15px",
              }}
            >
              {user.name || "User"}
            </h2>
          </div>

          {/* USER DETAILS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >

            {/* NAME */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <strong>
                Full Name
              </strong>

              <p
                style={{
                  marginTop: "5px",
                }}
              >
                {user.name || "Not available"}
              </p>
            </div>

            {/* EMAIL */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <strong>
                Email
              </strong>

              <p
                style={{
                  marginTop: "5px",
                }}
              >
                {user.email || "Not available"}
              </p>
            </div>

            {/* PHONE */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <strong>
                Phone
              </strong>

              <p
                style={{
                  marginTop: "5px",
                }}
              >
                {user.phone || "Not provided"}
              </p>
            </div>

            {/* ROLE */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <strong>
                Account Type
              </strong>

              <p
                style={{
                  marginTop: "5px",
                  textTransform: "capitalize",
                }}
              >
                {user.role || "Citizen"}
              </p>
            </div>

          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              marginTop: "30px",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#dc2626",
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Logout
          </button>

        </div>
      </div>
    </>
  );
}

export default Profile;