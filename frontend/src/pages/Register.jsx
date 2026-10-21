
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/register.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "citizen",
  adminRegistrationSecret: "",
};

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      formData.role === "admin" &&
      !formData.adminRegistrationSecret.trim()
    ) {
      setError("Admin authorization code is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
            role: formData.role,
            ...(formData.role === "admin"
              ? {
                  adminRegistrationSecret:
                    formData.adminRegistrationSecret,
                }
              : {}),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );
      setFormData(initialForm);

      window.setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
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

      <div className="register-container">
        <div className="register-card">
          <h2>Create Account</h2>

          {error && (
            <p className="register-message error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="register-message success" role="status">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <label htmlFor="role">Register As</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="citizen">Citizen</option>
              <option value="admin">Admin</option>
            </select>

            {formData.role === "admin" && (
              <>
                <label htmlFor="adminRegistrationSecret">
                  Admin Authorization Code
                </label>
                <input
                  id="adminRegistrationSecret"
                  type="password"
                  name="adminRegistrationSecret"
                  placeholder="Enter authorization code"
                  value={formData.adminRegistrationSecret}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                <p>
                  Administrator registration requires a valid
                  server-configured authorization code.
                </p>
              </>
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "15px" }}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => !loading && navigate("/login")}
              disabled={loading}
              style={{
                border: "none",
                background: "none",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
