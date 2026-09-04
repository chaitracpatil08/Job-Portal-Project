
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">

      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back! 👋</h1>
          <p>
            Here's what's happening with your job search today.
          </p>
        </div>

        <div className="dashboard-actions">

          <button
            className="browse-btn"
            onClick={() => navigate("/jobs")}
          >
            + Browse Jobs
          </button>

          <button
            className="logout-btn"
            onClick={() => navigate("/")}
          >
            Logout
          </button>

        </div>
      </div>


      {/* Statistics */}
      <div className="dashboard-stats">

        <div className="stat-box">
          <div className="stat-icon">💼</div>

          <div>
            <span>Applications</span>
            <h2>0</h2>
          </div>
        </div>


        <div className="stat-box">
          <div className="stat-icon">🔖</div>

          <div>
            <span>Saved Jobs</span>
            <h2>0</h2>
          </div>
        </div>


        <div className="stat-box">
          <div className="stat-icon">👀</div>

          <div>
            <span>Jobs Viewed</span>
            <h2>0</h2>
          </div>
        </div>


        <div className="stat-box">
          <div className="stat-icon">📄</div>

          <div>
            <span>Profile Status</span>
            <h2>0%</h2>
          </div>
        </div>

      </div>


      {/* Main Dashboard Content */}
      <div className="dashboard-content">


        {/* My Applications */}
        <div className="dashboard-section applications-section">

          <div className="section-heading">

            <div>
              <h2>My Applications</h2>

              <p>
                Track your recent job applications
              </p>
            </div>

            <button
              className="view-all-btn"
              onClick={() => navigate("/applications")}
            >
              View All
            </button>

          </div>


          <div className="empty-state">

            <div className="empty-icon">
              📋
            </div>

            <h3>No applications yet</h3>

            <p>
              Start applying for jobs and track your
              applications here.
            </p>

            <button
              className="primary-btn"
              onClick={() => navigate("/jobs")}
            >
              Find Jobs
            </button>

          </div>

        </div>



        {/* My Profile */}
        <div className="dashboard-section profile-section">

          <div className="section-heading">

            <div>
              <h2>My Profile</h2>

              <p>
                Complete your profile to get noticed
              </p>
            </div>

            <button
              className="view-all-btn"
              onClick={() => navigate("/profile")}
            >
              View
            </button>

          </div>


          <div className="profile-progress">

            <div className="profile-circle">
              0%
            </div>


            <div className="profile-info">

              <h3>
                Complete your profile
              </h3>

              <p>
                Add your skills, education and
                experience to improve your chances
                of getting hired.
              </p>

              <button
                className="primary-btn"
                onClick={() => navigate("/profile")}
              >
                Complete Profile
              </button>

            </div>

          </div>

        </div>

      </div>



      {/* Recommended Jobs */}
      <div className="recommended-section">

        <div className="section-heading">

          <div>
            <h2>Recommended Jobs</h2>

            <p>
              Jobs that might be a good match for you
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() => navigate("/jobs")}
          >
            View All Jobs
          </button>

        </div>


        <div className="job-placeholder">

          <div className="placeholder-icon">
            🔍
          </div>

          <h3>
            Find your next opportunity
          </h3>

          <p>
            Explore the latest jobs and find the
            perfect opportunity for your career.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/jobs")}
          >
            Explore Jobs
          </button>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
