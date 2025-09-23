// routes/reportRoutes.js
import express from "express";
import {
  getReportsForAdmin,
  getMyReports,
  createReport,
  addFeedback,
  updateCompletionStatus,
  getReportsForUser,
  updateReport,
  deleteReport,
  reviewReport,
  submitReport,
  submitDailyReport,
  getUsersForReports,
} from "../controllers/reportController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// ========================
// User Data Routes
// ========================
router.get("/users", authorizeRoles("teamlead", "admin"), getUsersForReports); // Get users for report assignment

// ========================
// Employee & TeamLead
// ========================
router.get("/me", getMyReports);                 // Logged-in user's reports
router.post("/", createReport);                  // Create daily/monthly report
router.put("/:reportId", updateReport);          // Update your own report
router.delete("/:reportId", deleteReport);       // Delete your own report

// ========================
// Daily Reports (Employee)
// ========================
router.post("/daily/submit", authorizeRoles("employee"), submitDailyReport); // Submit daily report

// ========================
// TeamLead & Admin
// ========================
router.get(
  "/user/:userId",
  authorizeRoles("teamlead", "admin"),
  getReportsForUser
); // View reports of a specific user

router.post(
  "/:reportId/feedback",
  authorizeRoles("teamlead", "admin"),
  addFeedback
); // Add feedback to report

router.patch(
  "/:reportId/completion",
  authorizeRoles("teamlead", "admin"),
  updateCompletionStatus
); // Mark report complete/incomplete

router.patch(
  "/:reportId/review",
  authorizeRoles("teamlead", "admin"),
  reviewReport
); // Mark report as reviewed

router.post(
  "/:reportId/submit",
  authorizeRoles("employee", "teamlead", "admin"),
  submitReport
); // Submit report to next level

// ========================
// Admin only
// ========================
router.get("/admin", authorizeRoles("admin"), getReportsForAdmin); // Get all reports (with filters)

export default router;