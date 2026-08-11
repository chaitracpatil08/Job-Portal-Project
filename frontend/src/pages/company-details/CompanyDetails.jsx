import "./CompanyDetails.css";

function CompanyDetails() {
  return (
    <div className="company-details-page">

      {/* Company Header */}
      <section className="company-details-header">

        <div className="company-details-logo">
          G
        </div>

        <div>
          <h1>Google</h1>
          <p>Technology & Software</p>
          <span>📍 Bangalore, India</span>
        </div>

      </section>

      {/* Main Content */}
      <div className="company-details-container">

        {/* About */}
        <main className="company-about">

          <section>
            <h2>About the Company</h2>

            <p>
              Google is a technology company focused on building products
              and services that help people access information and connect
              with the world.
            </p>

            <p>
              Explore career opportunities and discover roles across
              engineering, design, marketing, business and other fields.
            </p>
          </section>

          {/* Company Information */}
          <section>
            <h2>Company Information</h2>

            <div className="company-info-grid">

              <div>
                <strong>Industry</strong>
                <span>Technology</span>
              </div>

              <div>
                <strong>Company Size</strong>
                <span>10,000+ Employees</span>
              </div>

              <div>
                <strong>Location</strong>
                <span>Bangalore, India</span>
              </div>

              <div>
                <strong>Open Positions</strong>
                <span>120+ Jobs</span>
              </div>

            </div>
          </section>

          {/* Available Jobs */}
          <section>
            <h2>Open Positions</h2>

            <div className="company-job">

              <div>
                <h3>Software Developer</h3>
                <p>📍 Bangalore · 💼 Full Time</p>
              </div>

              <button>View Job</button>

            </div>

            <div className="company-job">

              <div>
                <h3>Frontend Developer</h3>
                <p>📍 Bangalore · 💼 Full Time</p>
              </div>

              <button>View Job</button>

            </div>

          </section>

        </main>

        {/* Sidebar */}
        <aside className="company-sidebar">

          <div className="company-sidebar-card">

            <h2>Company Overview</h2>

            <div>
              <strong>Industry</strong>
              <span>Technology</span>
            </div>

            <div>
              <strong>Employees</strong>
              <span>10,000+</span>
            </div>

            <div>
              <strong>Location</strong>
              <span>Bangalore</span>
            </div>

            <div>
              <strong>Jobs</strong>
              <span>120+</span>
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

export default CompanyDetails;