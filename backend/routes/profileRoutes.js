const express = require("express");
const {
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
} = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Candidate profile & resume
router.get("/candidate/me", authMiddleware, getCandidateProfile);
router.put("/candidate/me", authMiddleware, updateCandidateProfile);
router.get("/candidate/resume", authMiddleware, getCandidateResume);
router.post("/candidate/resume", authMiddleware, uploadCandidateResume);

// Employer profile
router.get("/employer/me", authMiddleware, getEmployerProfile);
router.put("/employer/me", authMiddleware, updateEmployerProfile);

// Companies directory (public)
router.get("/companies", getAllCompanies);
router.get("/companies/:id", getCompanyDetails);

// Notifications
router.get("/notifications", authMiddleware, getUserNotifications);
router.patch("/notifications/:id/read", authMiddleware, markNotificationRead);
router.patch("/notifications/read-all", authMiddleware, markAllNotificationsRead);

module.exports = router;
