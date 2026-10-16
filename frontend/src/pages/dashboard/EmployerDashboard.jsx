import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ApplicationStatusBadge from "../../components/ApplicationStatusBadge";
import { jobAPI, applicationAPI, profileAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

function EmployerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState({ message: "", type: "" });

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Applicants state
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Post Job Form state
  const [newJob, setNewJob] = useState({
    title: "",
    company: user?.fullName || "",
    location: "Bangalore, India",
    jobType: "Full Time",
    experience: "Fresher",
    salary: "₹10 - 15 LPA",
    skills: "",
    description: "",
    responsibilities: "",
    requirements: "",
  });
  const [postingJob, setPostingJob] = useState(false);
  const [jobMsg, setJobMsg] = useState("");

  // Company Profile state
  const [companyProfile, setCompanyProfile] = useState({
    companyName: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    industry: "",
    companySize: "",
    description: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await jobAPI.getMyJobs();
      if (res.success) setJobs(res.jobs || []);
    } catch (err) {
      console.warn("Could not load employer jobs:", err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await applicationAPI.getEmployerApplications();
      if (res.success) setApplications(res.applications || []);
    } catch (err) {
      console.warn("Could not load applicants:", err.message);
    } finally {
      setLoadingApps(false);
    }
  };

  const loadCompanyProfile = async () => {
    try {
      const res = await profileAPI.getEmployerProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setCompanyProfile({
          companyName: p.companyName || user?.fullName || "",
          email: p.email || user?.email || "",
          phone: p.phone || "",
          website: p.website || "",
          location: p.location || "",
          industry: p.industry || "",
          companySize: p.companySize || "",
          description: p.description || "",
        });
      }
    } catch (err) {
      console.warn("Could not load company profile:", err.message);
    }
  };

  useEffect(() => {
    loadJobs();
    loadApplications();
    loadCompanyProfile();
  }, [user]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description || !newJob.location) {
      setJobMsg("Error: Please provide Title, Location, and Description.");
      return;
    }

    setPostingJob(true);
    setJobMsg("");

    try {
      const res = await jobAPI.createJob(newJob);
      if (res.success) {
        setJobMsg("✓ Job posted successfully!");
        setNewJob({
          title: "",
          company: companyProfile.companyName || user?.fullName || "",
          location: "Bangalore, India",
          jobType: "Full Time",
          experience: "Fresher",
          salary: "₹10 - 15 LPA",
          skills: "",
          description: "",
          responsibilities: "",
          requirements: "",
        });
        loadJobs();
        setTimeout(() => setActiveTab("jobs"), 1200);
      }
    } catch (err) {
      setJobMsg(`Error: ${err.message}`);
    } finally {
      setPostingJob(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job listing and its applications?")) {
      return;
    }

    try {
      const res = await jobAPI.deleteJob(id);
      if (res.success) {
        setJobs((prev) => prev.filter((j) => j._id !== id));
        loadApplications();
      }
    } catch (err) {
      alert(`Could not delete job: ${err.message}`);
    }
  };

  const handleToggleJobStatus = async (jobId, currentStatus, title) => {
    const newStatus = currentStatus === "Active" ? "Archived" : "Active";
    const confirmMsg =
      currentStatus === "Active"
        ? `Archive "${title}"? This listing will no longer appear in candidate searches or accept applications.`
        : `Activate "${title}"? This listing will become visible to candidates again.`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setStatusUpdatingId(jobId);
    setActionFeedback({ message: "", type: "" });

    try {
      const res = await jobAPI.updateJobStatus(jobId, newStatus);
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
        );
        setActionFeedback({
          message:
            res.message ||
            `Job "${title}" status successfully updated to ${newStatus}.`,
          type: "success",
        });
        setTimeout(() => setActionFeedback({ message: "", type: "" }), 5000);
      } else {
        setActionFeedback({
          message: res.message || "Failed to update job status.",
          type: "error",
        });
      }
    } catch (err) {
      setActionFeedback({
        message: `Could not update job status: ${err.message}`,
        type: "error",
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await applicationAPI.updateStatus(appId, newStatus);
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      alert(`Could not update status: ${err.message}`);
    }
  };

  const handleSaveCompanyProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");

    try {
      const res = await profileAPI.updateEmployerProfile(companyProfile);
      if (res.success) {
        setProfileMsg("✓ Company profile saved successfully!");
        setTimeout(() => setProfileMsg(""), 3000);
      }
    } catch (err) {
      setProfileMsg(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (jobStatusFilter === "active") return job.status === "Active";
    if (jobStatusFilter === "archived") return job.status === "Archived";
    return true;
  });

  return (
    <div className="dashboard-page-wrapper">
      <Navbar />

      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Employer Portal</h1>
            <p>Manage job listings, review candidates, and update company details.</p>
          </div>

          <button
            onClick={() => setActiveTab("post-job")}
            className="btn-primary"
            style={{ padding: "10px 20px" }}
          >
            + Post New Job
          </button>
        </div>

        {/* Action feedback message */}
        {actionFeedback.message && (
          <div
            style={{
              padding: "12px 18px",
              marginBottom: "16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              backgroundColor: actionFeedback.type === "success" ? "#f0fdf4" : "#fef2f2",
              color: actionFeedback.type === "success" ? "#166534" : "#991b1b",
              border: `1px solid ${actionFeedback.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {actionFeedback.message}
          </div>
        )}

        {/* Overview Stats */}
        <div className="dashboard-content" style={{ marginBottom: 0 }}>
          <div className="stats-grid">
            <div className="stat-box">
              <h3>Active Job Openings</h3>
              <p>{jobs.filter((j) => j.status === "Active").length}</p>
            </div>
            <div className="stat-box">
              <h3>Archived Jobs</h3>
              <p>{jobs.filter((j) => j.status === "Archived").length}</p>
            </div>
            <div className="stat-box">
              <h3>Total Applications Received</h3>
              <p>{applications.length}</p>
            </div>
            <div className="stat-box">
              <h3>Shortlisted Candidates</h3>
              <p>
                {applications.filter((a) => a.status === "Shortlisted").length}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "jobs" ? "active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            💼 Posted Jobs ({jobs.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "applicants" ? "active" : ""}`}
            onClick={() => setActiveTab("applicants")}
          >
            👥 Candidate Applicants ({applications.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "post-job" ? "active" : ""}`}
            onClick={() => setActiveTab("post-job")}
          >
            ✍️ Post a Job
          </button>
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            🏢 Company Profile
          </button>
        </div>

        <div className="dashboard-content">
          {/* TAB 1: POSTED JOBS */}
          {activeTab === "jobs" && (
            <div className="dashboard-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <h2>My Job Listings ({filteredJobs.length})</h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setJobStatusFilter("all")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: "1px solid #ddd",
                      background: jobStatusFilter === "all" ? "#6b2f52" : "#fff",
                      color: jobStatusFilter === "all" ? "#fff" : "#333",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    All ({jobs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobStatusFilter("active")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: "1px solid #ddd",
                      background: jobStatusFilter === "active" ? "#27ae60" : "#fff",
                      color: jobStatusFilter === "active" ? "#fff" : "#333",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Active ({jobs.filter((j) => j.status === "Active").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobStatusFilter("archived")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: "1px solid #ddd",
                      background: jobStatusFilter === "archived" ? "#d97706" : "#fff",
                      color: jobStatusFilter === "archived" ? "#fff" : "#333",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Archived ({jobs.filter((j) => j.status === "Archived").length})
                  </button>
                </div>
              </div>

              {loadingJobs ? (
                <p style={{ color: "#777", textAlign: "center", padding: "30px" }}>
                  Loading your jobs...
                </p>
              ) : jobs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#666", marginBottom: "15px" }}>
                    You haven't posted any jobs yet.
                  </p>
                  <button
                    onClick={() => setActiveTab("post-job")}
                    className="btn-primary"
                  >
                    Post Your First Job
                  </button>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                  No {jobStatusFilter} jobs found.
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Salary</th>
                        <th>Applicants</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <tr key={job._id}>
                          <td>
                            <strong>{job.title}</strong>
                          </td>
                          <td>📍 {job.location}</td>
                          <td>{job.jobType}</td>
                          <td>{job.salary}</td>
                          <td>
                            <span
                              style={{
                                backgroundColor: "#fbf1f6",
                                color: "#6b2f52",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontWeight: "600",
                              }}
                            >
                              {job.applicantCount || 0}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                backgroundColor:
                                  job.status === "Active" ? "#e8f8f0" : "#fef3c7",
                                color:
                                  job.status === "Active" ? "#1e7e34" : "#92400e",
                                border: `1px solid ${
                                  job.status === "Active" ? "#b7eb8f" : "#fcd34d"
                                }`,
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "700",
                              }}
                            >
                              {job.status === "Active" ? "● Active" : "📦 Archived"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                              <Link
                                to={`/job-details?id=${job._id}`}
                                style={{
                                  color: "#6b2f52",
                                  textDecoration: "none",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  padding: "5px 10px",
                                  border: "1px solid #e2d2db",
                                  borderRadius: "6px",
                                }}
                              >
                                View
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleJobStatus(job._id, job.status, job.title)
                                }
                                disabled={statusUpdatingId === job._id}
                                style={{
                                  padding: "5px 12px",
                                  borderRadius: "6px",
                                  border:
                                    job.status === "Active"
                                      ? "1px solid #d97706"
                                      : "1px solid #27ae60",
                                  background:
                                    job.status === "Active" ? "#fffbeb" : "#f0fdf4",
                                  color:
                                    job.status === "Active" ? "#b45309" : "#15803d",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor:
                                    statusUpdatingId === job._id
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity: statusUpdatingId === job._id ? 0.6 : 1,
                                }}
                                title={
                                  job.status === "Active"
                                    ? "Archive this job listing"
                                    : "Activate this job listing"
                                }
                              >
                                {statusUpdatingId === job._id
                                  ? "Updating..."
                                  : job.status === "Active"
                                  ? "Archive Job"
                                  : "Activate Job"}
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job._id)}
                                className="btn-danger"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE APPLICANTS */}
          {activeTab === "applicants" && (
            <div className="dashboard-card">
              <h2>Candidate Applications</h2>

              {loadingApps ? (
                <p style={{ color: "#777", textAlign: "center", padding: "30px" }}>
                  Loading applicants...
                </p>
              ) : applications.length === 0 ? (
                <p style={{ color: "#777", textAlign: "center", padding: "40px" }}>
                  No candidate applications received yet.
                </p>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Contact</th>
                        <th>Applied For</th>
                        <th>Applied Date</th>
                        <th>Resume</th>
                        <th>Current Status</th>
                        <th>Change Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id}>
                          <td>
                            <strong>{app.fullName}</strong>
                          </td>
                          <td>
                            <div>{app.email}</div>
                            {app.phone && (
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {app.phone}
                              </div>
                            )}
                          </td>
                          <td>{app.job?.title || "Job Listing"}</td>
                          <td>
                            {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td>
                            {app.resumeUrl ? (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#6b2f52",
                                  fontWeight: "600",
                                  textDecoration: "underline",
                                }}
                              >
                                View Resume ↗
                              </a>
                            ) : (
                              <span style={{ color: "#999" }}>None</span>
                            )}
                          </td>
                          <td>
                            <ApplicationStatusBadge status={app.status} />
                          </td>
                          <td>
                            <select
                              className="status-select"
                              value={app.status}
                              onChange={(e) =>
                                handleStatusChange(app._id, e.target.value)
                              }
                            >
                              <option value="Applied">Applied</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POST JOB */}
          {activeTab === "post-job" && (
            <div className="dashboard-card">
              <h2>Post a New Job Opening</h2>

              {jobMsg && (
                <div
                  style={{
                    backgroundColor: jobMsg.startsWith("✓") ? "#eafaf1" : "#fdf2f2",
                    color: jobMsg.startsWith("✓") ? "#27ae60" : "#9b1c1c",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    fontSize: "14px",
                  }}
                >
                  {jobMsg}
                </div>
              )}

              <form onSubmit={handlePostJob} className="dashboard-form">
                <div className="form-field">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Developer"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, India (or Remote)"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Job Type</label>
                  <select
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Experience Required</label>
                  <select
                    value={newJob.experience}
                    onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3+ Years">3+ Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Salary Package</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹12 - 18 LPA"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, Express, MongoDB, Docker"
                    value={newJob.skills}
                    onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Job Description *</label>
                  <textarea
                    rows="4"
                    placeholder="Describe the role, team, and day-to-day work..."
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Key Responsibilities (one per line)</label>
                  <textarea
                    rows="3"
                    placeholder="Develop scalable web applications&#10;Collaborate with product designers&#10;Write unit and integration tests"
                    value={newJob.responsibilities}
                    onChange={(e) =>
                      setNewJob({ ...newJob, responsibilities: e.target.value })
                    }
                  />
                </div>

                <div className="form-field full-width">
                  <label>Qualifications & Requirements (one per line)</label>
                  <textarea
                    rows="3"
                    placeholder="Bachelor's in Computer Science or related field&#10;Strong understanding of REST APIs&#10;Excellent communication skills"
                    value={newJob.requirements}
                    onChange={(e) =>
                      setNewJob({ ...newJob, requirements: e.target.value })
                    }
                  />
                </div>

                <div className="full-width">
                  <button type="submit" className="btn-primary" disabled={postingJob}>
                    {postingJob ? "Publishing Job..." : "Publish Job Opening"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: COMPANY PROFILE */}
          {activeTab === "profile" && (
            <div className="dashboard-card">
              <h2>Company Details</h2>

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

              <form onSubmit={handleSaveCompanyProfile} className="dashboard-form">
                <div className="form-field">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={companyProfile.companyName}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, companyName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Technology & Software"
                    value={companyProfile.industry}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, industry: e.target.value })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Official Email</label>
                  <input
                    type="email"
                    value={companyProfile.email}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, email: e.target.value })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={companyProfile.phone}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, phone: e.target.value })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Headquarters Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, India"
                    value={companyProfile.location}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, location: e.target.value })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Company Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 500-1000 Employees"
                    value={companyProfile.companySize}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, companySize: e.target.value })
                    }
                  />
                </div>

                <div className="form-field full-width">
                  <label>Website URL</label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={companyProfile.website}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, website: e.target.value })
                    }
                  />
                </div>

                <div className="form-field full-width">
                  <label>Company Overview</label>
                  <textarea
                    rows="4"
                    placeholder="About the company culture, mission, and benefits..."
                    value={companyProfile.description}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, description: e.target.value })
                    }
                  />
                </div>

                <div className="full-width">
                  <button type="submit" className="btn-primary" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save Company Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EmployerDashboard;
