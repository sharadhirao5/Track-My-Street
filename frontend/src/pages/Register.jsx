import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/register.css";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleRegister = (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setMessage("Please fill in all the fields.");
      setMessageType("error");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }
    if (phone.length >10) {
      setMessage("Phone number must be 10 digits.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setMessage("Account created successfully!");
    setMessageType("success");

    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <>
      <Navbar />

      <div className="register-container">
        <div className="register-card">
          <h2>Create Account</h2>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />

            {message && (
              <p className={`register-message ${messageType}`}>
                {message}
              </p>
            )}

            <button type="submit">Create Account</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;