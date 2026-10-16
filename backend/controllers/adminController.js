const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const CandidateProfile = require("../models/CandidateProfile");
const EmployerProfile = require("../models/EmployerProfile");
const Resume = require("../models/Resume");
const ContactMessage = require("../models/ContactMessage");

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({
      role: { $in: ["jobseeker", "candidate"] },
    });
    const totalEmployers = await User.countDocuments({ role: "employer" });
    const totalCompanies = await EmployerProfile.countDocuments();
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: "Active" });
    const archivedJobs = await Job.countDocuments({ status: "Archived" });
    const totalApplications = await Application.countDocuments();
    const blockedEmployers = await User.countDocuments({ role: "employer", isBlocked: true });

    // Application Status Counts
    const appliedCount = await Application.countDocuments({ status: "Applied" });
    const shortlistedCount = await Application.countDocuments({ status: "Shortlisted" });
    const acceptedCount = await Application.countDocuments({ status: "Accepted" });
    const rejectedCount = await Application.countDocuments({ status: "Rejected" });

    // Applications grouped by company
    const applications = await Application.find().populate("job", "title company");
    const companyAppMap = {};
    const candidateAppMap = {};

    applications.forEach((app) => {
      const company = app.job?.company || "Unknown Company";
      if (!companyAppMap[company]) {
        companyAppMap[company] = {
          company,
          total: 0,
          applied: 0,
          shortlisted: 0,
          accepted: 0,
          rejected: 0,
        };
      }
      companyAppMap[company].total += 1;
      const s = (app.status || "Applied").toLowerCase();
      if (companyAppMap[company][s] !== undefined) {
        companyAppMap[company][s] += 1;
      }

      const candKey = app.candidate?.toString() || app.email;
      if (!candidateAppMap[candKey]) {
        candidateAppMap[candKey] = {
          candidateId: app.candidate,
          candidateName: app.fullName,
          candidateEmail: app.email,
          total: 0,
        };
      }
      candidateAppMap[candKey].total += 1;
    });

    const applicationsByCompany = Object.values(companyAppMap).sort(
      (a, b) => b.total - a.total
    );

    const applicationsByCandidate = Object.values(candidateAppMap).sort(
      (a, b) => b.total - a.total
    );

    const recentApplications = await Application.find()
      .populate("job", "title company location")
      .populate("candidate", "fullName email")
      .sort({ appliedAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCandidates,
        totalEmployers,
        totalCompanies,
        totalJobs,
        activeJobs,
        archivedJobs,
        totalApplications,
        blockedEmployers,
        statusBreakdown: {
          applied: appliedCount,
          shortlisted: shortlistedCount,
          accepted: acceptedCount,
          rejected: rejectedCount,
        },
      },
      applicationsByCompany,
      applicationsByCandidate,
      recentApplications,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats.",
      error: error.message,
    });
  }
};

// @desc    Get all candidates with profile & activity monitoring
// @route   GET /api/admin/candidates
// @access  Private (Admin)
const getAllCandidatesAdmin = async (req, res) => {
  try {
    const candidateUsers = await User.find({
      role: { $in: ["jobseeker", "candidate"] },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    const candidates = await Promise.all(
      candidateUsers.map(async (u) => {
        const profile = await CandidateProfile.findOne({ user: u._id });
        const resume = await Resume.findOne({ user: u._id });
        const appCount = await Application.countDocuments({ candidate: u._id });
        const lastApp = await Application.findOne({ candidate: u._id })
          .sort({ appliedAt: -1 })
          .select("appliedAt");

        // Determine activity: user has submitted apps or active login
        const isPlatformActive =
          appCount > 0 ||
          (u.lastActive &&
            new Date().getTime() - new Date(u.lastActive).getTime() <
              30 * 24 * 60 * 60 * 1000);

        return {
          _id: u._id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          isActive: u.isActive !== false,
          lastActive: u.lastActive || u.updatedAt,
          createdAt: u.createdAt,
          headline: profile?.headline || "",
          phone: profile?.phone || "",
          location: profile?.location || "",
          skills: profile?.skills || [],
          experience: profile?.experience || "",
          education: profile?.education || "",
          resumeUrl: profile?.resumeUrl || resume?.fileUrl || "",
          hasResume: Boolean(profile?.resumeUrl || resume?.fileUrl),
          applicationCount: appCount,
          lastAppliedAt: lastApp?.appliedAt || null,
          platformActivity: isPlatformActive ? "Active" : "Inactive",
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    console.error("Error fetching candidates for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidates.",
      error: error.message,
    });
  }
};

// @desc    Get individual candidate details
// @route   GET /api/admin/candidates/:id
// @access  Private (Admin)
const getCandidateDetailsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid candidate ID." });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Candidate not found." });
    }

    const profile = await CandidateProfile.findOne({ user: id });
    const resume = await Resume.findOne({ user: id });
    const applications = await Application.find({ candidate: id })
      .populate("job", "title company location jobType salary")
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      candidate: {
        ...user.toObject(),
        profile: profile || {},
        resume: resume || {},
        resumeUrl: profile?.resumeUrl || resume?.fileUrl || "",
        hasResume: Boolean(profile?.resumeUrl || resume?.fileUrl),
        applications,
        applicationCount: applications.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate details.",
      error: error.message,
    });
  }
};

// @desc    Get all companies/employers with activity & jobs/applications monitoring
// @route   GET /api/admin/companies
// @access  Private (Admin)
const getAllCompaniesAdmin = async (req, res) => {
  try {
    const employerUsers = await User.find({ role: "employer" })
      .select("-password")
      .sort({ createdAt: -1 });

    const companies = await Promise.all(
      employerUsers.map(async (u) => {
        let profile = await EmployerProfile.findOne({ user: u._id });
        if (!profile) {
          profile = {
            companyName: u.fullName,
            email: u.email,
            location: "India",
            industry: "Technology",
            companySize: "50-200 Employees",
          };
        }

        const postedJobs = await Job.find({
          $or: [{ employer: u._id }, { company: profile.companyName }],
        });
        const jobIds = postedJobs.map((j) => j._id);
        const appCount = await Application.countDocuments({ job: { $in: jobIds } });
        const activeJobsCount = postedJobs.filter((j) => j.status === "Active").length;

        // Platform activity: active jobs or applications or recent login
        const isPlatformActive =
          postedJobs.length > 0 ||
          appCount > 0 ||
          (u.lastActive &&
            new Date().getTime() - new Date(u.lastActive).getTime() <
              30 * 24 * 60 * 60 * 1000);

        return {
          _id: u._id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          isActive: u.isActive !== false,
          isBlocked: u.isBlocked === true,
          blockReason: u.blockReason || "",
          lastActive: u.lastActive || u.updatedAt,
          createdAt: u.createdAt,
          companyName: profile.companyName || u.fullName,
          companyEmail: profile.email || u.email,
          phone: profile.phone || "",
          location: profile.location || "India",
          industry: profile.industry || "Technology",
          website: profile.website || "",
          companySize: profile.companySize || "",
          description: profile.description || "",
          totalJobsPosted: postedJobs.length,
          activeJobsPosted: activeJobsCount,
          totalApplicationsReceived: appCount,
          platformActivity: isPlatformActive ? "Active" : "Inactive",
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Error fetching companies for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies.",
      error: error.message,
    });
  }
};

// @desc    Get individual company details
// @route   GET /api/admin/companies/:id
// @access  Private (Admin)
const getCompanyDetailsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid company ID." });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Company not found." });
    }

    const profile = await EmployerProfile.findOne({ user: id });
    const jobs = await Job.find({
      $or: [{ employer: id }, { company: profile?.companyName || user.fullName }],
    }).sort({ createdAt: -1 });

    const jobIds = jobs.map((j) => j._id);
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job", "title")
      .populate("candidate", "fullName email")
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      company: {
        ...user.toObject(),
        profile: profile || {},
        jobs,
        jobCount: jobs.length,
        applications,
        applicationCount: applications.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company details.",
      error: error.message,
    });
  }
};

// @desc    Block employer account (prevents login, job posting, applicant interactions)
// @route   PATCH /api/admin/employers/:id/block
// @access  Private (Admin)
const blockEmployerAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid employer ID." });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block your own administrator account.",
      });
    }

    const employer = await User.findById(id);
    if (!employer) {
      return res.status(404).json({ success: false, message: "Employer not found." });
    }

    if (employer.role !== "employer") {
      return res.status(400).json({
        success: false,
        message: "Only employer accounts can be blocked with this action.",
      });
    }

    employer.isBlocked = true;
    employer.blockReason = (reason && reason.trim()) || "Fraudulent or policy violation";
    employer.isActive = false;
    await employer.save();

    return res.status(200).json({
      success: true,
      message: `Employer "${employer.fullName}" (${employer.email}) has been blocked.`,
      employer: {
        _id: employer._id,
        fullName: employer.fullName,
        email: employer.email,
        isBlocked: employer.isBlocked,
        blockReason: employer.blockReason,
        isActive: employer.isActive,
      },
    });
  } catch (error) {
    console.error("Error blocking employer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to block employer.",
      error: error.message,
    });
  }
};

// @desc    Unblock employer account (restores portal access)
// @route   PATCH /api/admin/employers/:id/unblock
// @access  Private (Admin)
const unblockEmployerAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid employer ID." });
    }

    const employer = await User.findById(id);
    if (!employer) {
      return res.status(404).json({ success: false, message: "Employer not found." });
    }

    employer.isBlocked = false;
    employer.blockReason = "";
    employer.isActive = true;
    await employer.save();

    return res.status(200).json({
      success: true,
      message: `Employer "${employer.fullName}" (${employer.email}) has been unblocked successfully.`,
      employer: {
        _id: employer._id,
        fullName: employer.fullName,
        email: employer.email,
        isBlocked: employer.isBlocked,
        blockReason: employer.blockReason,
        isActive: employer.isActive,
      },
    });
  } catch (error) {
    console.error("Error unblocking employer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unblock employer.",
      error: error.message,
    });
  }
};

// @desc    Toggle user status (Active / Disabled)
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid user ID." });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot disable your own admin account.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.isActive = user.isActive === false ? true : false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? "activated" : "deactivated"} successfully.`,
      isActive: user.isActive,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
      error: error.message,
    });
  }
};

// @desc    Get all users (raw list)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid user ID." });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own admin account.",
      });
    }

    await User.findByIdAndDelete(id);
    await CandidateProfile.deleteOne({ user: id });
    await EmployerProfile.deleteOne({ user: id });
    await Resume.deleteOne({ user: id });
    await Job.deleteMany({ employer: id });
    await Application.deleteMany({ candidate: id });

    return res.status(200).json({
      success: true,
      message: "User and associated records deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
      error: error.message,
    });
  }
};

// @desc    Get all jobs (admin view)
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    const jobsWithCounts = await Promise.all(
      jobs.map(async (j) => {
        const applicantCount = await Application.countDocuments({ job: j._id });
        return {
          ...j.toObject(),
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
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs.",
      error: error.message,
    });
  }
};

// @desc    Get all applications (admin view) with optional filters
// @route   GET /api/admin/applications
// @access  Private (Admin)
const getAllApplicationsAdmin = async (req, res) => {
  try {
    const { status, company } = req.query;

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate("job", "title company location salary jobType")
      .populate("candidate", "fullName email")
      .sort({ appliedAt: -1 });

    const filtered = company
      ? applications.filter(
          (a) =>
            a.job?.company &&
            a.job.company.toLowerCase().includes(company.toLowerCase())
        )
      : applications;

    return res.status(200).json({
      success: true,
      count: filtered.length,
      applications: filtered,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications.",
      error: error.message,
    });
  }
};

// @desc    Get all user contact inquiry messages (admin view)
// @route   GET /api/admin/messages
// @access  Private (Admin)
const getAllMessagesAdmin = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    const unreadCount = messages.filter((m) => !m.read).length;

    return res.status(200).json({
      success: true,
      count: messages.length,
      unreadCount,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages.",
      error: error.message,
    });
  }
};

// @desc    Mark contact message as read
// @route   PATCH /api/admin/messages/:id/read
// @access  Private (Admin)
const markMessageReadAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid message ID." });
    }

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    message.read = true;
    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
      contactMessage: message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update message.",
      error: error.message,
    });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/admin/messages/:id
// @access  Private (Admin)
const deleteMessageAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid message ID." });
    }

    await ContactMessage.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete message.",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllCandidatesAdmin,
  getCandidateDetailsAdmin,
  getAllCompaniesAdmin,
  getCompanyDetailsAdmin,
  toggleUserStatus,
  blockEmployerAdmin,
  unblockEmployerAdmin,
  getAllUsers,
  deleteUser,
  getAllJobsAdmin,
  getAllApplicationsAdmin,
  getAllMessagesAdmin,
  markMessageReadAdmin,
  deleteMessageAdmin,
};
