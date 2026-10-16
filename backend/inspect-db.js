const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");
const CandidateProfile = require("./models/CandidateProfile");
const EmployerProfile = require("./models/EmployerProfile");
const Resume = require("./models/Resume");

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/JobPortalData");

  const totalUsers = await User.countDocuments();
  const candidates = await User.find({ role: { $in: ["jobseeker", "candidate"] } }, "fullName email role");
  const employers = await User.find({ role: "employer" }, "fullName email role isBlocked");
  const admins = await User.find({ role: "admin" }, "fullName email role");
  const totalJobs = await Job.countDocuments();
  const activeJobs = await Job.countDocuments({ status: "Active" });
  const archivedJobs = await Job.countDocuments({ status: { $in: ["Archived", "Closed"] } });
  const applications = await Application.countDocuments();
  const resumes = await Resume.countDocuments();

  console.log("=== DB SUMMARY ===");
  console.log("Total Users:", totalUsers);
  console.log("Candidates count:", candidates.length);
  console.log("Employers count:", employers.length);
  console.log("Admins count:", admins.length);
  console.log("Total Jobs:", totalJobs, "| Active:", activeJobs, "| Archived/Closed:", archivedJobs);
  console.log("Applications:", applications);
  console.log("Resumes:", resumes);

  console.log("\n=== CANDIDATES ===");
  candidates.forEach((c) => console.log(`- ${c.fullName} (${c.email})`));

  console.log("\n=== CHECKING DUPLICATE JOBS ===");
  const allJobs = await Job.find({}, "title company location salary status");
  const jobMap = {};
  allJobs.forEach((j) => {
    const key = `${j.title.toLowerCase().trim()}_${j.company.toLowerCase().trim()}`;
    jobMap[key] = (jobMap[key] || 0) + 1;
  });
  const duplicates = Object.entries(jobMap).filter(([k, v]) => v > 1);
  console.log("Duplicate job definitions count:", duplicates.length);
  duplicates.forEach(([k, v]) => console.log(`  Duplicate: "${k}" -> count: ${v}`));

  await mongoose.disconnect();
}

inspect().catch(console.error);
