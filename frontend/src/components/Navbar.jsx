import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationAPI } from "../services/api";
import JobPortalLogo from "./JobPortalLogo";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, isJobseeker, isEmployer, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifDropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationAPI.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Silently catch to not disturb user experience
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (isAuthenticated) {
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target)
      ) {
        setShowNotifMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await notificationAPI.markAsRead(notif._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.warn("Could not mark read:", err.message);
    }

    setShowNotifMenu(false);

    // Navigate to target link based on role and notification content
    if (notif.link) {
      navigate(notif.link);
    } else if (isEmployer) {
      navigate("/employer/dashboard");
    } else if (isJobseeker) {
      navigate("/dashboard");
    } else if (isAdmin) {
      navigate("/admin");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn("Could not mark all read:", err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar">
      {/* Brand Logo */}
      <JobPortalLogo size="md" />

      {/* Navigation Links */}
      <div className="nav-links">
        <Link to="/" className={isActive("/")}>
          Home
        </Link>

        <Link to="/jobs" className={isActive("/jobs")}>
          Jobs
        </Link>

        <Link to="/companies" className={isActive("/companies")}>
          Companies
        </Link>

        <Link to="/about" className={isActive("/about")}>
          About Us
        </Link>

        <Link to="/contact" className={isActive("/contact")}>
          Contact
        </Link>

        {/* Role-specific Links */}
        {isAuthenticated && isJobseeker && (
          <Link to="/dashboard" className={isActive("/dashboard")}>
            My Applications
          </Link>
        )}

        {isAuthenticated && isEmployer && (
          <Link to="/employer/dashboard" className={isActive("/employer/dashboard")}>
            Employer Portal
          </Link>
        )}

        {isAuthenticated && isAdmin && (
          <Link to="/admin" className={isActive("/admin")}>
            Admin Panel
          </Link>
        )}
      </div>

      {/* Authentication & Notification Controls */}
      <div className="nav-buttons">
        {isAuthenticated ? (
          <div className="nav-user-controls" ref={notifDropdownRef}>
            {/* Notification Bell Button */}
            <div className="notif-wrapper">
              <button
                type="button"
                className="notif-bell-btn"
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (!showNotifMenu) fetchNotifications();
                }}
                aria-label="View notifications"
                title="Notifications"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifMenu && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "700", color: "#30203a", fontSize: "15px" }}>
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="notif-count-tag">{unreadCount} unread</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="notif-mark-read-btn"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>
                          🔔
                        </span>
                        <p style={{ margin: 0, fontWeight: "600", color: "#443" }}>
                          No notifications yet
                        </p>
                        <span style={{ fontSize: "12px", color: "#888" }}>
                          Updates on applications will appear here.
                        </span>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n._id}
                          className={`notif-item ${!n.read ? "unread" : ""}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="notif-item-dot">
                            {!n.read && <span className="unread-dot" />}
                          </div>
                          <div className="notif-item-body">
                            <h4 className="notif-item-title">{n.title}</h4>
                            <p className="notif-item-message">{n.message}</p>
                            <span className="notif-item-time">
                              {new Date(n.createdAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="notif-dropdown-footer">
                    <button
                      type="button"
                      className="notif-close-btn"
                      onClick={() => setShowNotifMenu(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Greeting & Tag */}
            <span className="user-greeting">
              <span className="user-avatar-badge">
                {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
              </span>
              <span className="user-display-name">{user?.fullName}</span>
              <span className="user-role-tag">
                {user?.role === "employer"
                  ? "Employer"
                  : user?.role === "admin"
                  ? "Admin"
                  : "Candidate"}
              </span>
            </span>

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link to="/login?role=candidate" className="login-btn" title="Sign in as Candidate">
              Candidate Login
            </Link>
            <Link
              to="/login?role=employer"
              className="login-btn"
              style={{
                backgroundColor: "transparent",
                color: "#6b2f52",
                border: "1.5px solid #6b2f52",
              }}
              title="Sign in as Employer"
            >
              Employer Login
            </Link>
            <Link to="/register" className="register-btn">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
