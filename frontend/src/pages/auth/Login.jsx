import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import JobPortalLogo from "../../components/JobPortalLogo";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth();

  const roleFromUrl = searchParams.get("role");
  const [loginRole, setLoginRole] = useState(
    roleFromUrl === "employer" ? "employer" : "jobseeker"
  );

  useEffect(() => {
    if (roleFromUrl === "employer") {
      setLoginRole("employer");
    } else if (roleFromUrl === "candidate" || roleFromUrl === "jobseeker") {
      setLoginRole("jobseeker");
    }
  }, [roleFromUrl]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSwitch = (newRole) => {
    setLoginRole(newRole);
    setError("");
    setSearchParams({ role: newRole === "employer" ? "employer" : "candidate" });
  };

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setError("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() && !formData.password) {
      setError("Please enter your email address and password.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await login(formData.email.trim(), formData.password);

      if (response.success && response.user) {
        // Redirect according to role or previous intended location
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else if (response.user.role === "employer") {
          navigate("/employer/dashboard", { replace: true });
        } else if (response.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        setError(response.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-center">
          <JobPortalLogo size="lg" showTagline={true} />
        </div>

        <h1>{loginRole === "employer" ? "Employer Login" : "Candidate Login"}</h1>

        <p className="auth-subtitle">
          {loginRole === "employer"
            ? "Sign in to manage company jobs and review candidates"
            : "Sign in to apply for jobs and track your applications"}
        </p>

        {/* Separate Options for Employer and Candidate Login */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${loginRole === "jobseeker" ? "active" : ""}`}
            onClick={() => handleRoleSwitch("jobseeker")}
          >
            👤 Candidate Login
          </button>
          <button
            type="button"
            className={`role-btn ${loginRole === "employer" ? "active" : ""}`}
            onClick={() => handleRoleSwitch("employer")}
          >
            🏢 Employer Login
          </button>
        </div>

        {/* Quick Demo Helper Hint */}
        <div className="demo-hint-box">
          <div className="demo-hint-header">
            <strong>
              {loginRole === "employer" ? "🏢 Demo Employer Account:" : "👤 Demo Candidate Account:"}
            </strong>
            <button
              type="button"
              className="demo-hint-btn"
              onClick={() =>
                loginRole === "employer"
                  ? handleQuickFill("employer@example.com", "password123")
                  : handleQuickFill("jobseeker@example.com", "password123")
              }
            >
              Fill Credentials
            </button>
          </div>
          <div>
            <code>
              {loginRole === "employer"
                ? "employer@example.com / password123"
                : "jobseeker@example.com / password123"}
            </code>
          </div>
        </div>

        {error && (
          <div className="auth-error-alert" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              {loginRole === "employer" ? "Company / Employer Email" : "Candidate Email Address"}
            </label>

            <input
              type="email"
              name="email"
              placeholder={
                loginRole === "employer"
                  ? "Enter company email (e.g. employer@example.com)"
                  : "Enter your candidate email (e.g. jobseeker@example.com)"
              }
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="forgot-password">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset instructions will be sent to your registered email.");
              }}
            >
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading
              ? "Signing In..."
              : loginRole === "employer"
              ? "Sign In as Employer"
              : "Sign In as Candidate"}
          </button>
        </form>

        <p className="switch-auth">
          Don't have an account?{" "}
          {loginRole === "employer" ? (
            <Link to="/register?role=employer">Register as Employer</Link>
          ) : (
            <Link to="/register?role=jobseeker">Register as Candidate</Link>
          )}
        </p>

        <div style={{ marginTop: "14px", textAlign: "center", fontSize: "12px", color: "#888" }}>
          Looking for administrator portal?{" "}
          <Link to="/admin" style={{ color: "#6b2f52", fontWeight: "600", textDecoration: "none" }}>
            Admin Control Panel
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;