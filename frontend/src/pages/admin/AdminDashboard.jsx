import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ApplicationStatusBadge from "../../components/ApplicationStatusBadge";
import CompanyLogo from "../../components/CompanyLogo";
import { adminAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../dashboard/Dashboard.css";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationsByCompany, setApplicationsByCompany] = useState([]);
  const [applicationsByCandidate, setApplicationsByCandidate] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateFilter, setCandidateFilter] = useState("all");

  const [employerSearch, setEmployerSearch] = useState("");
  const [employerFilter, setEmployerFilter] = useState("all");

  const [companySearch, setCompanySearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");

  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [appSearch, setAppSearch] = useState("");

  const [messageSearch, setMessageSearch] = useState("");
  const [messageFilter, setMessageFilter] = useState("all");

  // Employer blocking modal states
  const [blockingEmployer, setBlockingEmployer] = useState(null);
  const [blockReasonInput, setBlockReasonInput] = useState("");
  const [blockingLoading, setBlockingLoading] = useState(false);

  // Modals for individual details
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingCandidateDetails, setLoadingCandidateDetails] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, candidatesRes, companiesRes, jobsRes, appsRes, msgsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getCandidates(),
        adminAPI.getCompanies(),
        adminAPI.getJobs(),
        adminAPI.getApplications(),
        adminAPI.getMessages(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        setApplicationsByCompany(statsRes.applicationsByCompany || []);
        setApplicationsByCandidate(statsRes.applicationsByCandidate || []);
      }
      if (candidatesRes.success) setCandidates(candidatesRes.candidates || []);
      if (companiesRes.success) setCompanies(companiesRes.companies || []);
      if (jobsRes.success) setJobs(jobsRes.jobs || []);
      if (appsRes.success) setApplications(appsRes.applications || []);
      if (msgsRes.success) setMessages(msgsRes.messages || []);
    } catch (err) {
      console.warn("Error fetching admin data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // View Candidate Details Modal
  const handleViewCandidate = async (candidateId) => {
    setLoadingCandidateDetails(true);
    setSelectedCandidate(null);
    try {
      const res = await adminAPI.getCandidateDetails(candidateId);
      if (res.success && res.candidate) {
        setSelectedCandidate(res.candidate);
      }
    } catch (err) {
      alert(`Could not load candidate details: ${err.message}`);
    } finally {
      setLoadingCandidateDetails(false);
    }
  };

  // View Company Details Modal
  const handleViewCompany = async (companyId) => {
    setLoadingCompanyDetails(true);
    setSelectedCompany(null);
    try {
      const res = await adminAPI.getCompanyDetails(companyId);
      if (res.success && res.company) {
        setSelectedCompany(res.company);
      }
    } catch (err) {
      alert(`Could not load company details: ${err.message}`);
    } finally {
      setLoadingCompanyDetails(false);
    }
  };

  // Toggle User Status (Active / Disabled)
  const handleToggleStatus = async (id, name, currentIsActive) => {
    const actionName = currentIsActive ? "disable" : "activate";
    if (!window.confirm(`Are you sure you want to ${actionName} "${name}"?`)) {
      return;
    }

    try {
      const res = await adminAPI.toggleUserStatus(id);
      if (res.success) {
        // Update both candidates and companies lists
        setCandidates((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isActive: res.isActive } : c))
        );
        setCompanies((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isActive: res.isActive } : c))
        );
      }
    } catch (err) {
      alert(`Could not update status: ${err.message}`);
    }
  };

  // Delete User
  const handleDeleteUser = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${name}"? This will delete their profiles, postings, and applications.`
      )
    ) {
      return;
    }

    try {
      const res = await adminAPI.deleteUser(id);
      if (res.success) {
        setCandidates((prev) => prev.filter((c) => c._id !== id));
        setCompanies((prev) => prev.filter((c) => c._id !== id));
        loadAdminData();
      }
    } catch (err) {
      alert(`Could not delete user: ${err.message}`);
    }
  };

  // Employer Block / Unblock Handlers
  const handleOpenBlockModal = (employer) => {
    setBlockingEmployer(employer);
    setBlockReasonInput("Fraudulent job postings or platform terms of service violation");
  };

  const handleConfirmBlockEmployer = async () => {
    if (!blockingEmployer) return;
    setBlockingLoading(true);
    try {
      const res = await adminAPI.blockEmployer(blockingEmployer._id, blockReasonInput);
      if (res.success) {
        setCompanies((prev) =>
          prev.map((c) =>
            c._id === blockingEmployer._id
              ? {
                  ...c,
                  isBlocked: true,
                  blockReason: blockReasonInput,
                  isActive: false,
                }
              : c
          )
        );
        if (stats) {
          setStats((prev) => ({
            ...prev,
            blockedEmployers: (prev.blockedEmployers || 0) + 1,
          }));
        }
        setBlockingEmployer(null);
      }
    } catch (err) {
      alert(`Could not block employer: ${err.message}`);
    } finally {
      setBlockingLoading(false);
    }
  };

  const handleUnblockEmployer = async (employerId, employerName) => {
    if (
      !window.confirm(
        `Are you sure you want to unblock employer "${employerName}"? This will restore portal access immediately.`
      )
    ) {
      return;
    }

    try {
      const res = await adminAPI.unblockEmployer(employerId);
      if (res.success) {
        setCompanies((prev) =>
          prev.map((c) =>
            c._id === employerId
              ? {
                  ...c,
                  isBlocked: false,
                  blockReason: "",
                  isActive: true,
                }
              : c
          )
        );
        if (stats && stats.blockedEmployers > 0) {
          setStats((prev) => ({
            ...prev,
            blockedEmployers: Math.max(0, prev.blockedEmployers - 1),
          }));
        }
      }
    } catch (err) {
      alert(`Could not unblock employer: ${err.message}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Mark Message Read
  const handleMarkMessageRead = async (id) => {
    try {
      const res = await adminAPI.markMessageRead(id);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === id ? { ...m, read: true } : m))
        );
      }
    } catch (err) {
      alert(`Could not update message: ${err.message}`);
    }
  };

  // Delete Contact Message
  const handleDeleteMessage = async (id, subject) => {
    if (!window.confirm(`Delete message "${subject}"?`)) return;
    try {
      const res = await adminAPI.deleteMessage(id);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (err) {
      alert(`Could not delete message: ${err.message}`);
    }
  };

  // Filtered lists
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      (c.headline && c.headline.toLowerCase().includes(candidateSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (candidateFilter === "active-platform") return c.platformActivity === "Active";
    if (candidateFilter === "inactive-platform") return c.platformActivity === "Inactive";
    if (candidateFilter === "disabled") return c.isActive === false;
    if (candidateFilter === "active-account") return c.isActive !== false;
    return true;
  });

  const filteredEmployers = companies.filter((c) => {
    const s = employerSearch.toLowerCase();
    const matchesSearch =
      (c.fullName && c.fullName.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s)) ||
      (c.companyName && c.companyName.toLowerCase().includes(s)) ||
      (c.companyEmail && c.companyEmail.toLowerCase().includes(s));

    if (!matchesSearch) return false;

    if (employerFilter === "blocked") return c.isBlocked === true;
    if (employerFilter === "active") return c.isActive !== false && !c.isBlocked;
    if (employerFilter === "disabled") return c.isActive === false && !c.isBlocked;
    return true;
  });

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.companyEmail.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.location.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.industry.toLowerCase().includes(companySearch.toLowerCase());

    if (!matchesSearch) return false;

    if (companyFilter === "active-platform") return c.platformActivity === "Active";
    if (companyFilter === "inactive-platform") return c.platformActivity === "Inactive";
    if (companyFilter === "disabled") return c.isActive === false;
    if (companyFilter === "active-account") return c.isActive !== false;
    return true;
  });

  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      appStatusFilter === "all" ||
      (app.status || "").toLowerCase() === appStatusFilter.toLowerCase();

    if (!matchesStatus) return false;

    const candName = app.candidate?.fullName || app.fullName || "";
    const compName = app.job?.company || "";
    const jobTitle = app.job?.title || "";

    const matchesSearch =
      candName.toLowerCase().includes(appSearch.toLowerCase()) ||
      compName.toLowerCase().includes(appSearch.toLowerCase()) ||
      jobTitle.toLowerCase().includes(appSearch.toLowerCase());

    return matchesSearch;
  });

  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.subject.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.message.toLowerCase().includes(messageSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (messageFilter === "unread") return !m.read;
    if (messageFilter === "read") return m.read;
    if (messageFilter !== "all") return m.inquiryType === messageFilter;
    return true;
  });

  return (
    <div className="dashboard-page-wrapper">
      <Navbar />

      <div className="dashboard-page">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Admin Control Panel</h1>
            <p>
              Logged in as: <strong>{user?.fullName}</strong> ({user?.email}) ·{" "}
              <span
                style={{
                  backgroundColor: "#6b2f52",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                Super Administrator
              </span>
            </p>
          </div>

          <button onClick={loadAdminData} className="btn-primary" style={{ padding: "8px 18px" }}>
            ↻ Refresh Data
          </button>
        </div>

        {/* Global Key Stats Grid */}
        <div className="dashboard-content" style={{ marginBottom: 0 }}>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
            <div className="stat-box">
              <h3>Candidates</h3>
              <p>{stats?.totalCandidates || candidates.length}</p>
            </div>
            <div className="stat-box">
              <h3>Employers</h3>
              <p>{stats?.totalEmployers || companies.length}</p>
            </div>
            <div className="stat-box">
              <h3>Companies</h3>
              <p>{stats?.totalCompanies || companies.length}</p>
            </div>
            <div className="stat-box">
              <h3>Total Jobs</h3>
              <p>{stats?.totalJobs || jobs.length}</p>
            </div>
            <div className="stat-box">
              <h3>Active Jobs</h3>
              <p>{stats?.activeJobs || jobs.filter((j) => j.status === "Active").length}</p>
            </div>
            <div className="stat-box">
              <h3>Applications</h3>
              <p>{stats?.totalApplications || applications.length}</p>
            </div>
            <div
              className="stat-box"
              style={{
                backgroundColor:
                  (stats?.blockedEmployers || companies.filter((c) => c.isBlocked).length) > 0
                    ? "#fff1f0"
                    : "#ffffff",
                borderColor:
                  (stats?.blockedEmployers || companies.filter((c) => c.isBlocked).length) > 0
                    ? "#ffa39e"
                    : undefined,
              }}
            >
              <h3
                style={{
                  color:
                    (stats?.blockedEmployers || companies.filter((c) => c.isBlocked).length) > 0
                      ? "#cf1322"
                      : undefined,
                }}
              >
                Blocked Employers
              </h3>
              <p
                style={{
                  color:
                    (stats?.blockedEmployers || companies.filter((c) => c.isBlocked).length) > 0
                      ? "#cf1322"
                      : undefined,
                }}
              >
                {stats?.blockedEmployers !== undefined
                  ? stats.blockedEmployers
                  : companies.filter((c) => c.isBlocked).length}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === "candidates" ? "active" : ""}`}
            onClick={() => setActiveTab("candidates")}
          >
            👥 Manage Candidates ({candidates.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "employers" ? "active" : ""}`}
            onClick={() => setActiveTab("employers")}
          >
            🏢 Manage Employers ({companies.length})
            {(stats?.blockedEmployers || companies.filter((c) => c.isBlocked).length) > 0 && (
              <span
                style={{
                  backgroundColor: "#cf1322",
                  color: "white",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  marginLeft: "6px",
                  fontWeight: "700",
                }}
              >
                {stats?.blockedEmployers || companies.filter((c) => c.isBlocked).length} Blocked
              </span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === "companies" ? "active" : ""}`}
            onClick={() => setActiveTab("companies")}
          >
            🏛️ Manage Companies ({companies.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "jobs" ? "active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            💼 Manage Jobs ({jobs.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            📋 Applications ({applications.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            💬 User Inquiries ({messages.length})
            {unreadMessagesCount > 0 && (
              <span
                style={{
                  backgroundColor: "#cf1322",
                  color: "white",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  marginLeft: "6px",
                  fontWeight: "700",
                }}
              >
                {unreadMessagesCount}
              </span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Admin Profile
          </button>
          <button
            className="tab-btn"
            onClick={handleLogout}
            style={{ marginLeft: "auto", color: "#cf1322", borderColor: "#ffa39e" }}
          >
            🚪 Logout
          </button>
        </div>

        <div className="dashboard-content">
          {/* ================= TAB 1: OVERVIEW & APPLICATION MONITORING ================= */}
          {activeTab === "overview" && (
            <div>
              {/* Application Status Breakdown */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#eafaf1",
                    border: "1px solid #b7eb8f",
                    borderRadius: "12px",
                    padding: "16px 20px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#27ae60", fontWeight: "600" }}>
                    ● Shortlisted Candidates
                  </span>
                  <h2 style={{ margin: "6px 0 0", color: "#1e7e34", fontSize: "28px" }}>
                    {stats?.statusBreakdown?.shortlisted || 0}
                  </h2>
                </div>

                <div
                  style={{
                    backgroundColor: "#e6f7ff",
                    border: "1px solid #91d5ff",
                    borderRadius: "12px",
                    padding: "16px 20px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#1890ff", fontWeight: "600" }}>
                    ● Accepted / Selected
                  </span>
                  <h2 style={{ margin: "6px 0 0", color: "#096dd9", fontSize: "28px" }}>
                    {stats?.statusBreakdown?.accepted || 0}
                  </h2>
                </div>

                <div
                  style={{
                    backgroundColor: "#faf3f8",
                    border: "1px solid #eedae8",
                    borderRadius: "12px",
                    padding: "16px 20px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#6b2f52", fontWeight: "600" }}>
                    ● Applied (Under Review)
                  </span>
                  <h2 style={{ margin: "6px 0 0", color: "#4d244d", fontSize: "28px" }}>
                    {stats?.statusBreakdown?.applied || 0}
                  </h2>
                </div>

                <div
                  style={{
                    backgroundColor: "#fff1f0",
                    border: "1px solid #ffa39e",
                    borderRadius: "12px",
                    padding: "16px 20px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#f5222d", fontWeight: "600" }}>
                    ● Rejected
                  </span>
                  <h2 style={{ margin: "6px 0 0", color: "#cf1322", fontSize: "28px" }}>
                    {stats?.statusBreakdown?.rejected || 0}
                  </h2>
                </div>
              </div>

              {/* Two Column Summary: Applications by Company & by Candidate */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                  gap: "24px",
                  marginBottom: "24px",
                }}
              >
                {/* Applications by Company */}
                <div className="dashboard-card" style={{ marginBottom: 0 }}>
                  <h2>🏢 Applications Received by Company</h2>
                  {applicationsByCompany.length === 0 ? (
                    <p style={{ color: "#777", padding: "20px", textAlign: "center" }}>
                      No applications recorded yet.
                    </p>
                  ) : (
                    <div className="dashboard-table-wrapper">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Company</th>
                            <th>Total Apps</th>
                            <th>Shortlisted</th>
                            <th>Accepted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicationsByCompany.slice(0, 6).map((c, i) => (
                            <tr key={i}>
                              <td>
                                <strong>{c.company}</strong>
                              </td>
                              <td>
                                <span
                                  style={{
                                    backgroundColor: "#faf3f8",
                                    color: "#6b2f52",
                                    padding: "3px 8px",
                                    borderRadius: "10px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {c.total}
                                </span>
                              </td>
                              <td style={{ color: "#27ae60", fontWeight: "600" }}>
                                {c.shortlisted}
                              </td>
                              <td style={{ color: "#1976d2", fontWeight: "600" }}>
                                {c.accepted}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Applications by Candidate */}
                <div className="dashboard-card" style={{ marginBottom: 0 }}>
                  <h2>👥 Applications Submitted by Candidate</h2>
                  {applicationsByCandidate.length === 0 ? (
                    <p style={{ color: "#777", padding: "20px", textAlign: "center" }}>
                      No candidate applications yet.
                    </p>
                  ) : (
                    <div className="dashboard-table-wrapper">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Candidate</th>
                            <th>Email</th>
                            <th>Total Applications</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicationsByCandidate.slice(0, 6).map((c, i) => (
                            <tr key={i}>
                              <td>
                                <strong>{c.candidateName}</strong>
                              </td>
                              <td>{c.candidateEmail}</td>
                              <td>
                                <span
                                  style={{
                                    backgroundColor: "#eafaf1",
                                    color: "#27ae60",
                                    padding: "3px 8px",
                                    borderRadius: "10px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {c.total} applied
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Applications Feed */}
              <div className="dashboard-card">
                <h2>Recent Application Stream</h2>
                {applications.length === 0 ? (
                  <p style={{ color: "#777", textAlign: "center", padding: "30px" }}>
                    No applications recorded yet.
                  </p>
                ) : (
                  <div className="dashboard-table-wrapper">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Job Title</th>
                          <th>Company</th>
                          <th>Applied On</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 8).map((app) => (
                          <tr key={app._id}>
                            <td>{app.candidate?.fullName || app.fullName}</td>
                            <td>{app.job?.title || "Job"}</td>
                            <td>{app.job?.company || "Company"}</td>
                            <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                            <td>
                              <ApplicationStatusBadge status={app.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: CANDIDATE MANAGEMENT ================= */}
          {activeTab === "candidates" && (
            <div className="dashboard-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Registered Candidates / Job Seekers</h2>
                  <p style={{ margin: "4px 0 0", color: "#666", fontSize: "13.5px" }}>
                    Monitor candidate profiles, platform usage, resume status, and account controls.
                  </p>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Search candidate by name or email..."
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                      width: "250px",
                    }}
                  />

                  <select
                    value={candidateFilter}
                    onChange={(e) => setCandidateFilter(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                    }}
                  >
                    <option value="all">All Candidates</option>
                    <option value="active-platform">Platform Active Only</option>
                    <option value="inactive-platform">Platform Inactive Only</option>
                    <option value="active-account">Account Active</option>
                    <option value="disabled">Account Disabled</option>
                  </select>
                </div>
              </div>

              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Candidate Name</th>
                      <th>Email Address</th>
                      <th>Profile / Skills</th>
                      <th>Applications</th>
                      <th>Platform Activity</th>
                      <th>Account Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <strong>{c.fullName}</strong>
                          <div style={{ fontSize: "11px", color: "#888" }}>
                            Registered: {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>{c.email}</td>
                        <td>
                          {c.headline ? (
                            <span style={{ fontSize: "13px", color: "#444" }}>{c.headline}</span>
                          ) : c.skills?.length > 0 ? (
                            <span style={{ fontSize: "12px", color: "#666" }}>
                              {c.skills.slice(0, 3).join(", ")}
                            </span>
                          ) : (
                            <span style={{ color: "#aaa", fontSize: "12px" }}>No profile info</span>
                          )}
                          {c.hasResume && (
                            <span
                              style={{
                                display: "inline-block",
                                marginLeft: "6px",
                                color: "#27ae60",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              📄 Resume
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor: "#faf3f8",
                              color: "#6b2f52",
                              padding: "3px 8px",
                              borderRadius: "10px",
                              fontWeight: "600",
                              fontSize: "12px",
                            }}
                          >
                            {c.applicationCount} applied
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor:
                                c.platformActivity === "Active" ? "#eafaf1" : "#f5f5f5",
                              color: c.platformActivity === "Active" ? "#27ae60" : "#777",
                              padding: "4px 9px",
                              borderRadius: "12px",
                              fontSize: "11.5px",
                              fontWeight: "600",
                            }}
                          >
                            ● {c.platformActivity}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor: c.isActive ? "#e6f7ff" : "#fff1f0",
                              color: c.isActive ? "#1890ff" : "#cf1322",
                              padding: "4px 9px",
                              borderRadius: "12px",
                              fontSize: "11.5px",
                              fontWeight: "600",
                            }}
                          >
                            {c.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleViewCandidate(c._id)}
                              style={{
                                backgroundColor: "#6b2f52",
                                color: "white",
                                border: "none",
                                padding: "5px 10px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontWeight: "500",
                              }}
                            >
                              View Details
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(c._id, c.fullName, c.isActive)}
                              style={{
                                backgroundColor: c.isActive ? "#fff1f0" : "#eafaf1",
                                color: c.isActive ? "#cf1322" : "#27ae60",
                                border: `1px solid ${c.isActive ? "#ffa39e" : "#b7eb8f"}`,
                                padding: "4px 9px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontWeight: "500",
                              }}
                            >
                              {c.isActive ? "Disable" : "Enable"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(c._id, c.fullName)}
                              className="btn-danger"
                              style={{ padding: "4px 8px", fontSize: "12px" }}
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
            </div>
          )}

          {/* ================= TAB 3: MANAGE EMPLOYERS ================= */}
          {activeTab === "employers" && (
            <div className="dashboard-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Manage Employers ({companies.length})</h2>
                  <p style={{ margin: "4px 0 0", color: "#666", fontSize: "13.5px" }}>
                    Monitor registered employer accounts, detect fraudulent accounts, and block or unblock employer portal access.
                  </p>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Search employer by name, company, email..."
                    value={employerSearch}
                    onChange={(e) => setEmployerSearch(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                      width: "250px",
                    }}
                  />

                  <select
                    value={employerFilter}
                    onChange={(e) => setEmployerFilter(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                    }}
                  >
                    <option value="all">All Employers</option>
                    <option value="active">Active Accounts</option>
                    <option value="blocked">Blocked Accounts Only</option>
                    <option value="disabled">Disabled Accounts</option>
                  </select>
                </div>
              </div>

              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Employer Details</th>
                      <th>Company Domain</th>
                      <th>Jobs Posted</th>
                      <th>Platform Activity</th>
                      <th>Account Status</th>
                      <th>Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployers.map((emp) => (
                      <tr key={emp._id}>
                        <td>
                          <strong>{emp.fullName}</strong>
                          <div style={{ fontSize: "12px", color: "#6b2f52" }}>
                            {emp.email}
                          </div>
                          <span style={{ fontSize: "11px", color: "#888" }}>
                            ID: {emp._id}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <CompanyLogo company={emp.companyName} size="sm" />
                            <div>
                              <strong>{emp.companyName}</strong>
                              <div style={{ fontSize: "11px", color: "#777" }}>
                                📍 {emp.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{emp.totalJobsPosted || 0}</strong> jobs posted
                          <div style={{ fontSize: "11px", color: "#27ae60" }}>
                            {emp.activeJobsPosted || 0} active listings
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor: emp.platformActivity === "Active" ? "#eafaf1" : "#f5f5f5",
                              color: emp.platformActivity === "Active" ? "#27ae60" : "#777",
                              padding: "4px 9px",
                              borderRadius: "12px",
                              fontSize: "11.5px",
                              fontWeight: "600",
                            }}
                          >
                            ● {emp.platformActivity}
                          </span>
                        </td>
                        <td>
                          {emp.isBlocked ? (
                            <div>
                              <span
                                style={{
                                  backgroundColor: "#fff1f0",
                                  color: "#cf1322",
                                  border: "1px solid #ffa39e",
                                  padding: "4px 9px",
                                  borderRadius: "12px",
                                  fontSize: "11.5px",
                                  fontWeight: "700",
                                  display: "inline-block",
                                }}
                              >
                                ⛔ Blocked
                              </span>
                              {emp.blockReason && (
                                <div style={{ fontSize: "11px", color: "#cf1322", marginTop: "3px", maxWidth: "160px" }}>
                                  Reason: {emp.blockReason}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span
                              style={{
                                backgroundColor: emp.isActive ? "#eafaf1" : "#fff1f0",
                                color: emp.isActive ? "#27ae60" : "#cf1322",
                                padding: "4px 9px",
                                borderRadius: "12px",
                                fontSize: "11.5px",
                                fontWeight: "600",
                              }}
                            >
                              {emp.isActive ? "● Active" : "● Disabled"}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                            {emp.isBlocked ? (
                              <button
                                type="button"
                                onClick={() => handleUnblockEmployer(emp._id, emp.fullName || emp.companyName)}
                                style={{
                                  backgroundColor: "#eafaf1",
                                  color: "#27ae60",
                                  border: "1px solid #b7eb8f",
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                }}
                              >
                                ✓ Unblock Employer
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenBlockModal(emp)}
                                style={{
                                  backgroundColor: "#fff1f0",
                                  color: "#cf1322",
                                  border: "1px solid #ffa39e",
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                }}
                              >
                                ⚠️ Block Account
                              </button>
                            )}

                            {!emp.isBlocked && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(emp._id, emp.fullName || emp.companyName, emp.isActive)}
                                style={{
                                  backgroundColor: emp.isActive ? "#f5f5f5" : "#e6f7ff",
                                  color: emp.isActive ? "#555" : "#1890ff",
                                  border: "1px solid #ddd",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                              >
                                {emp.isActive ? "Disable" : "Enable"}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(emp._id, emp.fullName || emp.companyName)}
                              className="btn-danger"
                              style={{ padding: "4px 8px", fontSize: "12px" }}
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
            </div>
          )}

          {/* ================= TAB 4: MANAGE COMPANIES ================= */}
          {activeTab === "companies" && (
            <div className="dashboard-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Manage Companies ({companies.length})</h2>
                  <p style={{ margin: "4px 0 0", color: "#666", fontSize: "13.5px" }}>
                    Verified enterprise profiles, active listings, industry classifications, and locations.
                  </p>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Search company by name, email, location..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                      width: "250px",
                    }}
                  />

                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                    }}
                  >
                    <option value="all">All Companies</option>
                    <option value="active-platform">Platform Active Only</option>
                    <option value="inactive-platform">Platform Inactive Only</option>
                    <option value="active-account">Account Active</option>
                    <option value="disabled">Account Disabled</option>
                  </select>
                </div>
              </div>

              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Official Email</th>
                      <th>Location / Industry</th>
                      <th>Jobs Posted</th>
                      <th>Applications Received</th>
                      <th>Company Profile</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <CompanyLogo company={c.companyName} size="md" />
                            <div>
                              <strong>{c.companyName}</strong>
                              <div style={{ fontSize: "11px", color: "#888" }}>
                                {c.companySize || "Enterprise"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {c.companyEmail}
                          {c.website && (
                            <div style={{ fontSize: "11px" }}>
                              <a
                                href={c.website}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#6b2f52" }}
                              >
                                {c.website.replace("https://", "")} ↗
                              </a>
                            </div>
                          )}
                        </td>
                        <td>
                          <div>📍 {c.location}</div>
                          <span style={{ fontSize: "11.5px", color: "#777" }}>
                            {c.industry || "Technology"}
                          </span>
                        </td>
                        <td>
                          <strong>{c.totalJobsPosted}</strong> jobs ({c.activeJobsPosted} active)
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor: "#faf3f8",
                              color: "#6b2f52",
                              padding: "3px 8px",
                              borderRadius: "10px",
                              fontWeight: "600",
                              fontSize: "12px",
                            }}
                          >
                            {c.totalApplicationsReceived} received
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor:
                                c.platformActivity === "Active" ? "#eafaf1" : "#f5f5f5",
                              color: c.platformActivity === "Active" ? "#27ae60" : "#777",
                              padding: "4px 9px",
                              borderRadius: "12px",
                              fontSize: "11.5px",
                              fontWeight: "600",
                            }}
                          >
                            ● {c.platformActivity}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleViewCompany(c._id)}
                            style={{
                              backgroundColor: "#6b2f52",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontWeight: "500",
                            }}
                          >
                            View Company Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: ALL JOBS ================= */}
          {activeTab === "jobs" && (
            <div className="dashboard-card">
              <h2>All Job Listings ({jobs.length})</h2>

              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Applicants</th>
                      <th>Status</th>
                      <th>Posted On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <strong>{job.title}</strong>
                        </td>
                        <td>{job.company}</td>
                        <td>📍 {job.location}</td>
                        <td>{job.jobType}</td>
                        <td>
                          <span
                            style={{
                              backgroundColor: "#faf3f8",
                              color: "#6b2f52",
                              padding: "3px 8px",
                              borderRadius: "10px",
                              fontWeight: "600",
                              fontSize: "12px",
                            }}
                          >
                            {job.applicantCount || 0}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              color: job.status === "Active" ? "#27ae60" : "#777",
                              fontWeight: "600",
                            }}
                          >
                            ● {job.status}
                          </span>
                        </td>
                        <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 5: APPLICATION MONITORING ================= */}
          {activeTab === "applications" && (
            <div className="dashboard-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>System Applications Monitoring</h2>
                  <p style={{ margin: "4px 0 0", color: "#666", fontSize: "13.5px" }}>
                    Track all candidate submissions across every employer and role.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Search by candidate, company, or job..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                      width: "250px",
                    }}
                  />

                  <select
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Email</th>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Resume</th>
                      <th>Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <strong>{app.candidate?.fullName || app.fullName}</strong>
                        </td>
                        <td>{app.candidate?.email || app.email}</td>
                        <td>{app.job?.title || "Job"}</td>
                        <td>{app.job?.company || "Company"}</td>
                        <td>
                          <ApplicationStatusBadge status={app.status} />
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
                                fontSize: "13px",
                              }}
                            >
                              View Resume ↗
                            </a>
                          ) : (
                            <span style={{ color: "#aaa" }}>None</span>
                          )}
                        </td>
                        <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 6: CONTACT INQUIRIES & MESSAGES ================= */}
          {activeTab === "messages" && (
            <div className="dashboard-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Contact Inquiries & User Messages</h2>
                  <p style={{ margin: "4px 0 0", color: "#666", fontSize: "13.5px" }}>
                    Review submitted questions and support inquiries from job seekers and employers.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Search by sender, email, subject..."
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                      width: "250px",
                    }}
                  />

                  <select
                    value={messageFilter}
                    onChange={(e) => setMessageFilter(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "13px",
                    }}
                  >
                    <option value="all">All Inquiries ({messages.length})</option>
                    <option value="unread">Unread Only ({unreadMessagesCount})</option>
                    <option value="read">Read Only</option>
                    <option value="Candidate Support">Candidate Support</option>
                    <option value="Employer Partnership">Employer Partnership</option>
                    <option value="Job Listing Verification">Job Listing Verification</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>
              </div>

              {filteredMessages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 20px", color: "#666" }}>
                  <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>💬</span>
                  <h3 style={{ margin: "6px 0", color: "#30203a" }}>No messages found</h3>
                  <p style={{ fontSize: "14px", color: "#777" }}>
                    {messages.length === 0
                      ? "User messages submitted via the Contact page will appear here."
                      : "No messages match your search criteria."}
                  </p>
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Sender</th>
                        <th>Category</th>
                        <th>Subject & Preview</th>
                        <th>Received On</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.map((msg) => (
                        <tr
                          key={msg._id}
                          style={{
                            backgroundColor: msg.read ? "inherit" : "rgba(107, 47, 82, 0.03)",
                            fontWeight: msg.read ? "normal" : "500",
                          }}
                        >
                          <td>
                            <strong>{msg.fullName}</strong>
                            <div style={{ fontSize: "12px", color: "#666" }}>{msg.email}</div>
                            {msg.phone && (
                              <div style={{ fontSize: "11px", color: "#888" }}>📞 {msg.phone}</div>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                backgroundColor: "#faf3f8",
                                color: "#6b2f52",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "11.5px",
                                fontWeight: "600",
                                display: "inline-block",
                              }}
                            >
                              {msg.inquiryType}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "#30203a", display: "block" }}>{msg.subject}</strong>
                            <span
                              style={{
                                color: "#666",
                                fontSize: "12.5px",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {msg.message}
                            </span>
                          </td>
                          <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                          <td>
                            {msg.read ? (
                              <span
                                style={{
                                  backgroundColor: "#f5f5f5",
                                  color: "#777",
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                }}
                              >
                                Read
                              </span>
                            ) : (
                              <span
                                style={{
                                  backgroundColor: "#fff1f0",
                                  color: "#cf1322",
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                }}
                              >
                                ● Unread
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMessage(msg);
                                  if (!msg.read) handleMarkMessageRead(msg._id);
                                }}
                                style={{
                                  backgroundColor: "#6b2f52",
                                  color: "white",
                                  border: "none",
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                              >
                                View Message
                              </button>

                              {!msg.read && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkMessageRead(msg._id)}
                                  style={{
                                    backgroundColor: "#eafaf1",
                                    color: "#27ae60",
                                    border: "1px solid #b7eb8f",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Mark Read
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg._id, msg.subject)}
                                className="btn-danger"
                                style={{ padding: "4px 8px", fontSize: "12px" }}
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

          {/* ================= TAB 7: ADMIN PROFILE ================= */}
          {activeTab === "profile" && (
            <div>
              {/* Profile Card Header */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "14px",
                  padding: "30px",
                  border: "1.5px solid #ece4eb",
                  boxShadow: "0 4px 16px rgba(80, 40, 70, 0.06)",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6b2f52 0%, #a3487d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "32px",
                    fontWeight: "bold",
                    boxShadow: "0 6px 18px rgba(107, 47, 82, 0.25)",
                  }}
                >
                  {user?.fullName ? user.fullName[0].toUpperCase() : "A"}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, color: "#30203a", fontSize: "24px" }}>
                      {user?.fullName || "Administrator"}
                    </h2>
                    <span
                      style={{
                        backgroundColor: "#6b2f52",
                        color: "white",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Super Administrator
                    </span>
                    <span
                      style={{
                        backgroundColor: "#eafaf1",
                        color: "#27ae60",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      ● Account Active
                    </span>
                  </div>
                  <p style={{ margin: "6px 0 0", color: "#666", fontSize: "14px" }}>
                    {user?.email} · Full Administrative Control & Portal Oversight
                  </p>
                </div>
              </div>

              {/* Profile Information & Security Matrix */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                  gap: "24px",
                  marginBottom: "24px",
                }}
              >
                {/* Account Credentials & Details */}
                <div className="dashboard-card" style={{ marginBottom: 0 }}>
                  <h2>Admin Account Credentials</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase" }}>
                        Full Name
                      </span>
                      <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: "600", color: "#333" }}>
                        {user?.fullName || "System Administrator"}
                      </p>
                    </div>

                    <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase" }}>
                        Email Address
                      </span>
                      <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: "600", color: "#333" }}>
                        {user?.email || "admin@example.com"}
                      </p>
                    </div>

                    <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase" }}>
                        Platform Role
                      </span>
                      <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: "600", color: "#6b2f52" }}>
                        Admin (Superuser)
                      </p>
                    </div>

                    <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase" }}>
                        Authentication Method
                      </span>
                      <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: "600", color: "#333" }}>
                        JWT Bearer Token (Secure Http Authorization)
                      </p>
                    </div>

                    <div style={{ padding: "10px 0" }}>
                      <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase" }}>
                        Account Status
                      </span>
                      <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: "600", color: "#27ae60" }}>
                        ✓ Verified & Active
                      </p>
                    </div>
                  </div>
                </div>

                {/* Administrative Permissions Matrix */}
                <div className="dashboard-card" style={{ marginBottom: 0 }}>
                  <h2>Administrative Authority & Scope</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      {
                        title: "Candidate Profile Management",
                        desc: "Inspect full profiles, resumes, application history, and toggle account activation.",
                      },
                      {
                        title: "Company & Employer Governance",
                        desc: "Monitor registered enterprises, review company profiles, posted vacancies, and manage account statuses.",
                      },
                      {
                        title: "Job Listings Oversight",
                        desc: "Monitor all posted openings, applicant counts, and listing states across the portal.",
                      },
                      {
                        title: "Application Lifecycle Audit",
                        desc: "Track submissions, status progression (Applied, Shortlisted, Accepted, Rejected), and verified resumes.",
                      },
                      {
                        title: "Direct Support & Inquiries Desk",
                        desc: "Receive, read, triage, and manage contact requests submitted from candidates and employers.",
                      },
                    ].map((perm, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: "#faf5f9",
                          border: "1px solid #eedae8",
                          borderRadius: "10px",
                          padding: "12px 16px",
                        }}
                      >
                        <strong style={{ color: "#4d244d", fontSize: "13.5px", display: "block" }}>
                          ✓ {perm.title}
                        </strong>
                        <span style={{ color: "#666", fontSize: "12px" }}>{perm.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Infrastructure Card */}
              <div className="dashboard-card">
                <h2>Portal Infrastructure Status</h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f4fcf6",
                      border: "1px solid #c3e6cb",
                      borderRadius: "10px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#155724", fontWeight: "600" }}>
                      ● DATABASE STATUS
                    </span>
                    <h4 style={{ margin: "6px 0 2px", color: "#27ae60" }}>Connected (MongoDB)</h4>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      JobPortalData Database Online
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f4fcf6",
                      border: "1px solid #c3e6cb",
                      borderRadius: "10px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#155724", fontWeight: "600" }}>
                      ● BACKEND API SERVICE
                    </span>
                    <h4 style={{ margin: "6px 0 2px", color: "#27ae60" }}>Online (Port 5000)</h4>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Express REST Server Running
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f4fcf6",
                      border: "1px solid #c3e6cb",
                      borderRadius: "10px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#155724", fontWeight: "600" }}>
                      ● SECURITY & ACCESS
                    </span>
                    <h4 style={{ margin: "6px 0 2px", color: "#27ae60" }}>Enforced (Admin RBAC)</h4>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Protected Routes Active
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f4fcf6",
                      border: "1px solid #c3e6cb",
                      borderRadius: "10px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#155724", fontWeight: "600" }}>
                      ● NOTIFICATION SYSTEM
                    </span>
                    <h4 style={{ margin: "6px 0 2px", color: "#27ae60" }}>Real-Time Dispatch</h4>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Candidate, Employer & Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= CANDIDATE DETAILS MODAL ================= */}
      {selectedCandidate && (
        <div className="modal-overlay" style={{ zIndex: 10005 }}>
          <div className="apply-modal-card" style={{ maxWidth: "620px", textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: "#30203a", fontSize: "20px" }}>
                  Candidate Profile: {selectedCandidate.fullName}
                </h2>
                <span style={{ fontSize: "12px", color: "#777" }}>
                  Account ID: {selectedCandidate._id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
                backgroundColor: "#faf5f9",
                padding: "14px",
                borderRadius: "10px",
              }}
            >
              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>EMAIL</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>{selectedCandidate.email}</p>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>PHONE</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>
                  {selectedCandidate.profile?.phone || "Not provided"}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>LOCATION</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>
                  {selectedCandidate.profile?.location || "Not specified"}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>EXPERIENCE</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>
                  {selectedCandidate.profile?.experience || "Fresher"}
                </p>
              </div>
            </div>

            {/* Resume Link */}
            <div style={{ marginBottom: "16px" }}>
              <strong style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Candidate Resume:
              </strong>
              {selectedCandidate.resumeUrl ? (
                <a
                  href={selectedCandidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#6b2f52",
                    fontWeight: "600",
                    textDecoration: "underline",
                  }}
                >
                  📄 Open Candidate Resume Document ↗
                </a>
              ) : (
                <span style={{ color: "#c0392b", fontSize: "13px" }}>
                  ⚠️ No resume uploaded yet.
                </span>
              )}
            </div>

            {/* Applications submitted */}
            <div>
              <strong style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
                Applications Submitted ({selectedCandidate.applications?.length || 0}):
              </strong>
              {selectedCandidate.applications?.length === 0 ? (
                <p style={{ color: "#777", fontSize: "13px" }}>No applications submitted yet.</p>
              ) : (
                <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                  {selectedCandidate.applications.map((app) => (
                    <div
                      key={app._id}
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "13px",
                      }}
                    >
                      <div>
                        <strong>{app.job?.title || "Job"}</strong> at{" "}
                        <span>{app.job?.company || "Company"}</span>
                        <div style={{ fontSize: "11px", color: "#888" }}>
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="btn-primary"
                style={{ padding: "8px 18px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= COMPANY DETAILS MODAL ================= */}
      {selectedCompany && (
        <div className="modal-overlay" style={{ zIndex: 10005 }}>
          <div className="apply-modal-card" style={{ maxWidth: "620px", textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: "#30203a", fontSize: "20px" }}>
                  Company Profile: {selectedCompany.profile?.companyName || selectedCompany.fullName}
                </h2>
                <span style={{ fontSize: "12px", color: "#777" }}>
                  Employer Account: {selectedCompany.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
                backgroundColor: "#faf5f9",
                padding: "14px",
                borderRadius: "10px",
              }}
            >
              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>INDUSTRY</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>
                  {selectedCompany.profile?.industry || "Technology"}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>LOCATION</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>
                  {selectedCompany.profile?.location || "India"}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>COMPANY SIZE</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>
                  {selectedCompany.profile?.companySize || "50-200 Employees"}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>WEBSITE</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>
                  {selectedCompany.profile?.website ? (
                    <a
                      href={selectedCompany.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#6b2f52", textDecoration: "underline" }}
                    >
                      {selectedCompany.profile.website}
                    </a>
                  ) : (
                    "Not specified"
                  )}
                </p>
              </div>
            </div>

            {/* Jobs Posted */}
            <div>
              <strong style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
                Jobs Posted by this Company ({selectedCompany.jobs?.length || 0}):
              </strong>
              {selectedCompany.jobs?.length === 0 ? (
                <p style={{ color: "#777", fontSize: "13px" }}>No jobs posted yet.</p>
              ) : (
                <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                  {selectedCompany.jobs.map((job) => (
                    <div
                      key={job._id}
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "13px",
                      }}
                    >
                      <div>
                        <strong>{job.title}</strong> · 📍 {job.location} · {job.jobType}
                      </div>
                      <span
                        style={{
                          color: job.status === "Active" ? "#27ae60" : "#777",
                          fontWeight: "600",
                        }}
                      >
                        ● {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="btn-primary"
                style={{ padding: "8px 18px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MESSAGE DETAILS MODAL ================= */}
      {selectedMessage && (
        <div className="modal-overlay" style={{ zIndex: 10005 }}>
          <div className="apply-modal-card" style={{ maxWidth: "600px", textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    backgroundColor: "#faf3f8",
                    color: "#6b2f52",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "inline-block",
                    marginBottom: "4px",
                  }}
                >
                  {selectedMessage.inquiryType}
                </span>
                <h2 style={{ margin: 0, color: "#30203a", fontSize: "18px" }}>
                  {selectedMessage.subject}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
                backgroundColor: "#faf5f9",
                padding: "14px",
                borderRadius: "10px",
              }}
            >
              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>SENDER NAME</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>{selectedMessage.fullName}</p>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>EMAIL ADDRESS</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    style={{ color: "#6b2f52", textDecoration: "underline" }}
                  >
                    {selectedMessage.email}
                  </a>
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>PHONE</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>
                  {selectedMessage.phone || "Not provided"}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "#6b2f52" }}>RECEIVED ON</strong>
                <p style={{ margin: "2px 0 0", fontSize: "14px" }}>
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>
                Message Content:
              </strong>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "14px",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#333",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedMessage.message}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                  selectedMessage.subject
                )}`}
                className="btn-primary"
                style={{
                  padding: "8px 18px",
                  textDecoration: "none",
                  display: "inline-block",
                  fontSize: "13px",
                }}
              >
                ✉ Reply via Email
              </a>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                style={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BLOCK EMPLOYER CONFIRMATION MODAL ================= */}
      {blockingEmployer && (
        <div className="modal-overlay" style={{ zIndex: 10010 }}>
          <div className="apply-modal-card" style={{ maxWidth: "520px", textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <h2 style={{ margin: 0, color: "#cf1322", fontSize: "18px" }}>
                ⚠️ Block Employer Account
              </h2>
              <button
                type="button"
                onClick={() => setBlockingEmployer(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                backgroundColor: "#fff1f0",
                border: "1px solid #ffa39e",
                borderRadius: "8px",
                padding: "12px 14px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#a8071a",
                lineHeight: "1.5",
              }}
            >
              <strong>Security Enforcement:</strong> Blocking <strong>{blockingEmployer.fullName}</strong> ({blockingEmployer.companyName || blockingEmployer.email}) will immediately terminate their ability to log into the portal, post jobs, edit active listings, and review candidate applications.
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                Reason for Blocking:
              </label>
              <textarea
                value={blockReasonInput}
                onChange={(e) => setBlockReasonInput(e.target.value)}
                placeholder="Enter specific policy violation, fraudulent postings, spam, or abuse..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "13px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setBlockingEmployer(null)}
                style={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={blockingLoading}
                onClick={handleConfirmBlockEmployer}
                style={{
                  backgroundColor: "#cf1322",
                  color: "white",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {blockingLoading ? "Blocking Account..." : "Confirm & Block Employer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminDashboard;
