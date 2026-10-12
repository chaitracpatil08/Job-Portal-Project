import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CompanyLogo from "../../components/CompanyLogo";
import { profileAPI } from "../../services/api";
import "./Companies.css";

const DEFAULT_COMPANIES = [
  {
    companyName: "Google",
    industry: "Technology & Software",
    location: "Bangalore, India",
    jobCount: 2,
    logo: "G",
  },
  {
    companyName: "Microsoft",
    industry: "Technology & Software",
    location: "Hyderabad, India",
    jobCount: 2,
    logo: "M",
  },
  {
    companyName: "Accenture",
    industry: "IT Services & Consulting",
    location: "Bangalore, India",
    jobCount: 1,
    logo: "A",
  },
  {
    companyName: "Amazon",
    industry: "E-Commerce & Cloud",
    location: "Chennai, India",
    jobCount: 1,
    logo: "A",
  },
  {
    companyName: "Infosys",
    industry: "IT Services & Consulting",
    location: "Pune, India",
    jobCount: 1,
    logo: "I",
  },
  {
    companyName: "TCS",
    industry: "IT Services & Consulting",
    location: "Mumbai, India",
    jobCount: 1,
    logo: "T",
  },
];

function Companies() {
  const [companies, setCompanies] = useState(DEFAULT_COMPANIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async (search = "") => {
    setLoading(true);
    try {
      const data = await profileAPI.getAllCompanies(search);
      if (data.success && data.companies && data.companies.length > 0) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.warn("Using fallback companies:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(searchTerm);
  };

  return (
    <div className="companies-page-wrapper">
      <Navbar />

      <div className="companies-page">
        <section className="companies-header">
          <h1>Explore Top Companies</h1>
          <p>
            Discover companies, explore opportunities and find the right place
            to build your career.
          </p>
        </section>

        <form className="companies-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search companies by name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button type="submit">Search</button>
        </form>

        <section className="companies-container">
          <div className="companies-top">
            <h2>Featured Companies</h2>
            <span>{companies.length} Companies</span>
          </div>

          <div className="company-grid">
            {companies.map((comp, idx) => (
              <div className="company-card" key={comp._id || comp.companyName + idx}>
                <div className="company-card-top">
                  <CompanyLogo company={comp.companyName} size="lg" />
                  <span className="company-verified-chip">✓ Verified</span>
                </div>

                <h3 className="company-card-title">{comp.companyName}</h3>
                <span className="company-industry-tag">
                  {comp.industry || "Technology & Services"}
                </span>

                <div className="company-info-row">
                  <span className="company-info-pill">📍 {comp.location || "India"}</span>
                  <span className="company-info-pill hiring">
                    💼 {comp.jobCount || 0} Open Roles
                  </span>
                </div>

                {comp.description && (
                  <p className="company-card-snippet">
                    {comp.description.length > 95
                      ? `${comp.description.substring(0, 95)}...`
                      : comp.description}
                  </p>
                )}

                <Link
                  to={`/company-details?id=${comp._id || encodeURIComponent(comp.companyName)}`}
                  className="company-btn"
                >
                  View Company & Jobs →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Companies;