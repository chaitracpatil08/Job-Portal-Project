import React from "react";
import { Link } from "react-router-dom";
import JobPortalLogo from "./JobPortalLogo";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Column 1: Brand & Bio */}
        <div className="footer-col brand-col">
          <JobPortalLogo size="md" />

          <p className="footer-bio">
            Connecting ambitious professionals with premier global tech employers. Experience
            transparent, verified hiring with live tracking.
          </p>

          <div className="footer-socials">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" title="LinkedIn">
              in
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" title="X (Twitter)">
              𝕏
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" title="GitHub">
              git
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram">
              ig
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/jobs">Browse All Jobs</Link>
            </li>
            <li>
              <Link to="/companies">Top Companies</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact Support</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: For Candidates */}
        <div className="footer-col">
          <h4>For Candidates</h4>
          <ul>
            <li>
              <Link to="/register">Create Free Account</Link>
            </li>
            <li>
              <Link to="/dashboard">Application Tracker</Link>
            </li>
            <li>
              <Link to="/jobs?jobType=internship">Internship Programs</Link>
            </li>
            <li>
              <Link to="/jobs?experience=fresher">Fresher Openings</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: For Recruiters */}
        <div className="footer-col">
          <h4>For Employers</h4>
          <ul>
            <li>
              <Link to="/register">Post a Job Opening</Link>
            </li>
            <li>
              <Link to="/employer/dashboard">Employer Dashboard</Link>
            </li>
            <li>
              <Link to="/contact">Enterprise Partnerships</Link>
            </li>
            <li>
              <Link to="/login">Recruiter Sign In</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <p>© 2026 JobPortal Inc. All rights reserved.</p>
        <div className="footer-legal-links">
          <a href="#" onClick={(e) => e.preventDefault()}>
            Privacy Policy
          </a>
          <span>·</span>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Terms of Service
          </a>
          <span>·</span>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Security & Trust
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;