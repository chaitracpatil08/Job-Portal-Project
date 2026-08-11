import "./JobCard.css";

function JobCard({ job }) {
  return (
    <div className="job-card">

      <div className="job-top">

        <div className="company-logo">
          {job.logo}
        </div>

        <button className="bookmark">
          ♡
        </button>

      </div>

      <h3>{job.company}</h3>

      <p className="job-position">
        {job.position}
      </p>

      <p className="job-location">
        ♧ {job.location}
      </p>

      <div className="job-bottom">

        <span className="job-type">
          Full Time
        </span>

        <span className="salary">
          {job.salary}
        </span>

      </div>

    </div>
  );
}

export default JobCard;