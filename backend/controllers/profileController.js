const mongoose = require("mongoose");
const CandidateProfile = require("../models/CandidateProfile");
const EmployerProfile = require("../models/EmployerProfile");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const Resume = require("../models/Resume");

// ================= CANDIDATE PROFILE =================

const getCandidateProfile = async (req, res) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = await CandidateProfile.create({
        user: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate profile.",
      error: error.message,
    });
  }
};

const updateCandidateProfile = async (req, res) => {
  try {
    const {
      fullName,
      headline,
      phone,
      location,
      skills,
      experience,
      education,
      resumeUrl,
      portfolioUrl,
      bio,
    } = req.body;

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string" && skills.trim()
      ? skills.split(",").map((s) => s.trim())
      : undefined;

    const updateFields = {
      ...(fullName && { fullName }),
      ...(headline !== undefined && { headline }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location }),
      ...(parsedSkills !== undefined && { skills: parsedSkills }),
      ...(experience !== undefined && { experience }),
      ...(education !== undefined && { education }),
      ...(resumeUrl !== undefined && { resumeUrl }),
      ...(portfolioUrl !== undefined && { portfolioUrl }),
      ...(bio !== undefined && { bio }),
    };

    const profile = await CandidateProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      profile,
    });
  } catch (error) {
    console.error("Error updating candidate profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

// ================= EMPLOYER PROFILE =================

const getEmployerProfile = async (req, res) => {
  try {
    let profile = await EmployerProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = await EmployerProfile.create({
        user: req.user._id,
        companyName: req.user.fullName,
        email: req.user.email,
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching employer profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employer profile.",
      error: error.message,
    });
  }
};

const updateEmployerProfile = async (req, res) => {
  try {
    const {
      companyName,
      email,
      phone,
      website,
      location,
      industry,
      companySize,
      description,
      logo,
    } = req.body;

    const updateFields = {
      ...(companyName && { companyName }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(website !== undefined && { website }),
      ...(location !== undefined && { location }),
      ...(industry !== undefined && { industry }),
      ...(companySize !== undefined && { companySize }),
      ...(description !== undefined && { description }),
      ...(logo !== undefined && { logo }),
    };

    const profile = await EmployerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    // If companyName was updated, update employer's active jobs too
    if (companyName) {
      await Job.updateMany(
        { employer: req.user._id },
        { company: companyName }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Company profile updated successfully!",
      profile,
    });
  } catch (error) {
    console.error("Error updating employer profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update company profile.",
      error: error.message,
    });
  }
};

// ================= PUBLIC COMPANIES DIRECTORY =================

const getAllCompanies = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { companyName: { $regex: s, $options: "i" } },
        { industry: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } },
      ];
    }

    const profiles = await EmployerProfile.find(query);

    // Attach active job counts
    const companies = await Promise.all(
      profiles.map(async (cp) => {
        const jobCount = await Job.countDocuments({
          $or: [{ employer: cp.user }, { company: cp.companyName }],
          status: "Active",
        });
        return {
          ...cp.toObject(),
          jobCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies list.",
      error: error.message,
    });
  }
};

const getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    let profile;
    if (mongoose.Types.ObjectId.isValid(id)) {
      profile = await EmployerProfile.findById(id);
    }

    // Also support finding by companyName slug or exact name
    if (!profile) {
      profile = await EmployerProfile.findOne({
        companyName: { $regex: new RegExp(`^${id}$`, "i") },
      });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    // Get active jobs for this company
    const jobs = await Job.find({
      $or: [{ employer: profile.user }, { company: profile.companyName }],
      status: "Active",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      company: {
        ...profile.toObject(),
        jobs,
        jobCount: jobs.length,
      },
    });
  } catch (error) {
    console.error("Error fetching company details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company details.",
      error: error.message,
    });
  }
};

// ================= NOTIFICATIONS =================

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { read: true }
    );
    return res.status(200).json({ success: true, message: "Marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating notification." });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id }, { read: true });
    return res.status(200).json({ success: true, message: "All marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error marking all read." });
  }
};

// ================= RESUME CONTROLLER =================

const getCandidateResume = async (req, res) => {
  try {
    let resume = await Resume.findOne({ user: req.user._id });
    const profile = await CandidateProfile.findOne({ user: req.user._id });

    const fileUrl = resume?.fileUrl || profile?.resumeUrl || "";
    const hasResume = Boolean(fileUrl && fileUrl.trim().length > 0);

    return res.status(200).json({
      success: true,
      hasResume,
      resume: resume || {
        user: req.user._id,
        title: "My Resume",
        fileUrl,
      },
      resumeUrl: fileUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume details.",
      error: error.message,
    });
  }
};

const uploadCandidateResume = async (req, res) => {
  try {
    const { title, fileUrl, summary, skills, experience, education } = req.body;

    if (!fileUrl || !fileUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume file or URL is required.",
      });
    }

    const trimmedUrl = fileUrl.trim();

    // Validate Base64 payload size and MIME type (5 MB limit)
    if (trimmedUrl.startsWith("data:")) {
      const mimeMatch = trimmedUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1].toLowerCase();
        const base64Content = mimeMatch[2];

        // Allowed document formats: PDF, Word DOC, Word DOCX
        const allowedMimeTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/octet-stream",
        ];

        if (!allowedMimeTypes.includes(mimeType)) {
          return res.status(400).json({
            success: false,
            message: "Unsupported file type. Please upload a PDF, DOC, or DOCX document.",
          });
        }

        // Calculate binary byte size
        const padding = base64Content.endsWith("==") ? 2 : base64Content.endsWith("=") ? 1 : 0;
        const sizeInBytes = (base64Content.length * 3) / 4 - padding;
        const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

        if (sizeInBytes > maxSizeBytes) {
          return res.status(400).json({
            success: false,
            message: "Resume file size exceeds the 5 MB limit. Please select a smaller file.",
          });
        }
      }
    }

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string" && skills.trim()
      ? skills.split(",").map((s) => s.trim())
      : [];

    const resume = await Resume.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          user: req.user._id,
          title: title || "My Resume",
          fileUrl: trimmedUrl,
          ...(summary !== undefined && { summary }),
          ...(parsedSkills.length > 0 && { skills: parsedSkills }),
          ...(experience !== undefined && { experience }),
          ...(education !== undefined && { education }),
        },
      },
      { new: true, upsert: true }
    );

    // Keep CandidateProfile in sync
    await CandidateProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { resumeUrl: trimmedUrl } },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Resume uploaded and saved successfully!",
      resume,
      resumeUrl: trimmedUrl,
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload resume.",
      error: error.message,
    });
  }
};

module.exports = {
  getCandidateProfile,
  updateCandidateProfile,
  getEmployerProfile,
  updateEmployerProfile,
  getAllCompanies,
  getCompanyDetails,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getCandidateResume,
  uploadCandidateResume,
};
