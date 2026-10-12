const express = require("express");
const {
  getDashboardStats,
  getAllCandidatesAdmin,
  getCandidateDetailsAdmin,
  getAllCompaniesAdmin,
  getCompanyDetailsAdmin,
  blockEmployerAdmin,
  unblockEmployerAdmin,
  toggleUserStatus,
  getAllUsers,
  deleteUser,
  getAllJobsAdmin,
  getAllApplicationsAdmin,
  getAllMessagesAdmin,
  markMessageReadAdmin,
  deleteMessageAdmin,
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply auth and admin role check to all routes in this router
router.use(authMiddleware, roleMiddleware("admin"));

// Dashboard Statistics & Activity Monitoring
router.get("/stats", getDashboardStats);

// Candidate Management
router.get("/candidates", getAllCandidatesAdmin);
router.get("/candidates/:id", getCandidateDetailsAdmin);

// Company / Employer Management
router.get("/companies", getAllCompaniesAdmin);
router.get("/companies/:id", getCompanyDetailsAdmin);
router.patch("/employers/:id/block", blockEmployerAdmin);
router.patch("/employers/:id/unblock", unblockEmployerAdmin);

// User Controls (Toggle Active/Disabled, Delete)
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Job & Application Monitoring
router.get("/jobs", getAllJobsAdmin);
router.get("/applications", getAllApplicationsAdmin);

// Contact Inquiries / Messages Monitoring
router.get("/messages", getAllMessagesAdmin);
router.patch("/messages/:id/read", markMessageReadAdmin);
router.delete("/messages/:id", deleteMessageAdmin);

module.exports = router;
