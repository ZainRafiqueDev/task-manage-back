// routes/projectRoutes.js
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  addProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectDetails,
  deleteProjectDetails,
  addProjectGroup,
  getAllProjectGroups,
  updateProjectGroup,
  deleteProjectGroup,
  addPayment,
  addMilestonePayment,
  addTimeEntry,
  updateClientStatus,
  deletePayment,
  deleteMilestone,
  deleteTimeEntry
} from "../controllers/ProjectController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// -------------------------
// Project CRUD (Admin Only for create/update/delete)
// -------------------------
router.post("/", authorizeRoles("admin"), addProject);              // Create new project
router.get("/", getAllProjects);           // Get all projects (all roles can view)
router.get("/:id", getProjectById);        // Get project by ID
router.put("/:id", authorizeRoles("admin"), updateProject);         // Update project by ID
router.delete("/:id", authorizeRoles("admin"), deleteProject);      // Delete project by ID

// -------------------------
// Project Details CRUD
// -------------------------
router.put("/details/:id", authorizeRoles("admin"), updateProjectDetails);    // Update ProjectDetails
router.delete("/details/:id", authorizeRoles("admin"), deleteProjectDetails); // Delete ProjectDetails

// -------------------------
// Project Group CRUD
// -------------------------
router.post("/groups", authorizeRoles("admin"), addProjectGroup);           // Create project group
router.get("/groups", getAllProjectGroups);       // Get all project groups
router.put("/groups/:id", authorizeRoles("admin"), updateProjectGroup);     // Update project group
router.delete("/groups/:id", authorizeRoles("admin"), deleteProjectGroup);  // Delete project group

// -------------------------
// Project Payments
// -------------------------
router.post("/:projectId/payments", authorizeRoles("admin"), addPayment);                                      // Add general payment
router.delete("/:projectId/payments/:paymentId", authorizeRoles("admin"), deletePayment);                      // Delete payment
router.post("/:projectId/milestones/:milestoneId/payments", authorizeRoles("admin"), addMilestonePayment);     // Add milestone payment

// -------------------------
// Milestones
// -------------------------
router.delete("/:projectId/milestones/:milestoneId", authorizeRoles("admin"), deleteMilestone);                // Delete milestone

// -------------------------
// Hourly Projects / Time Entries
// -------------------------
router.post("/:projectId/time-entries", addTimeEntry);                                                          // Add hourly/time entry
router.delete("/:projectId/time-entries/:timeEntryId", authorizeRoles("admin", "teamlead"), deleteTimeEntry);   // Delete time entry

// -------------------------
// Client Status
// -------------------------
router.patch("/:projectId/client-status", authorizeRoles("admin", "teamlead"), updateClientStatus); // Accept/Reject/Review/Away

export default router;
