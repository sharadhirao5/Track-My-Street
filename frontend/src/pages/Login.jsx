import Navbar from "../components/Navbar";
import "../styles/login.css";

function Login() {
  return (
    <>
      <Navbar />

      <div className="login-container">
        <div className="login-card">

          <h2>Welcome Back</h2>

          <p>Login to Track My Street</p>

          <input
            type="email"
            placeholder="Enter Email"
          />

          <input
            type="password"
            placeholder="Enter Password"
          />

          <button>
            Login
          </button>

        </div>
      </div>
    </>
  );
}

export default Login;