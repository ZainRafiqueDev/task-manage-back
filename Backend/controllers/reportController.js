// controllers/reportController.js
import Report from "../models/Report.js";
import User from "../models/User.js";

/**
 * @desc Get all users except admin (for report assignment)
 * @route GET /api/reports/users
 * @access TeamLead / Admin
 */
export const getUsersForReports = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("name email role isActive")
      .sort({ role: 1, name: 1 });

    res.status(200).json({ 
      success: true, 
      count: users.length, 
      users 
    });
  } catch (err) {
    console.error("GetUsersForReports Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching users", 
      error: err.message 
    });
  }
};

/**
 * @desc Get all reports (Admin View)
 * @route GET /api/reports/admin
 * @access Admin
 */
export const getReportsForAdmin = async (req, res) => {
  try {
    const { type, status, completionStatus, from, to } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (completionStatus) filter.completionStatus = completionStatus;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const reports = await Report.find(filter)
      .populate("createdBy", "name email role")
      .populate("forUser", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc Update a report (only creator or admin)
 * @route PUT /api/reports/:reportId
 * @access Creator / Admin
 */
export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    let report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    // Only creator or admin can update
    if (report.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this report" });
    }

    report = await Report.findByIdAndUpdate(reportId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: "Report updated", report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc Delete a report (only creator or admin)
 * @route DELETE /api/reports/:reportId
 * @access Creator / Admin
 */
export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    // Only creator or admin can delete
    if (report.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this report" });
    }

    await report.deleteOne();

    res.status(200).json({ success: true, message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc Add feedback to a report (TeamLead/Admin)
 * @route POST /api/reports/:reportId/feedback
 * @access TeamLead / Admin
 */
export const addFeedback = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { comment, rating } = req.body;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    report.feedbacks.push({
      givenBy: req.user._id,
      role: req.user.role,
      comment,
      rating,
    });

    // Once feedback is added, mark report as reviewed (unless already approved)
    if (report.status !== "approved") report.status = "reviewed";

    await report.save();

    res.status(200).json({ success: true, message: "Feedback added", report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc Mark a report as complete/incomplete (TeamLead/Admin)
 * @route PATCH /api/reports/:reportId/completion
 * @access TeamLead / Admin
 */
export const updateCompletionStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { completionStatus } = req.body;

    if (!["complete", "incomplete"].includes(completionStatus)) {
      return res.status(400).json({ success: false, message: "Invalid completion status" });
    }

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    report.completionStatus = completionStatus;
    if (completionStatus === "complete") {
      report.status = "approved";
    }

    await report.save();

    res.status(200).json({ success: true, message: `Report marked as ${completionStatus}`, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc Get reports for a specific user (TeamLead reviewing employees)
 * @route GET /api/reports/user/:userId
 * @access TeamLead/Admin
 */
export const getReportsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await Report.find({ forUser: userId })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc Review a report (TeamLead/Admin)
 * @route PATCH /api/reports/:reportId/review
 * @access TeamLead / Admin
 */
export const reviewReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Only TeamLead or Admin can review
    if (!["teamlead", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to review reports" });
    }

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    // Mark as reviewed if not already approved
    if (report.status !== "approved") {
      report.status = "reviewed";
      report.reviewedBy = req.user._id;
      report.reviewedAt = new Date();
      await report.save();
    }

    res.status(200).json({
      success: true,
      message: "Report marked as reviewed",
      report,
    });
  } catch (err) {
    console.error("ReviewReport Error:", err);
    res.status(500).json({ success: false, message: "Error reviewing report", error: err.message });
  }
};

/**
 * @desc Submit a report to the next level (Employee → TeamLead → Admin → TeamLead/Employees)
 * @route POST /api/reports/:reportId/submit
 * @access Employee / TeamLead / Admin
 */
export const submitReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { forwardToIds } = req.body; // array of user IDs to submit report to

    if (!Array.isArray(forwardToIds) || forwardToIds.length === 0) {
      return res.status(400).json({ success: false, message: "At least one recipient is required" });
    }

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    // Role-based submission rules
    let allowedRoles;
    switch (req.user.role) {
      case "employee":
        allowedRoles = ["teamlead"];
        break;
      case "teamlead":
        allowedRoles = ["admin"];
        break;
      case "admin":
        allowedRoles = ["teamlead", "employee"];
        break;
      default:
        return res.status(403).json({ success: false, message: "Not authorized to submit reports" });
    }

    // Fetch recipients and validate roles
    const recipients = await User.find({ _id: { $in: forwardToIds } });
    const invalid = recipients.some(r => !allowedRoles.includes(r.role));
    if (invalid) {
      return res.status(403).json({ success: false, message: `You can only submit to: ${allowedRoles.join(", ")}` });
    }

    // Add submission log (optional)
    if (!report.submissions) report.submissions = [];
    report.submissions.push({
      submittedBy: req.user._id,
      submittedTo: forwardToIds,
      submittedAt: new Date(),
    });

    // Update report status
    report.status = "submitted";

    await report.save();

    res.status(200).json({
      success: true,
      message: `Report submitted to ${recipients.map(r => r.name).join(", ")}`,
      report,
    });
  } catch (err) {
    console.error("SubmitReport Error:", err);
    res.status(500).json({ success: false, message: "Error submitting report", error: err.message });
  }
};

/**
 * @desc Submit a daily report (Employee)
 * @route POST /api/reports/daily/submit
 * @access Employee
 */
export const submitDailyReport = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ success: false, message: "Only employees can submit daily reports" });
    }

    const { content, tasksCompleted, tasksPending, projectStats } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const report = await Report.create({
      type: "daily",
      createdBy: req.user._id,
      content,
      tasksCompleted,
      tasksPending,
      projectStats,
      status: "submitted",
    });

    res.status(201).json({ success: true, message: "Daily report submitted", report });
  } catch (err) {
    console.error("SubmitDailyReport Error:", err);
    res.status(500).json({ success: false, message: "Error submitting daily report", error: err.message });
  }
};

/**
 * @desc Create a daily or monthly report
 * @route POST /api/reports
 * @access Employee / TeamLead / Admin
 */
export const createReport = async (req, res) => {
  try {
    const { type, forUser, content, tasksCompleted, tasksPending, projectStats, parentReport } = req.body;

    if (!["employee", "teamlead", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to create reports" });
    }

    if (!type || !content) {
      return res.status(400).json({ success: false, message: "Type and content are required" });
    }

    const report = await Report.create({
      type,
      createdBy: req.user._id,
      forUser,
      content,
      tasksCompleted,
      tasksPending,
      projectStats,
      parentReport,
      status: "draft",
    });

    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error("CreateReport Error:", err);
    res.status(500).json({ success: false, message: "Error creating report", error: err.message });
  }
};

/**
 * @desc Get reports created by logged-in user (Employee/TeamLead/Admin)
 * @route GET /api/reports/my
 * @access Logged-in user
 */
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ createdBy: req.user._id })
      .populate("forUser", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (err) {
    console.error("GetMyReports Error:", err);
    res.status(500).json({ success: false, message: "Error fetching reports", error: err.message });
  }
};