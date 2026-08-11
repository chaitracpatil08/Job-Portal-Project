import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          💼
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to continue to JobPortal
        </p>

        <form>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="auth-btn">
            Login
          </button>

        </form>

        <p className="switch-auth">
          Don't have an account?
          <Link to="/register"> Register</Link>
        </p>

      </div>

    </div>
  );
}

export default Login;
