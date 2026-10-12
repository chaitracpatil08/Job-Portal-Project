import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "jobseeker", // "jobseeker" or "employer"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null); // When set, triggers success modal

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validations
    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      if (response.success) {
        // Show success modal with user details
        setSuccessData({
          fullName: response.user?.fullName || formData.fullName,
          email: response.user?.email || formData.email,
          role: response.user?.role || formData.role,
        });
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💼</div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join JobPortal and find your dream job
        </p>

        {/* Role Selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${formData.role === "jobseeker" ? "active" : ""}`}
            onClick={() => handleRoleSelect("jobseeker")}
          >
            👤 Candidate
          </button>
          <button
            type="button"
            className={`role-btn ${formData.role === "employer" ? "active" : ""}`}
            onClick={() => handleRoleSelect("employer")}
          >
            🏢 Employer
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="switch-auth">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </div>

      {/* REGISTRATION SUCCESS POPUP MODAL (Requirement 14) */}
      {successData && (
        <div className="modal-overlay">
          <div className="success-modal-card">
            <div className="success-icon-badge">✓</div>
            <h2>Registration successful!</h2>
            <p className="success-modal-message">
              Your account has been created successfully in MongoDB.
            </p>

            <div className="success-user-box">
              <div>
                <strong>Name:</strong> <span>{successData.fullName}</span>
              </div>
              <div>
                <strong>Email:</strong> <span>{successData.email}</span>
              </div>
              <div>
                <strong>Role:</strong>{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {successData.role === "jobseeker" ? "Candidate" : successData.role}
                </span>
              </div>
            </div>

            <button
              className="modal-proceed-btn"
              onClick={() => navigate("/login")}
            >
              Proceed to Login →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
