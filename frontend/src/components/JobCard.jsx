import React, { useState } from "react";
import { Link } from "react-router-dom";
import CompanyLogo from "./CompanyLogo";
import "./JobCard.css";

function JobCard({ job }) {
  const [bookmarked, setBookmarked] = useState(false);

  const jobTitle = job.title || job.position || "Job Opportunity";
  const jobCompany = job.company || "Company";
  const jobLocation = job.location || "Multiple Locations";
  const jobSalary = job.salary || "Competitive";
  const jobType = job.jobType || "Full Time";
  const jobId = job._id;

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const cardContent = (
    <div className="job-card">
      <div className="job-top">
        <CompanyLogo company={jobCompany} size="md" />
        <button
          className={`bookmark-btn ${bookmarked ? "bookmarked" : ""}`}
          type="button"
          onClick={handleBookmark}
          title={bookmarked ? "Saved" : "Save Job"}
          aria-label="Save Job"
        >
          {bookmarked ? "❤️" : "🤍"}
        </button>
      </div>

      <h3 className="job-company-title">{jobCompany}</h3>

      <p className="job-position">{jobTitle}</p>

      <p className="job-location">📍 {jobLocation}</p>

      <div className="job-bottom">
        <span className="job-type">{jobType}</span>
        <span className="salary">{jobSalary}</span>
      </div>

      <div className="job-card-hover-action">
        <span>View Details & Apply →</span>
      </div>
    </div>
  );

  if (jobId) {
    return (
      <Link
        to={`/job-details?id=${jobId}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default JobCard;