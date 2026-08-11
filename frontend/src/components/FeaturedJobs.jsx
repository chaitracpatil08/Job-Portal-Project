import JobCard from "./JobCard";
import "./FeaturedJobs.css";

function FeaturedJobs() {
  const jobs = [
    {
      company: "Google",
      position: "Software Engineer",
      location: "Bangalore, India",
      salary: "₹12 - 18 LPA",
      logo: "G",
    },
    {
      company: "Microsoft",
      position: "Product Manager",
      location: "Hyderabad, India",
      salary: "₹15 - 25 LPA",
      logo: "▦",
    },
    {
      company: "Amazon",
      position: "Frontend Developer",
      location: "Mumbai, India",
      salary: "₹10 - 16 LPA",
      logo: "a",
    },
  ];

  return (
    <section className="featured-section">

      <div className="featured-header">
        <h2>Featured Jobs</h2>

        <a href="#">
          View All Jobs →
        </a>
      </div>

      <div className="job-grid">
        {jobs.map((job) => (
          <JobCard
            key={job.company}
            job={job}
          />
        ))}
      </div>

    </section>
  );
}

export default FeaturedJobs;