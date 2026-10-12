import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JobCard from "./JobCard";
import { jobAPI } from "../services/api";
import "./FeaturedJobs.css";

const DEFAULT_JOBS = [
  {
    company: "Google",
    position: "Software Developer",
    location: "Bangalore, India",
    salary: "₹12 - 18 LPA",
    jobType: "Full Time",
  },
  {
    company: "Microsoft",
    position: "Product Manager",
    location: "Hyderabad, India",
    salary: "₹18 - 28 LPA",
    jobType: "Full Time",
  },
  {
    company: "Amazon",
    position: "Cloud Support Associate",
    location: "Chennai, India",
    salary: "₹10 - 16 LPA",
    jobType: "Full Time",
  },
];

function FeaturedJobs() {
  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const data = await jobAPI.getAllJobs({ limit: 3 });
        if (data.success && data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.warn("Using fallback featured jobs:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  return (
    <section className="featured-section">
      <div className="featured-header">
        <div>
          <span className="featured-pill">HOT OPPORTUNITIES</span>
          <h2>Featured Career Openings</h2>
          <p className="featured-sub">Explore hand-picked roles from top verified engineering teams.</p>
        </div>

        <Link to="/jobs" className="view-all-link">
          View All Available Jobs →
        </Link>
      </div>

      <div className="job-grid">
        {jobs.map((job, idx) => (
          <JobCard key={job._id || job.company + idx} job={job} />
        ))}
      </div>
    </section>
  );
}

export default FeaturedJobs;