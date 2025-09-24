import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// Project functions
import {
  getMyProjects,
  pickProject,
  getAvailableProjects,
  releaseProject
} from "../controllers/ProjectController.js";

// Team / User functions
import {
  getAllUsersFiltered,
  getEmployees,
  assignTeam,
  removeFromTeam,
  getMyTeam
} from "../controllers/userController.js";

// Task functions
import { assignTask, reassignTask, getMyAssignedTasks } from "../controllers/TaskController.js";

// Report functions
import { submitReport, getReportsForUser, reviewReport, addFeedback } from "../controllers/reportController.js";

// Notification functions
import { sendNotification, sendNotificationToEmployees } from "../controllers/notifcationController.js";

const router = express.Router();

// Protect all routes and ensure only team leads can access
router.use(protect, authorizeRoles("teamlead"));

/* ----------------- PROJECTS ----------------- */
// Get all available projects that teamleads can pick
router.get("/projects/available", getAvailableProjects);

// Get projects assigned to the logged-in teamlead
router.get("/projects/mine", getMyProjects);

// Alternative route for backward compatibility
router.get("/projects", getAvailableProjects);

// Pick/claim a project
router.put("/projects/:projectId/pick", pickProject);

// Release a project (give up ownership)
router.put("/projects/:projectId/release", releaseProject);

/* ----------------- TEAM MEMBERS ----------------- */
// Get filtered users (teamlead sees only employees)
router.get("/users", getAllUsersFiltered);

// Get employees list (all available employees)
router.get("/employees", getEmployees);

// Get teamlead's own team members
router.get("/my-team", getMyTeam);

// Assign employees to teamlead's team
router.post("/assign-team", assignTeam);

// Remove employees from teamlead's team
router.post("/remove-team", removeFromTeam);

/* ----------------- TASKS ----------------- */
router.post("/tasks", assignTask);                       // Assign a new task
router.put("/tasks/:id/reassign", reassignTask);         // Reassign an existing task
router.get("/tasks/mine", getMyAssignedTasks);          // Tasks created by this team lead

/* ----------------- REPORTS ----------------- */
router.post("/reports", submitReport);                   // Submit team lead's own report
router.get("/reports/:employeeId", getReportsForUser); // View reports of a specific employee
router.put("/reports/:reportId/review", reviewReport);  // Mark report as reviewed
router.put("/reports/:reportId/feedback", addFeedback);// Give feedback separately

/* ----------------- NOTIFICATIONS ----------------- */
router.post("/notify", sendNotification);               // Notify a single admin/user
router.post("/notify/employees", sendNotificationToEmployees); // Bulk notify employees

export default router;

// In TeamLeadProjectsTab.js



// In TeamLeadProjectsTab.js





