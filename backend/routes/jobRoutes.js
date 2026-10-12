const express = require("express");
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
} = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllJobs);
router.get("/my-jobs", authMiddleware, roleMiddleware("employer", "admin"), getEmployerJobs);
router.get("/:id", getJobById);

// Protected routes (Employer / Admin)
router.post("/", authMiddleware, roleMiddleware("employer", "admin"), createJob);
router.put("/:id", authMiddleware, roleMiddleware("employer", "admin"), updateJob);
router.delete("/:id", authMiddleware, roleMiddleware("employer", "admin"), deleteJob);

module.exports = router;
