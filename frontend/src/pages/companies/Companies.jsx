<Link to="/company-details/google" className="company-btn">
  View Company
</Link>


import "./Companies.css";

function Companies() {
  return (
    <div className="companies-page">

      <section className="companies-header">
        <h1>Explore Top Companies</h1>
        <p>
          Discover companies, explore opportunities and find the right place
          to build your career.
        </p>
      </section>

      <section className="companies-search">
        <input
          type="text"
          placeholder="Search companies..."
        />

        <button>Search</button>
      </section>

      <section className="companies-container">

        <div className="companies-top">
          <h2>Featured Companies</h2>
          <span>6 Companies</span>
        </div>

        <div className="company-grid">

          <div className="company-card">
            <div className="company-card-logo">G</div>

            <h3>Google</h3>
            <p>Technology & Software</p>

            <div className="company-info">
              <span>📍 Bangalore</span>
              <span>💼 120+ Jobs</span>
            </div>

           <Link to="/company-details" className="company-btn">
            View Company
         </Link>
          </div>

          <div className="company-card">
            <div className="company-card-logo">M</div>

            <h3>Microsoft</h3>
            <p>Technology & Software</p>

            <div className="company-info">
              <span>📍 Hyderabad</span>
              <span>💼 95+ Jobs</span>
            </div>

           <Link to="/company-details" className="company-btn">
  View Company
</Link>
          </div>

          <div className="company-card">
            <div className="company-card-logo">A</div>

            <h3>Accenture</h3>
            <p>IT Services & Consulting</p>

            <div className="company-info">
              <span>📍 Bangalore</span>
              <span>💼 80+ Jobs</span>
            </div>

           <Link to="/company-details" className="company-btn">
  View Company
</Link>
          </div>

          <div className="company-card">
            <div className="company-card-logo">A</div>

            <h3>Amazon</h3>
            <p>E-Commerce & Technology</p>

            <div className="company-info">
              <span>📍 Chennai</span>
              <span>💼 110+ Jobs</span>
            </div>

            <Link to="/company-details" className="company-btn">
  View Company
</Link>
          </div>

          <div className="company-card">
            <div className="company-card-logo">I</div>

            <h3>Infosys</h3>
            <p>IT Services & Consulting</p>

            <div className="company-info">
              <span>📍 Pune</span>
              <span>💼 75+ Jobs</span>
            </div>

            <Link to="/company-details" className="company-btn">
  View Company
</Link>
          </div>

          <div className="company-card">
            <div className="company-card-logo">T</div>

            <h3>TCS</h3>
            <p>IT Services & Consulting</p>

            <div className="company-info">
              <span>📍 Mumbai</span>
              <span>💼 90+ Jobs</span>
            </div>

            <Link to="/company-details" className="company-btn">
  View Company
</Link>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Companies;