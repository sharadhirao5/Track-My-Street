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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // A citizen who tried to open a protected page goes there after login.
      if (
        data.user.role === "citizen" &&
        location.state?.from === "/report"
      ) {
        navigate("/report", { replace: true });
        return;
      }

      switch (data.user.role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;

        case "authority":
          navigate("/authority", { replace: true });
          break;

        default:
          navigate("/dashboard", { replace: true });
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
          <h1>Login</h1>

          {error && (
            <div
              role="alert"
              style={{
                color: "#b00020",
                backgroundColor: "#ffe6e6",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />

            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
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
            <span
              onClick={() => navigate("/register")}
              style={{
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;