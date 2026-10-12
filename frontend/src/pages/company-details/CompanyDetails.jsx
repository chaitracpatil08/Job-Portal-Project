import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CompanyLogo from "../../components/CompanyLogo";
import { profileAPI, jobAPI } from "../../services/api";
import "./CompanyDetails.css";

function CompanyDetails() {
  const [searchParams] = useSearchParams();
  const companyParam = searchParams.get("id") || "Google";

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const data = await profileAPI.getCompanyDetails(companyParam);
        if (data.success && data.company) {
          setCompany(data.company);
          setJobs(data.company.jobs || []);
        } else {
          // Fallback: search jobs by company name
          const jobsData = await jobAPI.getAllJobs({ company: companyParam });
          setJobs(jobsData.jobs || []);
        }
      } catch (err) {
        console.warn("Could not fetch company details:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyParam]);

  const companyName = company?.companyName || companyParam;
  const companyLogo = company?.logo || companyName[0] || "🏢";
  const companyIndustry = company?.industry || "Technology & Software";
  const companyLocation = company?.location || "Bangalore, India";
  const companySize = company?.companySize || "10,000+ Employees";
  const companyDesc =
    company?.description ||
    `${companyName} is a leading enterprise committed to innovation, engineering excellence, and customer impact worldwide.`;

  return (
    <div className="company-details-page-wrapper">
      <Navbar />

      <div className="company-details-page">
        {/* Company Header */}
        <section className="company-details-header">
          <CompanyLogo company={companyName} size="xl" />

          <div>
            <h1>{companyName}</h1>
            <p>{companyIndustry}</p>
            <span>📍 {companyLocation}</span>
          </div>
        </section>

        {/* Main Content */}
        <div className="company-details-container">
          {/* About */}
          <main className="company-about">
            <section>
              <h2>About {companyName}</h2>
              <p>{companyDesc}</p>
              <p>
                Explore career opportunities and discover roles across
                engineering, design, product, operations, and leadership.
              </p>
            </section>

            {/* Company Information */}
            <section>
              <h2>Company Information</h2>
              <div className="company-info-grid">
                <div>
                  <strong>Industry</strong>
                  <span>{companyIndustry}</span>
                </div>

                <div>
                  <strong>Company Size</strong>
                  <span>{companySize}</span>
                </div>

                <div>
                  <strong>Headquarters</strong>
                  <span>{companyLocation}</span>
                </div>

                <div>
                  <strong>Open Positions</strong>
                  <span>{jobs.length} Active Jobs</span>
                </div>
              </div>
            </section>

            {/* Available Jobs */}
            <section>
              <h2>Open Positions ({jobs.length})</h2>

              {jobs.length === 0 ? (
                <p style={{ color: "#777", fontStyle: "italic" }}>
                  No active openings currently listed for this company.
                </p>
              ) : (
                jobs.map((job) => (
                  <div className="company-job" key={job._id}>
                    <div>
                      <h3>{job.title}</h3>
                      <p>
                        📍 {job.location} · 💼 {job.jobType || "Full Time"} · 💰{" "}
                        {job.salary || "Competitive"}
                      </p>
                    </div>

                    <Link
                      to={`/job-details?id=${job._id}`}
                      style={{
                        backgroundColor: "#6b2f52",
                        color: "white",
                        border: "none",
                        borderRadius: "7px",
                        padding: "10px 18px",
                        cursor: "pointer",
                        textDecoration: "none",
                        fontSize: "14px",
                        display: "inline-block",
                      }}
                    >
                      View Job
                    </Link>
                  </div>
                ))
              )}
            </section>
          </main>

          {/* Sidebar */}
          <aside className="company-sidebar">
            <div className="company-sidebar-card">
              <h2>Company Overview</h2>

              <div>
                <strong>Industry</strong>
                <span>{companyIndustry}</span>
              </div>

              <div>
                <strong>Employees</strong>
                <span>{companySize}</span>
              </div>

              <div>
                <strong>Location</strong>
                <span>{companyLocation}</span>
              </div>

              <div>
                <strong>Active Jobs</strong>
                <span>{jobs.length}</span>
              </div>

              {company?.website && (
                <div>
                  <strong>Website</strong>
                  <span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#6b2f52" }}
                    >
                      {company.website}
                    </a>
                  </span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CompanyDetails;