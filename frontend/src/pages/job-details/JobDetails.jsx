import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ApplicationStatusBadge from "../../components/ApplicationStatusBadge";
import CompanyLogo from "../../components/CompanyLogo";
import AuthRequiredModal from "../../components/AuthRequiredModal";
import { jobAPI, applicationAPI, profileAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./JobDetails.css";

function JobDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isJobseeker, isEmployer } = useAuth();

  const jobId = searchParams.get("id");

  const [job, setJob] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Application state
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    phone: "",
    resumeUrl: "",
    coverLetter: "",
  });
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  // Resume Requirement state
  const [hasResume, setHasResume] = useState(false);
  const [candidateResumeUrl, setCandidateResumeUrl] = useState("");
  const [showResumeUploadModal, setShowResumeUploadModal] = useState(false);
  const [resumeInput, setResumeInput] = useState({
    title: "My Resume",
    fileUrl: "",
    fileName: "",
  });
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadMsg, setResumeUploadMsg] = useState("");

  // Fetch job details & related company/similar jobs
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError("No job specified. Please select a job from the listing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await jobAPI.getJobById(jobId);
        if (data.success && data.job) {
          setJob(data.job);

          // Fetch company details
          try {
            const compRes = await profileAPI.getCompanyDetails(data.job.company);
            if (compRes.success && compRes.company) {
              setCompanyDetails(compRes.company);
            }
          } catch (cErr) {
            console.warn("Could not load company details:", cErr.message);
          }

          // Fetch similar jobs
          try {
            const simRes = await jobAPI.getAllJobs();
            if (simRes.success && simRes.jobs) {
              const matching = simRes.jobs
                .filter((j) => j._id !== data.job._id && (j.jobType === data.job.jobType || j.company !== data.job.company))
                .slice(0, 3);
              setSimilarJobs(matching);
            }
          } catch (sErr) {
            console.warn("Could not load similar jobs:", sErr.message);
          }
        } else {
          setError(data.message || "Job listing not found.");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(err.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Check application status and resume status for logged-in candidate
  useEffect(() => {
    const checkCandidateStatus = async () => {
      if (isAuthenticated && isJobseeker) {
        // 1. Check existing application for this job
        if (jobId) {
          try {
            const res = await applicationAPI.checkStatus(jobId);
            if (res.success && res.hasApplied) {
              setHasApplied(true);
              setApplicationData(res.application);
            }
          } catch (err) {
            console.warn("Could not check application status:", err.message);
          }
        }

        // 2. Check candidate's resume status
        try {
          const resumeRes = await profileAPI.getCandidateResume();
          if (resumeRes.success && resumeRes.hasResume && resumeRes.resumeUrl) {
            setHasResume(true);
            setCandidateResumeUrl(resumeRes.resumeUrl);
            setApplyForm((prev) => ({
              ...prev,
              resumeUrl: prev.resumeUrl || resumeRes.resumeUrl,
            }));
          } else {
            setHasResume(false);
            setCandidateResumeUrl("");
          }
        } catch (err) {
          console.warn("Could not check resume status:", err.message);
        }
      }
    };

    checkCandidateStatus();
  }, [isAuthenticated, isJobseeker, jobId]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (isEmployer) {
      alert("Employers cannot apply to job postings.");
      return;
    }
    setShowApplyModal(true);
  };

  const handleFormChange = (e) => {
    setApplyForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (applyError) setApplyError("");
  };

  // Local File Reader for Resume
  const handleResumeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate 5 MB file size limit
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setResumeUploadMsg("Resume file size exceeds the 5 MB limit. Please select a smaller file (under 5 MB).");
      e.target.value = "";
      return;
    }

    // Validate file type
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setResumeUploadMsg("Please select a valid document format (.pdf, .doc, or .docx).");
      e.target.value = "";
      return;
    }

    setResumeUploadMsg("");
    const reader = new FileReader();
    reader.onload = () => {
      setResumeInput((prev) => ({
        ...prev,
        fileName: file.name,
        title: file.name,
        fileUrl: reader.result, // Data URL or text
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save / Upload Resume
  const handleSaveResume = async (e) => {
    e.preventDefault();
    if (!resumeInput.fileUrl || !resumeInput.fileUrl.trim()) {
      setResumeUploadMsg("Please select a file or provide a valid resume URL.");
      return;
    }

    setUploadingResume(true);
    setResumeUploadMsg("");

    try {
      const res = await profileAPI.uploadCandidateResume({
        title: resumeInput.title || resumeInput.fileName || "My Resume",
        fileUrl: resumeInput.fileUrl.trim(),
      });

      if (res.success) {
        setHasResume(true);
        setCandidateResumeUrl(res.resumeUrl);
        setApplyForm((prev) => ({
          ...prev,
          resumeUrl: res.resumeUrl,
        }));
        setApplyError("");
        setResumeUploadMsg("✓ Resume uploaded successfully! You can now apply for this job.");

        setTimeout(() => {
          setShowResumeUploadModal(false);
          setResumeUploadMsg("");
        }, 1200);
      } else {
        setResumeUploadMsg(res.message || "Failed to upload resume.");
      }
    } catch (err) {
      setResumeUploadMsg(err.message || "Error uploading resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  // Submit Application with STRICT Resume Verification
  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    // Verify candidate has a resume
    const effectiveResume = (applyForm.resumeUrl || candidateResumeUrl || "").trim();
    if (!effectiveResume) {
      setApplyError(
        "You are not eligible to apply yet. Please upload your resume first. After uploading your resume, you can apply for this job."
      );
      return;
    }

    setApplying(true);
    setApplyError("");

    try {
      const res = await applicationAPI.apply(jobId, {
        ...applyForm,
        resumeUrl: effectiveResume,
      });

      if (res.success) {
        setHasApplied(true);
        setApplicationData(res.application);
        setApplySuccess(true);
        setTimeout(() => {
          setShowApplyModal(false);
          setApplySuccess(false);
        }, 2200);
      } else {
        setApplyError(res.message || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Application submission error:", err);
      setApplyError(err.message || "Could not submit application.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-page-wrapper">
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px 20px", color: "#6b2f52" }}>
          <h2>Loading job details...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-details-page-wrapper">
        <Navbar />
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h2 style={{ color: "#4d244d" }}>Job Not Found</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            {error || "The requested job posting does not exist or has been removed."}
          </p>
          <Link
            to="/jobs"
            style={{
              backgroundColor: "#6b2f52",
              color: "white",
              padding: "10px 22px",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            ← Back to Jobs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="job-details-page-wrapper">
      <Navbar />

      <div className="job-details-page">
        {/* Header */}
        <section className="job-details-header">
          <CompanyLogo company={job.company} size="xl" />

          <div>
            <h1>{job.title}</h1>
            <h2>{job.company}</h2>
            <p>📍 {job.location}</p>
          </div>
        </section>

        {job.status === "Archived" && (
          <div
            style={{
              margin: "0 0 24px 0",
              padding: "16px 22px",
              backgroundColor: "#fffbeb",
              border: "1px solid #fef08a",
              borderLeft: "5px solid #d97706",
              borderRadius: "8px",
              color: "#92400e",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📦</span>
            <div>
              <strong>This job listing has been archived by the employer.</strong>
              <div style={{ fontWeight: "400", fontSize: "13px", color: "#78350f", marginTop: "3px" }}>
                It is no longer accepting new applications, but existing candidate applications are securely preserved.
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="job-details-container">
          {/* Left Side */}
          <main className="job-description">
            <section className="detail-section">
              <h2>Job Description</h2>
              <p className="detail-text">{job.description}</p>
            </section>

            <section className="detail-section">
              <h2>Key Responsibilities</h2>
              <ul className="bullet-list">
                {(job.responsibilities && job.responsibilities.length > 0
                  ? job.responsibilities
                  : [
                      "Collaborate with developers, designers, and product managers to deliver scalable solutions.",
                      "Design, develop, test, deploy, maintain, and enhance application features.",
                      "Write clean, testable, and efficient code adhering to engineering best practices.",
                      "Troubleshoot, debug, and optimize application performance and system latency.",
                      "Participate in code reviews, technical architecture discussions, and sprint planning.",
                    ]
                ).map((item, idx) => (
                  <li key={idx} className="bullet-item">
                    <span className="bullet-icon">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {job.skills && job.skills.length > 0 && (
              <section className="detail-section">
                <h2>Required Skills & Technologies</h2>
                <div className="detail-skills">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="skill-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="detail-section">
              <h2>Qualifications & Requirements</h2>
              <ul className="bullet-list">
                {(job.requirements && job.requirements.length > 0
                  ? job.requirements
                  : [
                      "Bachelor's or Master's degree in Computer Science, IT, or relevant discipline (or equivalent practical experience).",
                      "Hands-on proficiency with the required core technologies and modern software development practices.",
                      "Strong problem-solving mindset, algorithm understanding, and attention to detail.",
                      "Eagerness to learn, adapt to emerging tools, and drive continuous improvement.",
                      "Effective verbal and written communication with a collaborative mindset.",
                    ]
                ).map((item, idx) => (
                  <li key={idx} className="bullet-item">
                    <span className="bullet-icon">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* About the Company Section */}
            <section className="detail-section about-company-box">
              <h2>About {job.company}</h2>
              <div className="company-summary-card">
                <div className="company-summary-header">
                  <CompanyLogo company={job.company} size="lg" />
                  <div>
                    <h3>{companyDetails?.companyName || job.company}</h3>
                    <div className="company-meta-tags">
                      <span>📍 {companyDetails?.location || job.location}</span>
                      <span>🏢 {companyDetails?.industry || "Technology & Software"}</span>
                      {companyDetails?.companySize && (
                        <span>👥 {companyDetails.companySize}</span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="company-desc-text">
                  {companyDetails?.description ||
                    `${job.company} is an established organization known for engineering excellence, progressive work culture, and delivering cutting-edge digital experiences worldwide.`}
                </p>

                <div className="company-actions-row">
                  {companyDetails?.website && (
                    <a
                      href={companyDetails.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="company-link-btn"
                    >
                      Visit Official Website ↗
                    </a>
                  )}
                  <Link
                    to={`/company-details?id=${companyDetails?._id || encodeURIComponent(job.company)}`}
                    className="company-view-profile-btn"
                  >
                    View Company Profile →
                  </Link>
                </div>
              </div>
            </section>

            {/* Similar Jobs Section */}
            {similarJobs.length > 0 && (
              <section className="detail-section similar-jobs-wrapper">
                <h2>Similar Opportunities</h2>
                <div className="similar-jobs-list">
                  {similarJobs.map((simJob) => (
                    <div key={simJob._id} className="similar-job-card">
                      <div className="similar-job-header">
                        <CompanyLogo company={simJob.company} size="sm" />
                        <div>
                          <Link
                            to={`/job-details?id=${simJob._id}`}
                            className="similar-job-title"
                          >
                            {simJob.title}
                          </Link>
                          <span className="similar-job-company">{simJob.company}</span>
                        </div>
                      </div>

                      <div className="similar-job-meta">
                        <span>📍 {simJob.location}</span>
                        <span>💼 {simJob.jobType || "Full Time"}</span>
                        <span>💰 {simJob.salary || "Competitive"}</span>
                      </div>

                      <Link
                        to={`/job-details?id=${simJob._id}`}
                        className="similar-job-action-btn"
                      >
                        View Job →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Right Side */}
          <aside className="job-sidebar">
            <div className="job-summary">
              <h2>Job Overview</h2>

              <div className="summary-item">
                <strong>💼 Employment Type</strong>
                <span>{job.jobType || "Full Time"}</span>
              </div>

              <div className="summary-item">
                <strong>💰 Compensation</strong>
                <span>{job.salary || "Not Disclosed"}</span>
              </div>

              <div className="summary-item">
                <strong>📍 Location</strong>
                <span>{job.location}</span>
              </div>

              <div className="summary-item">
                <strong>🎓 Experience Level</strong>
                <span>{job.experience || "Fresher"}</span>
              </div>

              <div className="summary-item">
                <strong>🏢 Industry</strong>
                <span>{companyDetails?.industry || "Technology"}</span>
              </div>

              <div className="summary-item">
                <strong>📅 Listing Status</strong>
                <span
                  style={{
                    color: job.status === "Active" ? "#27ae60" : "#d97706",
                    fontWeight: "600",
                  }}
                >
                  {job.status === "Active" ? "● Active" : "📦 Archived"}
                </span>
              </div>

              {/* Action / Apply Button */}
              {hasApplied ? (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "#faf3f8",
                    borderRadius: "10px",
                    border: "1px solid #ebd4e4",
                    textAlign: "center",
                  }}
                >
                  <p style={{ margin: "0 0 8px", color: "#4d244d", fontWeight: "600", fontSize: "14px" }}>
                    ✓ You Have Applied
                  </p>
                  <ApplicationStatusBadge status={applicationData?.status || "Applied"} />
                  {job.status === "Archived" && (
                    <p style={{ margin: "10px 0 0", color: "#92400e", fontSize: "11px", fontWeight: "600" }}>
                      📦 Note: This job listing has been archived by the employer.
                    </p>
                  )}
                </div>
              ) : isEmployer ? (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#777",
                  }}
                >
                  🏢 Employer Account View
                </div>
              ) : job.status === "Archived" ? (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "14px",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #fcd34d",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ margin: "0 0 6px", color: "#92400e", fontWeight: "700", fontSize: "13.5px" }}>
                    📦 Job Listing Archived
                  </p>
                  <p style={{ margin: 0, color: "#78350f", fontSize: "12px", lineHeight: "1.4" }}>
                    This position has been archived by the employer and is no longer accepting applications.
                  </p>
                  <button
                    disabled
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#e5e7eb",
                      color: "#6b7280",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "600",
                      cursor: "not-allowed",
                      fontSize: "14px",
                    }}
                  >
                    Applications Closed
                  </button>
                </div>
              ) : (
                <button
                  className="apply-btn"
                  onClick={handleApplyClick}
                  disabled={job.status !== "Active"}
                >
                  Apply Now
                </button>
              )}
            </div>

            {/* Candidate Assurance Card */}
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "12px",
                marginTop: "20px",
                border: "1px solid #eee7eb",
                boxShadow: "0 3px 12px rgba(80, 40, 70, 0.04)",
              }}
            >
              <h4 style={{ margin: "0 0 10px", color: "#30203a", fontSize: "15px" }}>
                🛡️ Verified Job Posting
              </h4>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#666", lineHeight: "1.5" }}>
                Directly posted by {job.company}. Applications undergo secure review and real-time status tracking.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* APPLICATION MODAL */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="apply-modal-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h2 style={{ color: "#4d244d", margin: 0, fontSize: "22px" }}>
                Apply for {job.title}
              </h2>
              <button
                onClick={() => setShowApplyModal(false)}
                style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#888" }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#666", fontSize: "14px", marginTop: 0 }}>
              Company: <strong>{job.company}</strong> · Location: <strong>{job.location}</strong>
            </p>

            {applySuccess ? (
              <div style={{ padding: "30px 20px", textAlign: "center" }}>
                <div className="success-icon-badge" style={{ width: "56px", height: "56px", fontSize: "30px" }}>✓</div>
                <h3 style={{ color: "#27ae60", margin: "10px 0" }}>Application Submitted!</h3>
                <p style={{ color: "#555", fontSize: "14px" }}>
                  Your application has been received by {job.company}. The employer will review your profile and resume.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication}>
                {applyError && (
                  <div className="auth-error-alert" style={{ marginBottom: "14px" }}>
                    <span>⚠️ {applyError}</span>
                  </div>
                )}

                {/* STRICT RESUME REQUIREMENT BANNER (FEATURE 3) */}
                {!hasResume ? (
                  <div
                    style={{
                      backgroundColor: "#fff6f6",
                      border: "1.5px solid #f5c2c7",
                      borderRadius: "10px",
                      padding: "16px",
                      marginBottom: "18px",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ fontSize: "22px" }}>⚠️</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 6px", color: "#c0392b", fontSize: "15px" }}>
                          Resume Required Before Applying
                        </h4>
                        <p style={{ margin: "0 0 12px", color: "#662225", fontSize: "13.5px", lineHeight: "1.45" }}>
                          You are not eligible to apply yet. Please upload your resume first.
                          After uploading your resume, you can apply for this job.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowResumeUploadModal(true)}
                          style={{
                            backgroundColor: "#6b2f52",
                            color: "#ffffff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          📄 Upload Resume
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: "#f4fcf6",
                      border: "1px solid #c3e6cb",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#27ae60", fontSize: "18px" }}>✓</span>
                      <span style={{ fontSize: "13.5px", color: "#155724" }}>
                        Resume verified & ready to submit
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowResumeUploadModal(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#6b2f52",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Update Resume
                    </button>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.fullName || ""}
                    disabled
                    style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={applyForm.phone}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Resume URL / Document Link *
                  </label>
                  <input
                    type="text"
                    name="resumeUrl"
                    placeholder="Upload via button above or provide URL/link"
                    value={applyForm.resumeUrl}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Cover Letter / Notes
                  </label>
                  <textarea
                    name="coverLetter"
                    rows="3"
                    placeholder="Why are you a good fit for this position?"
                    value={applyForm.coverLetter}
                    onChange={handleFormChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {hasResume ? (
                  <button
                    type="submit"
                    className="modal-proceed-btn"
                    disabled={applying}
                  >
                    {applying ? "Submitting Application..." : "Submit Application"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowResumeUploadModal(true)}
                    className="modal-proceed-btn"
                    style={{ background: "linear-gradient(135deg, #a3487d 0%, #6b2f52 100%)" }}
                  >
                    Upload Resume to Continue Application
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD RESUME MODAL */}
      {showResumeUploadModal && (
        <div className="modal-overlay" style={{ zIndex: 10005 }}>
          <div className="apply-modal-card" style={{ maxWidth: "460px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ color: "#30203a", margin: 0, fontSize: "18px", fontWeight: "700" }}>
                📄 Upload Candidate Resume
              </h3>
              <button
                type="button"
                onClick={() => setShowResumeUploadModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#666", fontSize: "13.5px", margin: "0 0 16px" }}>
              Upload your resume document (.pdf, .doc, .docx) or paste a public link to your resume.
            </p>

            {resumeUploadMsg && (
              <div
                style={{
                  backgroundColor: resumeUploadMsg.startsWith("✓") ? "#eafaf1" : "#fdf2f2",
                  color: resumeUploadMsg.startsWith("✓") ? "#27ae60" : "#c0392b",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  marginBottom: "14px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                {resumeUploadMsg}
              </div>
            )}

            <form onSubmit={handleSaveResume}>
              {/* Option A: File Upload */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Choose Resume File (.pdf, .doc, .docx — Max 5 MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px dashed #6b2f52",
                    borderRadius: "8px",
                    backgroundColor: "#faf3f8",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
                {resumeInput.fileName && (
                  <span style={{ fontSize: "12px", color: "#27ae60", marginTop: "4px", display: "block" }}>
                    Selected: {resumeInput.fileName}
                  </span>
                )}
              </div>

              <div style={{ textAlign: "center", margin: "10px 0", color: "#999", fontSize: "12px", fontWeight: "600" }}>
                — OR PASTE LINK —
              </div>

              {/* Option B: Direct URL */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Resume URL (Google Drive / Portfolio)
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/your-resume or hosted link"
                  value={resumeInput.fileUrl.startsWith("data:") ? "" : resumeInput.fileUrl}
                  onChange={(e) =>
                    setResumeInput((prev) => ({
                      ...prev,
                      fileUrl: e.target.value,
                      fileName: "Online Resume Link",
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowResumeUploadModal(false)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f5f5f5",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingResume}
                  style={{
                    flex: 2,
                    padding: "11px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#6b2f52",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {uploadingResume ? "Saving Resume..." : "Save & Verify Resume"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionContext="apply for this job"
      />

      <Footer />
    </div>
  );
}

export default JobDetails;
