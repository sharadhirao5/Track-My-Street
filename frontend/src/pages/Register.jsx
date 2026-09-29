import Navbar from "../components/Navbar";
import "../styles/register.css";

function Register() {
  return (
    <>
      <Navbar />

      <div className="register-container">
        <div className="register-card">

          <h2>Create Account</h2>

          <input
            type="text"
            placeholder="Full Name"
          />

          <input
            type="email"
            placeholder="Email"
          />

          <input
            type="text"
            placeholder="Phone Number"
          />

          <input
            type="password"
            placeholder="Password"
          />

          <input
            type="password"
            placeholder="Confirm Password"
          />

          <button>Create Account</button>

        </div>
      </div>
    </>
  );
}

export default Register;