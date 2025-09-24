// controllers/notificationController.js
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// ✅ Helper: consistent error response
const handleError = (res, err, message = "Server error") => {
  console.error(err);
  return res.status(500).json({ success: false, message, error: err.message });
};

// ✅ Send notification to specific users
export const sendNotification = async (req, res) => {
  try {
    const { receivers, message, type, priority, expiresAt } = req.body;

    if (!receivers || !Array.isArray(receivers) || receivers.length === 0) {
      return res.status(400).json({ success: false, message: "Receivers are required" });
    }
    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message is required" });
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

    await newNotif.populate("sender", "name username role");

    return res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: newNotif,
    });
  } catch (err) {
    return handleError(res, err, "Error sending notification");
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
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }

    const users = await User.find(filter).select("name username email role");
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    return handleError(res, err, "Error fetching users");
  }
};

// ✅ Get notifications for current user (with pagination + filters)
export const getMyNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type, unreadOnly } = req.query;

    let filter = { receivers: req.user._id };
    if (type && type !== "all") filter.type = type;
    if (unreadOnly === "true") filter.readBy = { $ne: req.user._id };

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .populate("sender", "name username role")
      .populate("receivers", "name username role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const notificationsWithReadStatus = notifications.map((notification) => {
      const notifObj = notification.toObject();
      notifObj.isRead = notification.readBy.includes(req.user._id);
      return notifObj;
    });

    if (req.user.role === "admin") {
      return res.json({
        success: true,
        notifications: notificationsWithReadStatus,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      });
    } else {
      return res.json({ success: true, data: notificationsWithReadStatus });
    }
  } catch (err) {
    return handleError(res, err, "Error fetching notifications");
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

    const withStatus = notifications.map((n) => ({ ...n.toObject(), isRead: false }));
    return res.json({ success: true, data: withStatus });
  } catch (err) {
    return handleError(res, err, "Error fetching unread notifications");
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
      return res.status(404).json({ success: false, message: "Notification not found or access denied" });
    }

    return res.json({ success: true, message: "Notification marked as read", data: notif });
  } catch (err) {
    return handleError(res, err, "Error marking notification as read");
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
      return res.status(404).json({ success: false, message: "Notification not found or access denied" });
    }

    return res.json({ success: true, message: "Notification marked as unread", data: notif });
  } catch (err) {
    return handleError(res, err, "Error marking notification as unread");
  }
};

// ✅ Bulk mark as read
export const bulkMarkRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ success: false, message: "Notification IDs are required" });
    }

    const result = await Notification.updateMany(
      { _id: { $in: notificationIds }, receivers: req.user._id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    return res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    return handleError(res, err, "Error bulk marking notifications as read");
  }
};

// ✅ Mark all as read
export const markAllRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { receivers: req.user._id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    return res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    return handleError(res, err, "Error marking all notifications as read");
  }
};

// ✅ Update notification (sender or admin only)
export const updateNotification = async (req, res) => {
  try {
    const { message, type, priority } = req.body;
    let filter = { _id: req.params.id };
    if (req.user.role !== "admin") filter.sender = req.user._id;

    const updateData = {};
    if (message) updateData.message = message.trim();
    if (type) updateData.type = type;
    if (priority) updateData.priority = priority;

    const notif = await Notification.findOneAndUpdate(filter, updateData, { new: true })
      .populate("sender", "name username role");

    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification not found or access denied" });
    }

    return res.json({ success: true, message: "Notification updated successfully", data: notif });
  } catch (err) {
    return handleError(res, err, "Error updating notification");
  }
};

// ✅ Delete notification (sender or admin only)
export const deleteNotification = async (req, res) => {
  try {
    let filter = { _id: req.params.id };
    if (req.user.role !== "admin") filter.sender = req.user._id;

    const notif = await Notification.findOneAndDelete(filter);
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification not found or access denied" });
    }

    return res.json({ success: true, message: "Notification deleted successfully" });
  } catch (err) {
    return handleError(res, err, "Error deleting notification");
  }
};

// ✅ Admin only - all notifications
export const adminGetAllNotifications = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can view all notifications" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type } = req.query;

    let filter = {};
    if (type && type !== "all") filter.type = type;

    const total = await Notification.countDocuments(filter);
    const notifs = await Notification.find(filter)
      .populate("sender", "name username role")
      .populate("receivers", "name username role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const notifsWithStatus = notifs.map((n) => {
      const obj = n.toObject();
      obj.isRead = n.readBy.includes(req.user._id);
      return obj;
    });

    return res.json({
      success: true,
      notifications: notifsWithStatus,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (err) {
    return handleError(res, err, "Error fetching all notifications");
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

    return res.json({
      success: true,
      total,
      read: total - unreadCount,
      unread: unreadCount,
    });
  } catch (err) {
    return handleError(res, err, "Error fetching notification stats");
  }
};

// ✅ Send notification to all employees
export const sendNotificationToEmployees = async (req, res) => {
  try {
    const { message, type, priority, expiresAt } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const employees = await User.find({ role: "employee" }).select("_id");
    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: "No employees found" });
    }

    const receivers = employees.map((e) => e._id);
    const notif = await Notification.create({
      sender: req.user._id,
      receivers,
      message: message.trim(),
      type: type || "info",
      priority: priority || "normal",
      expiresAt: expiresAt || undefined,
    });

    await notif.populate("sender", "name username role");

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${receivers.length} employees`,
      data: notif,
    });
  } catch (err) {
    return handleError(res, err, "Error sending notification to employees");
  }
};

// ✅ Send notification to all team leads
export const sendNotificationToTeamLeads = async (req, res) => {
  try {
    const { message, type, priority, expiresAt } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const teamLeads = await User.find({ role: "teamlead" }).select("_id");
    if (teamLeads.length === 0) {
      return res.status(404).json({ success: false, message: "No team leads found" });
    }

    const receivers = teamLeads.map((t) => t._id);
    const notif = await Notification.create({
      sender: req.user._id,
      receivers,
      message: message.trim(),
      type: type || "info",
      priority: priority || "normal",
      expiresAt: expiresAt || undefined,
    });

    await notif.populate("sender", "name username role");

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${receivers.length} team leads`,
      data: notif,
    });
  } catch (err) {
    return handleError(res, err, "Error sending notification to team leads");
  }
};

// ✅ Send notification to all users
export const sendNotificationToAllUsers = async (req, res) => {
  try {
    const { message, type, priority, expiresAt, excludeAdmins } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    let filter = {};
    if (excludeAdmins) filter.role = { $ne: "admin" };

    const users = await User.find(filter).select("_id");
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    const receivers = users.map((u) => u._id);
    const notif = await Notification.create({
      sender: req.user._id,
      receivers,
      message: message.trim(),
      type: type || "info",
      priority: priority || "normal",
      expiresAt: expiresAt || undefined,
    });

    await notif.populate("sender", "name username role");

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${receivers.length} users`,
      data: notif,
    });
  } catch (err) {
    return handleError(res, err, "Error sending notification to all users");
  }
};

// ✅ TeamLead: Get all users (except self)
export const getAllUsersForTeamLead = async (req, res) => {
  try {
    if (req.user.role !== "teamlead") {
      return res.status(403).json({ success: false, message: "Only team leads can access this" });
    }

    const users = await User.find({ _id: { $ne: req.user._id } }).select("name username email role");
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    return handleError(res, err, "Error fetching users for teamlead");
  }
};
