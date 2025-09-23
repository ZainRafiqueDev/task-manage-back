import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// Project functions
import { getAssignedProjects } from "../controllers/ProjectController.js";

// Task functions
import { 
  getTasks, 
  getMyAssignedTasks, 
  logTime, 
  markComplete, 
  addEmployeeResponse, 
  addLog 
} from "../controllers/TaskController.js";

// Asset functions
import { getMyAssets, returnAsset } from "../controllers/assetController.js";

// Report functions
import { submitDailyReport, createReport, getMyReports } from "../controllers/reportController.js";

const router = express.Router();

// Protect all routes and ensure only employees can access
router.use(protect, authorizeRoles("employee"));

/* ----------------- PROJECTS ----------------- */
router.get("/projects", getAssignedProjects);

/* ----------------- TASKS ----------------- */
router.get("/tasks", getTasks);
router.get("/tasks/my", getMyAssignedTasks);
router.post("/tasks/:id/log", logTime);
router.post("/tasks/:taskId/log", addLog);
router.put("/tasks/:id/complete", markComplete);
router.post("/tasks/:taskId/response",addEmployeeResponse);

/* ----------------- ASSETS ----------------- */
router.get("/assets", getMyAssets);
router.put("/assets/:assetId/return", returnAsset);

/* ----------------- REPORTS ----------------- */
router.post("/reports", submitDailyReport);
router.post("/reports/create", createReport);
router.get("/reports", getMyReports);

export default router;
