import { Link } from "react-router-dom";
import "./Jobs.css";

function Jobs() {
  return (
    <div className="jobs-page">

      {/* Page Header */}
      <section className="jobs-header">
        <h1>Find Your Dream Job</h1>
        <p>
          Explore thousands of opportunities and find the right job for you.
        </p>
      </section>

      {/* Search Section */}
      <section className="jobs-search">
        <input
          type="text"
          placeholder="Search jobs by title, skill or keyword"
        />

        <input
          type="text"
          placeholder="Location"
        />

        <button>Search Jobs</button>
      </section>

      {/* Main Content */}
      <section className="jobs-content">

        {/* Filters */}
        <aside className="filters">
  <h2>Filter Jobs</h2>

  <label>Job Type</label>

  <div>
    <input
      type="radio"
      name="jobType"
      value="full-time"
    />
    Full Time
  </div>

  <div>
    <input
      type="radio"
      name="jobType"
      value="part-time"
    />
    Part Time
  </div>

  <div>
    <input
      type="radio"
      name="jobType"
      value="internship"
    />
    Internship
  </div>

  <label>Experience</label>

  <div>
    <input
      type="radio"
      name="experience"
      value="fresher"
    />
    Fresher
  </div>

  <div>
    <input
      type="radio"
      name="experience"
      value="1-3"
    />
    1-3 Years
  </div>

  <div>
    <input
      type="radio"
      name="experience"
      value="3-plus"
    />
    3+ Years
  </div>
</aside>

        {/* Job Listings */}
        <div className="job-list">

          <div className="jobs-top">
            <h2>Available Jobs</h2>
            <span>120+ Jobs</span>
          </div>

          {/* Job Card 1 */}
          <div className="job-card">
            <div className="company-logo">G</div>

            <div className="job-info">
              <h3>Software Developer</h3>
              <p className="company-name">Google</p>

              <div className="job-details">
                <span>📍 Bangalore</span>
                <span>💼 Full Time</span>
                <span>💰 ₹8 - 12 LPA</span>
              </div>

              <div className="skills">
                <span>Java</span>
                <span>React</span>
                <span>SQL</span>
              </div>
            </div>

            <Link to="/job-details" className="view-job-btn">
              View Job
            </Link>
          </div>

          {/* Job Card 2 */}
          <div className="job-card">
            <div className="company-logo">A</div>

            <div className="job-info">
              <h3>Frontend Developer</h3>
              <p className="company-name">Accenture</p>

              <div className="job-details">
                <span>📍 Bangalore</span>
                <span>💼 Full Time</span>
                <span>💰 ₹5 - 8 LPA</span>
              </div>

              <div className="skills">
                <span>HTML</span>
                <span>CSS</span>
                <span>JavaScript</span>
              </div>
            </div>

            <Link to="/job-details" className="view-job-btn">
              View Job
            </Link>
          </div>

          {/* Job Card 3 */}
          <div className="job-card">
            <div className="company-logo">M</div>

            <div className="job-info">
              <h3>Java Developer</h3>
              <p className="company-name">Microsoft</p>

              <div className="job-details">
                <span>📍 Hyderabad</span>
                <span>💼 Full Time</span>
                <span>💰 ₹7 - 11 LPA</span>
              </div>

              <div className="skills">
                <span>Java</span>
                <span>Spring Boot</span>
                <span>MySQL</span>
              </div>
            </div>

            <Link to="/job-details" className="view-job-btn">
              View Job
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Jobs;

