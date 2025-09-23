// controllers/notificationController.js
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// ✅ Send notification to specific users
export const sendNotification = async (req, res) => {
  try {
    const { receivers, message, type, priority, expiresAt } = req.body;

    if (!receivers || receivers.length === 0) {
      return res.status(400).json({ message: "Receivers are required" });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    const sender = req.user._id;
    const newNotif = await Notification.create({
      sender,
      receivers,
      message: message.trim(),
      type: type || "info",
      priority: priority || "normal",
      expiresAt: expiresAt || undefined,
    });

    // Populate sender info for response
    await newNotif.populate("sender", "name username role");

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: newNotif
    });
  } catch (err) {
    console.error("API Error (sendNotification):", err.message);
    res.status(500).json({ 
      success: false,
      message: "Error sending notification", 
      error: err.message 
    });
  }
};

// ✅ Role-based user fetch
export const getAllUsers1 = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "admin") {
      filter = { role: { $in: ["employee", "teamlead"] } };
    } else if (req.user.role === "employee") {
      filter = { role: { $in: ["teamlead", "admin"] } };
    } else if (req.user.role === "teamlead") {
      filter = { role: { $in: ["admin", "employee"] } };
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const users = await User.find(filter).select("name username email role");
    res.status(200).json(users);
  } catch (err) {
    console.error("API Error (getAllUsers1):", err.message);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// ✅ Get notifications for current user with pagination
export const getMyNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type, unreadOnly } = req.query;

    let filter = {
      receivers: req.user._id,
    };

    // Add type filter if specified
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Add unread filter if specified
    if (unreadOnly === 'true') {
      filter.readBy = { $ne: req.user._id };
    }

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .populate("sender", "name username role")
      .populate("receivers", "name username role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add isRead virtual field for each notification
    const notificationsWithReadStatus = notifications.map(notification => {
      const notifObj = notification.toObject();
      notifObj.isRead = notification.readBy.includes(req.user._id);
      return notifObj;
    });

    if (req.user.role === "admin") {
      // For admin, return with pagination info
      res.json({
        notifications: notificationsWithReadStatus,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      });
    } else {
      // For regular users, return array
      res.json(notificationsWithReadStatus);
    }
  } catch (err) {
    console.error("API Error (getMyNotifications):", err.message);
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
};

// ✅ Get unread notifications
export const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receivers: req.user._id,
      readBy: { $ne: req.user._id },
    })
      .populate("sender", "name username role")
      .sort({ createdAt: -1 });

    // Add isRead virtual field
    const notificationsWithReadStatus = notifications.map(notification => {
      const notifObj = notification.toObject();
      notifObj.isRead = false; // These are all unread
      return notifObj;
    });

    res.json(notificationsWithReadStatus);
  } catch (err) {
    console.error("API Error (getUnreadNotifications):", err.message);
    res.status(500).json({ message: "Error fetching unread", error: err.message });
  }
};

// ✅ Mark notification as read
export const markRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, receivers: req.user._id },
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    ).populate("sender", "name username role");

    if (!notif) {
      return res.status(404).json({ message: "Notification not found or access denied" });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notif
    });
  } catch (err) {
    console.error("API Error (markRead):", err.message);
    res.status(500).json({ message: "Error marking read", error: err.message });
  }
};

// ✅ Mark notification as unread
export const markUnread = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, receivers: req.user._id },
      { $pull: { readBy: req.user._id } },
      { new: true }
    ).populate("sender", "name username role");

    if (!notif) {
      return res.status(404).json({ message: "Notification not found or access denied" });
    }

    res.json({
      success: true,
      message: "Notification marked as unread",
      data: notif
    });
  } catch (err) {
    console.error("API Error (markUnread):", err.message);
    res.status(500).json({ message: "Error marking unread", error: err.message });
  }
};

// ✅ Bulk mark as read
export const bulkMarkRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: "Notification IDs are required" });
    }

    const result = await Notification.updateMany(
      { 
        _id: { $in: notificationIds },
        receivers: req.user._id,
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("API Error (bulkMarkRead):", err.message);
    res.status(500).json({ message: "Error marking notifications as read", error: err.message });
  }
};

// ✅ Mark all as read
export const markAllRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { 
        receivers: req.user._id,
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("API Error (markAllRead):", err.message);
    res.status(500).json({ message: "Error marking all notifications as read", error: err.message });
  }
};

// ✅ Update notification (only sender or admin can update)
export const updateNotification = async (req, res) => {
  try {
    const { message, type, priority } = req.body;
    
    let filter = { _id: req.params.id };
    
    // Only sender or admin can update
    if (req.user.role !== "admin") {
      filter.sender = req.user._id;
    }

    const updateData = {};
    if (message) updateData.message = message.trim();
    if (type) updateData.type = type;
    if (priority) updateData.priority = priority;

    const notif = await Notification.findOneAndUpdate(
      filter,
      updateData,
      { new: true }
    ).populate("sender", "name username role");

    if (!notif) {
      return res.status(404).json({ message: "Notification not found or access denied" });
    }

    res.json({
      success: true,
      message: "Notification updated successfully",
      data: notif
    });
  } catch (err) {
    console.error("API Error (updateNotification):", err.message);
    res.status(500).json({ message: "Error updating notification", error: err.message });
  }
};

// ✅ Delete notification (only sender or admin can delete)
export const deleteNotification = async (req, res) => {
  try {
    let filter = { _id: req.params.id };
    
    // Only sender or admin can delete
    if (req.user.role !== "admin") {
      filter.sender = req.user._id;
    }

    const notif = await Notification.findOneAndDelete(filter);
    
    if (!notif) {
      return res.status(404).json({ message: "Notification not found or access denied" });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (err) {
    console.error("API Error (deleteNotification):", err.message);
    res.status(500).json({ message: "Error deleting notification", error: err.message });
  }
};

// ✅ Admin only - all notifications with pagination
export const adminGetAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type } = req.query;

    let filter = {};
    if (type && type !== 'all') {
      filter.type = type;
    }

    const total = await Notification.countDocuments(filter);
    const notifs = await Notification.find(filter)
      .populate("sender", "name username role")
      .populate("receivers", "name username role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add isRead virtual field based on current admin user
    const notifsWithReadStatus = notifs.map(notification => {
      const notifObj = notification.toObject();
      notifObj.isRead = notification.readBy.includes(req.user._id);
      return notifObj;
    });

    res.json({
      notifications: notifsWithReadStatus,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (err) {
    console.error("API Error (adminGetAllNotifications):", err.message);
    res.status(500).json({ message: "Error fetching all notifications", error: err.message });
  }
};

// ✅ Notification stats
export const getNotificationStats = async (req, res) => {
  try {
    const total = await Notification.countDocuments({ receivers: req.user._id });
    const unreadCount = await Notification.countDocuments({
      receivers: req.user._id,
      readBy: { $ne: req.user._id },
    });
    const read = total - unreadCount;

    res.json({ 
      total, 
      read, 
      unread: unreadCount, // Fixed: was using 'unread' but should be consistent
      unreadCount // Added for backward compatibility
    });
  } catch (err) {
    console.error("API Error (getNotificationStats):", err.message);
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};

// ✅ Send notification to all employees
export const sendNotificationToEmployees = async (req, res) => {
  try {
    const { message, type, priority, expiresAt } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    const employees = await User.find({ role: "employee" }).select("_id");
    
    if (employees.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    const receivers = employees.map((e) => e._id);

    const sender = req.user._id;
    const notif = await Notification.create({
      sender,
      receivers,
      message: message.trim(),
      type: type || "info",
      priority: priority || "normal",
      expiresAt: expiresAt || undefined,
    });

    await notif.populate("sender", "name username role");

    res.status(201).json({
      success: true,
      message: `Notification sent to ${receivers.length} employees`,
      data: notif,
      recipientCount: receivers.length
    });
  } catch (err) {
    console.error("API Error (sendNotificationToEmployees):", err.message);
    res.status(500).json({ message: "Error sending to employees", error: err.message });
  }
};

// ✅ Send notification to all team leads (Admin only)
export const sendNotificationToTeamLeads = async (req, res) => {
  try {
    const { message, type, priority, expiresAt } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    const teamLeads = await User.find({ role: "teamlead" }).select("_id");
    
    if (teamLeads.length === 0) {
      return res.status(404).json({ message: "No team leads found" });
    }

    const receivers = teamLeads.map((tl) => tl._id);

    const sender = req.user._id;
    const notif = await Notification.create({
      sender,
      receivers,
      message: message.trim(),
      type: type || "info",
      priority: priority || "normal",
      expiresAt: expiresAt || undefined,
    });

    await notif.populate("sender", "name username role");

    res.status(201).json({
      success: true,
      message: `Notification sent to ${receivers.length} team leads`,
      data: notif,
      recipientCount: receivers.length
    });
  } catch (err) {
    console.error("API Error (sendNotificationToTeamLeads):", err.message);
    res.status(500).json({ message: "Error sending to team leads", error: err.message });
  }
};

// ✅ Send notification to all users (Admin only)
export const sendNotificationToAllUsers = async (req, res) => {
  try {
    const { message, type, priority, expiresAt, excludeAdmins } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    let filter = {};
    if (excludeAdmins) {
      filter.role = { $ne: "admin" };
    }

    const users = await User.find(filter).select("_id");
    
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const receivers = users.map((u) => u._id);

    const sender = req.user._id;
    const notif = await Notification.create({
      sender,
      receivers,
      message: message.trim(),
      type: type || "info",
      priority: priority || "normal",
      expiresAt: expiresAt || undefined,
    });

    await notif.populate("sender", "name username role");

    res.status(201).json({
      success: true,
      message: `Notification sent to ${receivers.length} users`,
      data: notif,
      recipientCount: receivers.length
    });
  } catch (err) {
    console.error("API Error (sendNotificationToAllUsers):", err.message);
    res.status(500).json({ message: "Error sending to all users", error: err.message });
  }
};