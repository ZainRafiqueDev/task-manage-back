// controllers/teamLeadController.js
import Project from "../models/Project.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Report from "../models/Report.js";
import Notification from "../models/Notification.js";


// 1) Get projects visible to teamlead
export const getVisibleProjects = async (req, res) => {
  try {
    const all = await Project.find().populate("createdBy", "name email");
    // For each project, if assignedTeamLead === req.user._id => full view; otherwise limited view
    const result = all.map(p => {
      if (p.assignedTeamLead && p.assignedTeamLead.toString() === req.user._id.toString()) {
        return p; // full
      }
      // limited view for unassigned or other teamlead
      const limited = {
        _id: p._id,
        name: p.name,
        clientName: p.clientName,
        totalPrice: p.totalPrice,
        status: p.status,
        category: p.category,
        priority: p.priority,
        deadline: p.deadline,
        createdBy: p.createdBy
      };
      return limited;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2) Pick a project
export const pickProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.assignedTeamLead && project.assignedTeamLead.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Project already assigned to another teamlead" });
    }
    project.assignedTeamLead = req.user._id;
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3) My projects (full)
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ assignedTeamLead: req.user._id }).populate("assignedEmployees", "name email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4) Team members (employees only)
export const getTeamMembers = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5) Assign task to employee (teamlead only on projects assigned to them)
export const assignTask = async (req, res) => {
  try {
    const { title, description, assignedTo, project, dueDate, projectLink } = req.body;
    // Check project belongs to teamlead
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: "Project not found" });
    if (!proj.assignedTeamLead || proj.assignedTeamLead.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only assign tasks for projects you own" });
    }
    const task = await Task.create({
      title, description, assignedTo, project, dueDate, projectLink, createdBy: req.user._id
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6) Reassign task
export const reassignTask = async (req, res) => {
  try {
    const { newEmployeeId } = req.body;
    const task = await Task.findById(req.params.id).populate("project");
    if (!task) return res.status(404).json({ message: "Task not found" });
    // Ensure teamlead owns project
    if (!task.project.assignedTeamLead || task.project.assignedTeamLead.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to reassign task" });
    }
    task.assignedTo = newEmployeeId;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7) Get tasks assigned by this teamlead
export const getMyAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id }).populate("assignedTo project");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8) Submit report (daily/monthly)
export const submitReport = async (req, res) => {
  try {
    const { type, content, projectStats, tasksCompleted, tasksPending } = req.body;
    const report = await Report.create({
      type, createdBy: req.user._id, content, projectStats, tasksCompleted, tasksPending
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 9) Send notification to admin or user
export const sendNotification = async (req, res) => {
  try {
    const { receiverId, message, type } = req.body;
    if (!receiverId) return res.status(400).json({ message: "receiverId required" });
    const n = await Notification.create({ sender: req.user._id, receiver: receiverId, message, type });
    res.status(201).json(n);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 10) View employee reports (teamlead)
export const getEmployeeReports = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const reports = await Report.find({ createdBy: employeeId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ----------------------- PROJECT ACCESS ----------------------- */




/* ----------------------- REPORTING ----------------------- */
export const reviewReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = req.body.status || "reviewed";
    report.feedback = req.body.feedback || "";
    await report.save();

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const giveFeedback = async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.feedback = req.body.feedback;
    await report.save();

    res.json({ message: "Feedback added", report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------- NOTIFICATIONS ----------------------- */
export const sendNotificationToEmployees = async (req, res) => {
  try {
    const { recipients, message } = req.body;
    const notification = await Notification.create({ recipients, message, sender: req.user._id });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
