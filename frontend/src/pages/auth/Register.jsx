import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          💼
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join JobPortal and find your dream job
        </p>

        <form>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
            />
          </div>

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
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" className="auth-btn">
            Create Account
          </button>

        </form>

        <p className="switch-auth">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </div>

    </div>
  );
}

export default Register;
