import "./JobDetails.css";

function JobDetails() {
  return (
    <div className="job-details-page">

      {/* Header */}
      <section className="job-details-header">
        <div className="job-company-logo">G</div>

        <div>
          <h1>Software Developer</h1>
          <h2>Google</h2>
          <p>📍 Bangalore</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="job-details-container">

        {/* Left Side */}
        <main className="job-description">

          <section>
            <h2>Job Description</h2>
            <p>
              We are looking for a passionate Software Developer to join our
              team. You will work on building scalable applications and
              solving real-world technical problems.
            </p>

            <p>
              You will collaborate with other developers, designers and
              product teams to create high-quality software solutions.
            </p>
          </section>

          <section>
            <h2>Responsibilities</h2>

            <ul>
              <li>Develop and maintain web applications.</li>
              <li>Write clean and efficient code.</li>
              <li>Work with cross-functional teams.</li>
              <li>Debug and fix software issues.</li>
              <li>Participate in code reviews.</li>
            </ul>
          </section>

          <section>
            <h2>Required Skills</h2>

            <div className="detail-skills">
              <span>Java</span>
              <span>React</span>
              <span>SQL</span>
              <span>Git</span>
              <span>REST API</span>
            </div>
          </section>

          <section>
            <h2>Requirements</h2>

            <ul>
              <li>Bachelor's degree in Computer Science or related field.</li>
              <li>Good understanding of programming concepts.</li>
              <li>Strong problem-solving skills.</li>
              <li>Good communication and teamwork skills.</li>
            </ul>
          </section>

        </main>

        {/* Right Side */}
        <aside className="job-sidebar">

          <div className="job-summary">
            <h2>Job Overview</h2>

            <div className="summary-item">
              <strong>💼 Job Type</strong>
              <span>Full Time</span>
            </div>

            <div className="summary-item">
              <strong>💰 Salary</strong>
              <span>₹8 - 12 LPA</span>
            </div>

            <div className="summary-item">
              <strong>📍 Location</strong>
              <span>Bangalore</span>
            </div>

            <div className="summary-item">
              <strong>🎓 Experience</strong>
              <span>Fresher</span>
            </div>

            <div className="summary-item">
              <strong>📅 Posted</strong>
              <span>2 days ago</span>
            </div>

            <button className="apply-btn">
              Apply Now
            </button>
          </div>

        </aside>

      </div>

    </div>
  );
}

export default JobDetails;

