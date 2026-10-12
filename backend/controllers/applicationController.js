const mongoose = require("mongoose");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const Resume = require("../models/Resume");
const CandidateProfile = require("../models/CandidateProfile");

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Candidate / Jobseeker)
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { phone, resumeUrl, coverLetter } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(404).json({
        success: false,
        message: "Job not found. Invalid ID.",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    if (job.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This job listing is no longer accepting applications.",
      });
    }

    // Check if user is the employer of this job
    if (job.employer.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to a job that you posted.",
      });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }

    // STRICT RESUME CHECK: Candidate must have a valid resume uploaded
    let finalResumeUrl = (resumeUrl || "").trim();
    if (!finalResumeUrl) {
      const existingResume = await Resume.findOne({ user: req.user._id });
      if (existingResume && existingResume.fileUrl && existingResume.fileUrl.trim()) {
        finalResumeUrl = existingResume.fileUrl.trim();
      } else {
        const profile = await CandidateProfile.findOne({ user: req.user._id });
        if (profile && profile.resumeUrl && profile.resumeUrl.trim()) {
          finalResumeUrl = profile.resumeUrl.trim();
        }
      }
    }

    if (!finalResumeUrl) {
      return res.status(400).json({
        success: false,
        message: "Resume is required before applying for a job. Please upload your resume first.",
      });
    }

    // Save/sync resume to CandidateProfile and Resume model if needed
    await CandidateProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { resumeUrl: finalResumeUrl } },
      { upsert: true }
    ).catch(() => {});
    await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $set: { user: req.user._id, fileUrl: finalResumeUrl } },
      { upsert: true }
    ).catch(() => {});

    // Create the application
    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: phone || "",
      resumeUrl: finalResumeUrl,
      coverLetter: coverLetter || "",
      status: "Applied",
    });

    // Notify the employer
    await Notification.create({
      recipient: job.employer,
      sender: req.user._id,
      title: "New Application Received",
      message: `A new candidate has applied for your job: ${job.title}. Candidate: ${req.user.fullName}.`,
      type: "new_application",
      link: "/employer/dashboard",
    }).catch((err) => console.warn("Notification error:", err.message));

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      application,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }
    console.error("Error applying for job:", error);
    return res.status(500).json({
      success: false,
      message: "Server error submitting application.",
      error: error.message,
    });
  }
};

// @desc    Check if current candidate has applied to a specific job
// @route   GET /api/applications/check/:jobId
// @access  Private (Candidate)
const checkApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: "Invalid job ID." });
    }

    const application = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    return res.status(200).json({
      success: true,
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking application status.",
      error: error.message,
    });
  }
};

// @desc    Get current candidate's applications
// @route   GET /api/applications/my-applications
// @access  Private (Candidate)
const getCandidateApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate("job", "title company location salary jobType status logo")
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your applications.",
      error: error.message,
    });
  }
};

// @desc    Get applications for jobs posted by current employer
// @route   GET /api/applications/employer-applications
// @access  Private (Employer / Admin)
const getEmployerApplications = async (req, res) => {
  try {
    let jobQuery = {};
    if (req.user.role !== "admin") {
      jobQuery.employer = req.user._id;
    }

    const employerJobs = await Job.find(jobQuery).select("_id");
    const jobIds = employerJobs.map((j) => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job", "title company location jobType salary")
      .populate("candidate", "fullName email")
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Error fetching employer applications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications for your jobs.",
      error: error.message,
    });
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer / Admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowedStatuses = ["Applied", "Shortlisted", "Accepted", "Rejected"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    const application = await Application.findById(id).populate("job");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    // Check permission: must be the employer who posted the job, or admin
    if (
      application.job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this application.",
      });
    }

    application.status = status;
    if (notes !== undefined) application.notes = notes;
    await application.save();

    // Send notification to candidate
    let notifTitle = `Application Status Update`;
    let notifMessage = `Your application for "${application.job.title}" at "${application.job.company}" is now ${status}.`;

    if (status === "Shortlisted") {
      notifTitle = "Application Shortlisted";
      notifMessage = `Congratulations! You have been shortlisted for ${application.job.title} at ${application.job.company}.`;
    } else if (status === "Accepted") {
      notifTitle = "Application Accepted";
      notifMessage = `Congratulations! You have been selected for ${application.job.title} at ${application.job.company}.`;
    } else if (status === "Rejected") {
      notifTitle = "Application Update";
      notifMessage = `Update regarding your application for ${application.job.title} at ${application.job.company}: Your application was not selected at this time.`;
    }

    await Notification.create({
      recipient: application.candidate,
      sender: req.user._id,
      title: notifTitle,
      message: notifMessage,
      type: "application_status",
      link: "/dashboard",
    }).catch((err) => console.warn("Notification error:", err.message));

    return res.status(200).json({
      success: true,
      message: `Application marked as ${status}.`,
      application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update application status.",
      error: error.message,
    });
  }
};

module.exports = {
  applyForJob,
  checkApplicationStatus,
  getCandidateApplications,
  getEmployerApplications,
  updateApplicationStatus,
};
