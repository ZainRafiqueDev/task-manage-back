// routes/notificationRoutes.js
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  // Core notification operations
  sendNotification,
  getMyNotifications,
  getUnreadNotifications,
  markRead,
  markUnread,
  updateNotification,
  deleteNotification,
  
  // Stats and utility
  getNotificationStats,
  getAllUsers1,
  
  // Bulk operations
  sendNotificationToEmployees,
  sendNotificationToTeamLeads,
  sendNotificationToAllUsers,
  bulkMarkRead,
  markAllRead,
  
  // Admin operations
  adminGetAllNotifications,
  getAllUsersForTeamLead
} from "../controllers/notifcationController.js"; // Fixed: was "notifcationController.js"

const router = express.Router();

/* ----------------- PROTECT ALL NOTIFICATION ROUTES ----------------- */
router.use(protect);

/* ----------------- COMMON NOTIFICATION OPERATIONS (All authenticated users) ----------------- */
router.get("/my", getMyNotifications);
router.get("/unread", getUnreadNotifications);
router.get("/stats", getNotificationStats);
router.put("/:id/read", markRead);
router.put("/:id/unread", markUnread);
router.put("/bulk/mark-read", bulkMarkRead);
router.put("/mark-all-read", markAllRead);

/* ----------------- SENDING NOTIFICATIONS (Admin & TeamLead only) ----------------- */
router.post("/send", authorizeRoles("admin", "teamlead"), sendNotification);
router.get("/users", authorizeRoles("admin", "teamlead"), getAllUsers1);

/* ----------------- BULK SEND OPERATIONS ----------------- */
// Send to employees (Admin & TeamLead can do this)
router.post("/send-to-employees", authorizeRoles("admin", "teamlead"), sendNotificationToEmployees);

// Send to team leads (Admin only) - Added missing route
router.post("/send-to-teamleads", authorizeRoles("admin"), sendNotificationToTeamLeads);

// Send to all users (Admin only) - Added missing route
router.post("/send-to-all", authorizeRoles("admin"), sendNotificationToAllUsers);

/* ----------------- NOTIFICATION MANAGEMENT (Update/Delete) ----------------- */
// Users can update/delete their own notifications, admin can manage all
router.put("/:id", updateNotification);
router.delete("/:id", deleteNotification);
router.get(
  "/users/teamlead",
  authorizeRoles("teamlead"),
  getAllUsersForTeamLead
);

/* ----------------- ADMIN ONLY OPERATIONS ----------------- */
router.get("/admin/all", authorizeRoles("admin"), adminGetAllNotifications);

export default router;