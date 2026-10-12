const express = require("express");
const {
  applyForJob,
  checkApplicationStatus,
  getCandidateApplications,
  getEmployerApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Candidate application routes
router.post(
  "/apply/:jobId",
  authMiddleware,
  roleMiddleware("jobseeker", "candidate"),
  applyForJob
);

router.get(
  "/check/:jobId",
  authMiddleware,
  roleMiddleware("jobseeker", "candidate"),
  checkApplicationStatus
);

router.get(
  "/my-applications",
  authMiddleware,
  roleMiddleware("jobseeker", "candidate"),
  getCandidateApplications
);

// Employer application routes
router.get(
  "/employer-applications",
  authMiddleware,
  roleMiddleware("employer", "admin"),
  getEmployerApplications
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("employer", "admin"),
  updateApplicationStatus
);

module.exports = router;
