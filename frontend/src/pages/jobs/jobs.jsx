import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CompanyLogo from "../../components/CompanyLogo";
import AuthRequiredModal from "../../components/AuthRequiredModal";
import { useAuth } from "../../context/AuthContext";
import { jobAPI } from "../../services/api";
import "./Jobs.css";

function Jobs() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "");
  const [experience, setExperience] = useState(searchParams.get("experience") || "");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionContext, setAuthActionContext] = useState("filter jobs");

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (location.trim()) params.location = location.trim();
      if (jobType) params.jobType = jobType;
      if (experience) params.experience = experience;

      const data = await jobAPI.getAllJobs(params);
      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        setError("Could not load jobs.");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [jobType, experience]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthActionContext("search for jobs");
      setShowAuthModal(true);
      return;
    }
    // Update URL params
    const newParams = new URLSearchParams();
    if (keyword.trim()) newParams.set("keyword", keyword.trim());
    if (location.trim()) newParams.set("location", location.trim());
    if (jobType) newParams.set("jobType", jobType);
    if (experience) newParams.set("experience", experience);
    setSearchParams(newParams);

    fetchJobs();
  };

  const handleFilterSelect = (type, value) => {
    if (!isAuthenticated) {
      setAuthActionContext("filter jobs");
      setShowAuthModal(true);
      return;
    }
    if (type === "jobType") setJobType(value);
    if (type === "experience") setExperience(value);
  };

  const handleResetFilters = () => {
    if (!isAuthenticated) {
      setAuthActionContext("filter jobs");
      setShowAuthModal(true);
      return;
    }
    setKeyword("");
    setLocation("");
    setJobType("");
    setExperience("");
    setSearchParams({});
    setTimeout(() => {
      jobAPI.getAllJobs().then((data) => {
        if (data.success) setJobs(data.jobs || []);
      });
    }, 50);
  };

  return (
    <div className="jobs-page-wrapper">
      <Navbar />

      <div className="jobs-page">
        {/* Page Header */}
        <section className="jobs-header">
          <h1>Find Your Dream Job</h1>
          <p>Explore verified opportunities from top companies.</p>
        </section>

        {/* Search Section */}
        <form className="jobs-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search jobs by title, skill or keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button type="submit">Search Jobs</button>
        </form>

        {/* Main Content */}
        <section className="jobs-content">
          {/* Filters Sidebar */}
          <aside className="filters">
            <div className="filters-header">
              <h3>Filter Jobs</h3>
              {(jobType || experience || keyword || location) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="filters-reset-btn"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="filter-section">
              <h4 className="filter-group-title">Employment Type</h4>
              <div className="filter-options">
                {[
                  { val: "", label: "All Types" },
                  { val: "full-time", label: "Full Time" },
                  { val: "part-time", label: "Part Time" },
                  { val: "internship", label: "Internship" },
                ].map((opt) => (
                  <div
                    key={opt.val}
                    className={`filter-option ${jobType === opt.val ? "active" : ""}`}
                    onClick={() => handleFilterSelect("jobType", opt.val)}
                  >
                    <input
                      type="radio"
                      name="jobType"
                      value={opt.val}
                      checked={jobType === opt.val}
                      onChange={() => {}}
                    />
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4 className="filter-group-title">Experience Level</h4>
              <div className="filter-options">
                {[
                  { val: "", label: "All Levels" },
                  { val: "fresher", label: "Fresher" },
                  { val: "1-3", label: "1-3 Years" },
                  { val: "3-plus", label: "3+ Years" },
                ].map((opt) => (
                  <div
                    key={opt.val}
                    className={`filter-option ${experience === opt.val ? "active" : ""}`}
                    onClick={() => handleFilterSelect("experience", opt.val)}
                  >
                    <input
                      type="radio"
                      name="experience"
                      value={opt.val}
                      checked={experience === opt.val}
                      onChange={() => {}}
                    />
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Job Listings */}
          <div className="job-list">
            <div className="jobs-top">
              <h2>Available Jobs</h2>
              <span>{jobs.length} Jobs found</span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6b2f52" }}>
                <p>Loading available jobs...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#c0392b" }}>
                <p>{error}</p>
                <button
                  onClick={fetchJobs}
                  style={{
                    backgroundColor: "#6b2f52",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  Retry
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px dashed #ddd",
                }}
              >
                <span style={{ fontSize: "36px" }}>🔍</span>
                <h3 style={{ color: "#30203a", margin: "10px 0" }}>No jobs found</h3>
                <p style={{ color: "#666", fontSize: "14px" }}>
                  Try adjusting your search keywords or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  style={{
                    backgroundColor: "#6b2f52",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginTop: "12px",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              jobs.map((job) => (
                <div className="job-card" key={job._id}>
                  <div className="job-card-header">
                    <div className="job-card-header-left">
                      <CompanyLogo company={job.company} size="md" />
                      <div className="job-title-group">
                        <Link to={`/job-details?id=${job._id}`} className="job-title-link">
                          <h3 className="job-title">{job.title}</h3>
                        </Link>
                        <div className="job-company-row">
                          <span className="job-company-name">{job.company}</span>
                          <span className="job-verified-tag">✓ Verified</span>
                        </div>
                      </div>
                    </div>

                    <Link to={`/job-details?id=${job._id}`} className="view-job-btn">
                      View Job →
                    </Link>
                  </div>

                  <div className="job-meta-chips">
                    <span className="meta-chip">
                      <span className="meta-chip-icon">💼</span>
                      <span>{job.jobType || "Full Time"}</span>
                    </span>
                    <span className="meta-chip">
                      <span className="meta-chip-icon">📍</span>
                      <span>{job.location}</span>
                    </span>
                    <span className="meta-chip">
                      <span className="meta-chip-icon">💰</span>
                      <span>{job.salary || "Competitive"}</span>
                    </span>
                    <span className="meta-chip">
                      <span className="meta-chip-icon">🎓</span>
                      <span>{job.experience || "Fresher"}</span>
                    </span>
                  </div>

                  {job.description && (
                    <p className="job-snippet">
                      {job.description.length > 160
                        ? `${job.description.substring(0, 160)}...`
                        : job.description}
                    </p>
                  )}

                  <div className="job-card-footer">
                    <div className="job-skills-list">
                      {job.skills && job.skills.length > 0
                        ? job.skills.slice(0, 5).map((skill, i) => (
                            <span key={i} className="skill-pill">
                              {skill}
                            </span>
                          ))
                        : null}
                    </div>

                    <div className="job-footer-status">
                      <span className="active-hiring-indicator">● Actively Hiring</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionContext={authActionContext}
      />

      <Footer />
    </div>
  );
}

export default Jobs;
