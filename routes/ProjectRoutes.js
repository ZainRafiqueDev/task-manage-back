// routes/projectRoutes.js
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  addProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectDetails,
  getProjectDetails,
  updateProjectDetails,
  deleteProjectDetails,
  addProjectGroup,
  getAllProjectGroups,
  updateProjectGroup,
  deleteProjectGroup,
  addPayment,
  updatePayment,
  deletePayment,
  addMilestonePayment,
  addTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  updateClientStatus,
  assignTeamLead,
  assignEmployees,
  recalculateProject,
  getAvailableProjects,
  getMyProjects,
  getAssignedProjects,
  pickProject,
  releaseProject
} from "../controllers/ProjectController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// -------------------------
// Team Lead Specific Routes (MUST come before /:id route)
// -------------------------
router.get("/available", authorizeRoles("teamlead"), getAvailableProjects);
router.get("/mine", authorizeRoles("teamlead", "employee"), getMyProjects);  
router.put("/:id/pick", authorizeRoles("teamlead"), pickProject);
router.put("/:id/release", authorizeRoles("teamlead"), releaseProject);

// -------------------------
// Employee Specific Routes
// -------------------------
router.get("/assigned", authorizeRoles("employee"), getAssignedProjects);

// -------------------------
// Project CRUD (Admin/TeamLead access)
// -------------------------
router.post("/", authorizeRoles("admin"), addProject);                        
router.get("/", authorizeRoles("admin", "teamlead"), getAllProjects);         
router.get("/:id", authorizeRoles("admin", "teamlead"), getProjectById);      
router.put("/:id", authorizeRoles("admin"), updateProject);                   
router.delete("/:id", authorizeRoles("admin"), deleteProject);                

// -------------------------
// Team Management Routes
// -------------------------
router.put("/:projectId/teamlead", authorizeRoles("admin"), assignTeamLead);
router.put("/:projectId/employees", authorizeRoles("admin"), assignEmployees);

// -------------------------
// Project Details CRUD
// -------------------------
router.post("/:projectId/details", authorizeRoles("admin"), addProjectDetails);           
router.get("/:projectId/details", authorizeRoles("admin", "teamlead"), getProjectDetails); 
router.put("/details/:detailId", authorizeRoles("admin"), updateProjectDetails);                 
router.delete("/details/:detailId", authorizeRoles("admin"), deleteProjectDetails);              

// -------------------------
// Project Group CRUD
// -------------------------
router.post("/groups", authorizeRoles("admin"), addProjectGroup);           
router.get("/groups", authorizeRoles("admin", "teamlead"), getAllProjectGroups); 
router.put("/groups/:groupId", authorizeRoles("admin"), updateProjectGroup);     
router.delete("/groups/:groupId", authorizeRoles("admin"), deleteProjectGroup);  

// -------------------------
// Milestone Management
// -------------------------
router.post("/:projectId/milestones", authorizeRoles("admin"), addMilestone);                           
router.put("/:projectId/milestones/:milestoneId", authorizeRoles("admin"), updateMilestone);           
router.delete("/:projectId/milestones/:milestoneId", authorizeRoles("admin"), deleteMilestone);        

// -------------------------
// Project Payments
// -------------------------
router.post("/:projectId/payments", authorizeRoles("admin"), addPayment);                                      
router.put("/:projectId/payments/:paymentId", authorizeRoles("admin"), updatePayment);                         
router.delete("/:projectId/payments/:paymentId", authorizeRoles("admin"), deletePayment);                      
router.post("/:projectId/milestones/:milestoneId/payments", authorizeRoles("admin"), addMilestonePayment);     

// -------------------------
// Hourly Projects / Time Entries
// -------------------------
router.post("/:projectId/time-entries", authorizeRoles("admin", "teamlead"), addTimeEntry);                              
router.put("/:projectId/time-entries/:timeEntryId", authorizeRoles("admin", "teamlead"), updateTimeEntry);               
router.delete("/:projectId/time-entries/:timeEntryId", authorizeRoles("admin", "teamlead"), deleteTimeEntry);           

// -------------------------
// Client Status
// -------------------------
router.patch("/:projectId/client-status", authorizeRoles("admin", "teamlead"), updateClientStatus); 

// -------------------------
// Utility Routes
// -------------------------
router.put("/:projectId/recalculate", authorizeRoles("admin"), recalculateProject); 

export default router;