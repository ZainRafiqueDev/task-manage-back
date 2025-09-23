// routes/taskRoutes.js
import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addEmployeeResponse,
  addLog,
} from "../controllers/TaskController.js"; // ✅ fixed lowercase import
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// Protect all routes
// ==========================
router.use(protect);

// ==========================
// Teamlead-only routes
// ==========================
router.post("/", authorizeRoles("teamlead"), createTask);       // Create a new task
router.put("/:taskId", authorizeRoles("teamlead"), updateTask); // Update task details
router.delete("/:taskId", authorizeRoles("teamlead"), deleteTask); // Delete a task

// ==========================
// Shared routes (Teamlead sees all, employees only their own)
// ==========================
router.get("/", getTasks);          // Get all tasks (role-based filter in controller)
router.get("/:taskId", getTaskById); // Get single task (role-restricted)

// ==========================
// Employee & Teamlead actions
// ==========================
router.post(
  "/:taskId/response",
  authorizeRoles("employee", "teamlead"),
  addEmployeeResponse
); // Add response/progress

router.post(
  "/:taskId/log",
  authorizeRoles("employee", "teamlead"),
  addLog
); // Add time log

export default router;
