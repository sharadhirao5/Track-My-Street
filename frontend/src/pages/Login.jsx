import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      setMessageType("error");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    setMessage("Login successful!");
    setMessageType("success");
  };

  return (
    <>
      <Navbar />

      <div className="login-container">
        <div className="login-card">
          <h2>Welcome Back</h2>

          <p>Login to Track My Street</p>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {message && (
              <p className={`login-message ${messageType}`}>
                {message}
              </p>
            )}

            <button type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;