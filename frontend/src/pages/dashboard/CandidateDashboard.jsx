import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ApplicationStatusBadge from "../../components/ApplicationStatusBadge";
import { applicationAPI, profileAPI, notificationAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

function CandidateDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("applications");

  // Applications
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Profile Form
  const [profile, setProfile] = useState({
    fullName: "",
    headline: "",
    phone: "",
    location: "",
    skills: "",
    experience: "",
    education: "",
    resumeUrl: "",
    bio: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load applications
    const loadApplications = async () => {
      setLoadingApps(true);
      try {
        const res = await applicationAPI.getMyApplications();
        if (res.success) setApplications(res.applications || []);
      } catch (err) {
        console.warn("Could not load applications:", err.message);
      } finally {
        setLoadingApps(false);
      }
    };

    // Load candidate profile
    const loadProfile = async () => {
      try {
        const res = await profileAPI.getCandidateProfile();
        if (res.success && res.profile) {
          const p = res.profile;
          setProfile({
            fullName: p.fullName || user?.fullName || "",
            headline: p.headline || "",
            phone: p.phone || "",
            location: p.location || "",
            skills: Array.isArray(p.skills) ? p.skills.join(", ") : p.skills || "",
            experience: p.experience || "",
            education: p.education || "",
            resumeUrl: p.resumeUrl || "",
            bio: p.bio || "",
          });
        }
      } catch (err) {
        console.warn("Could not load profile:", err.message);
      }
    };

    // Load notifications
    const loadNotifications = async () => {
      try {
        const res = await notificationAPI.getNotifications();
        if (res.success) {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (err) {
        console.warn("Could not load notifications:", err.message);
      }
    };

    loadApplications();
    loadProfile();
    loadNotifications();
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const res = await profileAPI.updateCandidateProfile(profile);
      if (res.success) {
        setProfileMsg("✓ Profile updated successfully!");
        setTimeout(() => setProfileMsg(""), 3000);
      }
    } catch (err) {
      setProfileMsg(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn("Error marking read:", err.message);
    }
  };

  return (
    <div className="dashboard-page-wrapper">
      <Navbar />

      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Candidate Dashboard</h1>
            <p>Welcome back, {user?.fullName}! Track your job search and profile.</p>
          </div>

          <Link
            to="/jobs"
            style={{
              backgroundColor: "#6b2f52",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            Explore Jobs →
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            📋 My Applications ({applications.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Profile & Resume
          </button>
          <button
            className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        <div className="dashboard-content">
          {/* TAB 1: APPLICATIONS */}
          {activeTab === "applications" && (
            <div className="dashboard-card">
              <h2>My Submitted Applications</h2>

              {loadingApps ? (
                <p style={{ color: "#777", textAlign: "center", padding: "30px" }}>
                  Loading applications...
                </p>
              ) : applications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <p style={{ color: "#666", marginBottom: "15px" }}>
                    You haven't applied to any jobs yet.
                  </p>
                  <Link
                    to="/jobs"
                    style={{
                      backgroundColor: "#6b2f52",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                  >
                    Browse Available Jobs
                  </Link>
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Location</th>
                        <th>Applied On</th>
                        <th>Current Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id}>
                          <td>
                            <strong>{app.job?.title || "Job Listing"}</strong>
                          </td>
                          <td>{app.job?.company || "Company"}</td>
                          <td>📍 {app.job?.location || "India"}</td>
                          <td>
                            {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td>
                            <ApplicationStatusBadge status={app.status} />
                          </td>
                          <td>
                            {app.job?._id && (
                              <Link
                                to={`/job-details?id=${app.job._id}`}
                                style={{
                                  color: "#6b2f52",
                                  textDecoration: "none",
                                  fontWeight: "600",
                                }}
                              >
                                View Job →
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === "profile" && (
            <div className="dashboard-card">
              <h2>Candidate Profile & Career Information</h2>

              {profileMsg && (
                <div
                  style={{
                    backgroundColor: profileMsg.startsWith("✓") ? "#eafaf1" : "#fdf2f2",
                    color: profileMsg.startsWith("✓") ? "#27ae60" : "#9b1c1c",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    fontSize: "14px",
                  }}
                >
                  {profileMsg}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="dashboard-form">
                <div className="form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Professional Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer | React, Node.js"
                    value={profile.headline}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="Bangalore, India"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Key Skills (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, Express, MongoDB, JavaScript"
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Experience Summary</label>
                  <input
                    type="text"
                    placeholder="e.g. 1-3 Years Junior Software Engineer"
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Education</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Computer Science, 2024"
                    value={profile.education}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  />
                </div>

                <div className="form-field full-width">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ margin: 0 }}>Resume Document / URL *</label>
                    {profile.resumeUrl ? (
                      <span style={{ fontSize: "12px", color: "#27ae60", fontWeight: "600" }}>
                        ✓ Active Resume On File
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#c0392b", fontWeight: "600" }}>
                        ⚠️ Required to Apply for Jobs
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setProfileMsg("Resume file size exceeds the 5 MB limit. Please select a smaller file (under 5 MB).");
                            e.target.value = "";
                            return;
                          }
                          const allowed = [".pdf", ".doc", ".docx"];
                          const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
                          if (!allowed.includes(ext)) {
                            setProfileMsg("Please select a PDF or Word document (.pdf, .doc, .docx).");
                            e.target.value = "";
                            return;
                          }
                          setProfileMsg("");
                          const reader = new FileReader();
                          reader.onload = () => {
                            setProfile((prev) => ({
                              ...prev,
                              resumeUrl: reader.result,
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{
                        padding: "8px",
                        fontSize: "12px",
                        borderRadius: "8px",
                        border: "1px dashed #6b2f52",
                        background: "#faf3f8",
                        flex: 1,
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="https://drive.google.com/your-resume or hosted link"
                    value={profile.resumeUrl?.startsWith("data:") ? "Local File Attached (" + profile.resumeUrl.substring(0, 30) + "...)" : profile.resumeUrl}
                    onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                  />
                  <small style={{ color: "#777", display: "block", marginTop: "4px" }}>
                    Upload a .pdf/.doc file or paste a public link. This will be automatically attached when you apply for jobs.
                  </small>
                </div>

                <div className="form-field full-width">
                  <label>Short Bio</label>
                  <textarea
                    rows="4"
                    placeholder="Tell employers about your goals and technical strengths..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>

                <div className="full-width" style={{ marginTop: "10px" }}>
                  <button type="submit" className="btn-primary" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="dashboard-card">
              <h2>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6b2f52",
                      cursor: "pointer",
                      fontSize: "13px",
                      textDecoration: "underline",
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </h2>

              {notifications.length === 0 ? (
                <p style={{ color: "#777", textAlign: "center", padding: "30px" }}>
                  No notifications yet.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: "16px",
                        backgroundColor: n.read ? "#ffffff" : "#faf3f8",
                        border: "1px solid #eedae8",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {!n.read && (
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                backgroundColor: "#6b2f52",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                          <strong style={{ color: "#30203a", fontSize: "15px" }}>
                            {n.title}
                          </strong>
                        </div>
                        <p style={{ margin: "4px 0 0", color: "#555", fontSize: "14px" }}>
                          {n.message}
                        </p>
                      </div>

                      <span style={{ color: "#999", fontSize: "12px", whiteSpace: "nowrap" }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CandidateDashboard;
