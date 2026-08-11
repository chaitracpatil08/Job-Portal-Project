import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="logo">
        <span className="logo-icon">💼</span>
        <span>JOBPORTAL</span>
      </div>

      {/* Navigation Links */}
      <div className="nav-links">
        <Link to="/" className="active">
          Home
        </Link>

        <Link to="/jobs">Jobs</Link>

       <Link to="/companies">Companies</Link>
        <a href="#">About Us</a>
        <a href="#">Contact</a>
      </div>

      {/* Authentication Buttons */}
      <div className="nav-buttons">
        <Link to="/login" className="login-btn">Login</Link>
        <Link to="/register" className="register-btn">Register</Link>
      </div>

    </nav>
  );
}

export default Navbar;

