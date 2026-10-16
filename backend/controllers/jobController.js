const mongoose = require("mongoose");
const Job = require("../models/Job");
const Application = require("../models/Application");

// @desc    Get all jobs with filtering & search
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const { keyword, location, jobType, experience, company, limit } = req.query;

    const query = { status: "Active" };

    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      query.$or = [
        { title: { $regex: kw, $options: "i" } },
        { company: { $regex: kw, $options: "i" } },
        { skills: { $regex: kw, $options: "i" } },
        { description: { $regex: kw, $options: "i" } },
      ];
    }

    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: "i" };
    }

    if (jobType && jobType.trim()) {
      // support "full-time" matching "Full Time"
      const normalizedType = jobType.replace("-", " ").toLowerCase();
      query.jobType = { $regex: new RegExp(`^${normalizedType}$`, "i") };
    }

    if (experience && experience.trim()) {
      if (experience === "fresher") {
        query.experience = "Fresher";
      } else if (experience === "1-3") {
        query.experience = "1-3 Years";
      } else if (experience === "3-plus") {
        query.experience = { $in: ["3+ Years", "5+ Years"] };
      } else {
        query.experience = { $regex: experience.trim(), $options: "i" };
      }
    }

    if (company && company.trim()) {
      query.company = { $regex: company.trim(), $options: "i" };
    }

    const maxLimit = parseInt(limit, 10) || 50;
    const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(maxLimit);

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs.",
      error: error.message,
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Job not found. Invalid ID format.",
      });
    }

    const job = await Job.findById(id).populate("employer", "fullName email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching job details.",
      error: error.message,
    });
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer / Admin)
const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      jobType,
      experience,
      salary,
      skills,
      description,
      responsibilities,
      requirements,
      logo,
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide job title, description, and location.",
      });
    }

    // Parse array fields if passed as comma-separated strings
    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string" && skills.trim()
      ? skills.split(",").map((s) => s.trim())
      : [];

    const parsedResponsibilities = Array.isArray(responsibilities)
      ? responsibilities
      : typeof responsibilities === "string" && responsibilities.trim()
      ? responsibilities.split("\n").map((r) => r.trim()).filter(Boolean)
      : [];

    const parsedRequirements = Array.isArray(requirements)
      ? requirements
      : typeof requirements === "string" && requirements.trim()
      ? requirements.split("\n").map((r) => r.trim()).filter(Boolean)
      : [];

    const job = await Job.create({
      title: title.trim(),
      company: company ? company.trim() : req.user.fullName,
      employer: req.user._id,
      location: location.trim(),
      jobType: jobType || "Full Time",
      experience: experience || "Fresher",
      salary: salary || "Not Disclosed",
      skills: parsedSkills,
      description: description.trim(),
      responsibilities: parsedResponsibilities,
      requirements: parsedRequirements,
      logo: logo || (company ? company[0].toUpperCase() : "💼"),
      status: "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully!",
      job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create job posting.",
      error: error.message,
    });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Employer Owner / Admin)
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Ensure user is owner or admin
    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job.",
      });
    }

    // Parse array fields if strings
    const updateData = { ...req.body };
    if (typeof updateData.skills === "string") {
      updateData.skills = updateData.skills.split(",").map((s) => s.trim());
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Job updated successfully!",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job.",
      error: error.message,
    });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer Owner / Admin)
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Ensure user is owner or admin
    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job.",
      });
    }

    await Job.findByIdAndDelete(id);
    await Application.deleteMany({ job: id });

    return res.status(200).json({
      success: true,
      message: "Job and related applications deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job.",
      error: error.message,
    });
  }
};

// @desc    Get all jobs posted by current employer
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer)
const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });

    // Attach applicant count to each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicantCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      jobs: jobsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching employer jobs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your jobs.",
      error: error.message,
    });
  }
};

// @desc    Update job status (Active / Archived)
// @route   PATCH /api/jobs/:id/status
// @access  Private (Employer Owner / Admin)
const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (!status || !["Active", "Archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be either "Active" or "Archived".',
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Ensure user is owner or admin
    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to change status of this job.",
      });
    }

    job.status = status;
    await job.save();

    const successMsg =
      status === "Active"
        ? "Job has been activated successfully and is now visible to candidates."
        : "Job has been archived successfully and is hidden from candidate listings.";

    return res.status(200).json({
      success: true,
      message: successMsg,
      job,
    });
  } catch (error) {
    console.error("Error updating job status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job status.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  updateJobStatus,
};
