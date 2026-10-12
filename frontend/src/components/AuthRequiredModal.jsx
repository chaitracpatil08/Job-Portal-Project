import React from "react";
import { Link } from "react-router-dom";
import "./AuthRequiredModal.css";

function AuthRequiredModal({
  isOpen,
  onClose,
  title = "Please Log In or Register",
  message = "Please log in or register to this portal.",
  actionContext = "search, filter, or apply for jobs",
}) {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Lock / Security Icon Badge */}
        <div className="auth-modal-icon-badge">
          <span role="img" aria-label="Lock">🔒</span>
        </div>

        {/* Modal Heading & Messages */}
        <h2>{title}</h2>
        <p className="auth-modal-lead">{message}</p>
        <p className="auth-modal-sub">
          You need an active account to {actionContext}. It only takes a minute to join!
        </p>

        {/* Action Buttons */}
        <div className="auth-modal-actions">
          <Link to="/login" className="modal-btn-login">
            Log In Now
          </Link>
          <Link to="/register" className="modal-btn-register">
            Register Account
          </Link>
        </div>

        {/* Dismiss Option */}
        <button type="button" className="modal-btn-dismiss" onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </div>
  );
}

export default AuthRequiredModal;
