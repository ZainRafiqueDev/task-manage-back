// controllers/employeeController.js
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Report from "../models/Report.js";

import Asset from "../models/Asset.js";


// 1) Projects assigned to this employee
export const getAssignedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ assignedEmployees: req.user._id }).populate("assignedTeamLead", "name email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2) Tasks assigned to this employee
export const getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id }).populate("project createdBy", "name");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3) Log time on task (push a log)
export const logTime = async (req, res) => {
  try {
    const { update, startTime, endTime, totalTime } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only log time on your assigned tasks" });
    }
    task.logs.push({ update, startTime, endTime, totalTime });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4) Mark task as completed
export const markComplete = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only mark your tasks" });
    }
    task.status = "completed";
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5) Submit daily report
export const submitDailyReport = async (req, res) => {
  try {
    const { content, tasksCompleted, tasksPending } = req.body;
    const report = await Report.create({
      type: "daily",
      createdBy: req.user._id,
      content,
      tasksCompleted,
      tasksPending
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ----------------------- TASKS ----------------------- */
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const respondToTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.employeeResponses.push({
      response: req.body.response,
      blockers: req.body.blockers,
      respondedBy: req.user._id,
      respondedAt: new Date()
    });

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addLog = async (req, res) => {
  try {
    const { update, startTime, endTime } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const totalTime = (new Date(endTime) - new Date(startTime)) / 60000;
    task.logs.push({ update, startTime, endTime, totalTime });

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------- ASSETS ----------------------- */
export const getMyAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ assignedTo: req.user._id });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const returnAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.assetId);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    if (String(asset.assignedTo) !== String(req.user._id))
      return res.status(403).json({ message: "You cannot return someone else's asset" });

    asset.assignedTo = null;
    await asset.save();

    res.json({ message: "Asset returned", asset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------- REPORTS ----------------------- */
export const createReport = async (req, res) => {
  try {
    const report = await Report.create({ ...req.body, createdBy: req.user._id, type: "daily" });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

