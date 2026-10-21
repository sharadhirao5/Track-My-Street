
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token || !data.user || !data.user.role) {
        throw new Error("Incomplete authentication response.");
      }

      const validRoles = ["citizen", "admin", "authority"];

      if (!validRoles.includes(data.user.role)) {
        throw new Error("Your account has an unsupported role.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Admins go to the Admin Dashboard.
      if (data.user.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      // Authorities go to the Authority Dashboard.
      if (data.user.role === "authority") {
        navigate("/authority", { replace: true });
        return;
      }

      // Citizens return to their requested page when appropriate.
      // Otherwise, they go to the Home page.
      const requestedPath = location.state?.from;

      const allowedCitizenPaths = [
        "/dashboard",
        "/report",
        "/complaints",
        "/notifications",
        "/profile",
      ];

      if (
        typeof requestedPath === "string" &&
        allowedCitizenPaths.includes(requestedPath)
      ) {
        navigate(requestedPath, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message ||
          "Unable to connect to the server. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="login-container">
        <div className="login-card">
          <h2>Welcome Back</h2>

          {error && (
            <p className="login-message error" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "15px" }}>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => !loading && navigate("/register")}
              disabled={loading}
              style={{
                border: "none",
                background: "none",
                color: "#2563eb",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                padding: 0,
                fontSize: "inherit",
              }}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
