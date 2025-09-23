import Task from "../models/Task.js";
import Project from "../models/Project.js";

/**
 * @desc Create a new task (Teamlead/Admin only)
 */
export const createTask = async (req, res) => {
  try {
    if (!["teamlead", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to create tasks" });
    }

    const newTask = new Task({
      title: req.body.title,
      description: req.body.description,
      specialInstructions: req.body.specialInstructions,
      assignedTo: req.body.assignedTo,
      project: req.body.project,
      dueDate: req.body.dueDate,
      projectLink: req.body.projectLink,
      priority: req.body.priority || "medium",
      createdBy: req.user._id,
    });

    await newTask.save();

    return res.status(201).json({ success: true, task: newTask });
  } catch (err) {
    console.error("CreateTask Error:", err);
    return res.status(500).json({ success: false, message: "Error creating task", error: err.message });
  }
};

/**
 * @desc Get all tasks (Teamlead/Admin see all, Employees see only assigned)
 */
export const getTasks = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "employee") {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("project", "projectName clientName deadline")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    console.error("GetTasks Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching tasks", error: err.message });
  }
};

/**
 * @desc Get single task by ID
 */
export const getTaskById = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("project", "projectName clientName deadline")
      .populate("createdBy", "name email role");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Employees can only access their own tasks
    if (req.user.role === "employee" && String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to view this task" });
    }

    return res.status(200).json({ success: true, task });
  } catch (err) {
    console.error("GetTaskById Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching task", error: err.message });
  }
};

/**
 * @desc Update task (Teamlead/Admin only)
 */
export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    if (!["teamlead", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to update tasks" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: {
          title: req.body.title,
          description: req.body.description,
          specialInstructions: req.body.specialInstructions,
          status: req.body.status,
          dueDate: req.body.dueDate,
          projectLink: req.body.projectLink,
          priority: req.body.priority,
        },
      },
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("project", "projectName clientName deadline")
      .populate("createdBy", "name email role");

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({ success: true, message: "Task updated", task: updatedTask });
  } catch (err) {
    console.error("UpdateTask Error:", err);
    return res.status(500).json({ success: false, message: "Error updating task", error: err.message });
  }
};

/**
 * @desc Add employee response (Employee only)
 */
export const addEmployeeResponse = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (req.user.role !== "employee" || String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to add response" });
    }

    task.employeeResponses.push({
      message: req.body.message,
      type: req.body.type || "progress",
      createdBy: req.user._id,
    });

    await task.save();

    return res.status(200).json({ success: true, message: "Response added", task });
  } catch (err) {
    console.error("AddEmployeeResponse Error:", err);
    return res.status(500).json({ success: false, message: "Error adding response", error: err.message });
  }
};

/**
 * @desc Add a log entry (time tracking) - Employee/Teamlead/Admin
 */
export const addLog = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Auto-calc totalTime if both start & end exist
    let totalTime = 0;
    if (req.body.startTime && req.body.endTime) {
      totalTime = Math.round(
        (new Date(req.body.endTime) - new Date(req.body.startTime)) / (1000 * 60)
      );
    }

    task.logs.push({
      update: req.body.update,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      totalTime,
      updatedBy: req.user._id,
    });

    await task.save();

    return res.status(200).json({ success: true, message: "Log added", task });
  } catch (err) {
    console.error("AddLog Error:", err);
    return res.status(500).json({ success: false, message: "Error adding log", error: err.message });
  }
};

/**
 * @desc Delete a task (Teamlead/Admin only)
 */
export const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    if (!["teamlead", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete tasks" });
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error("DeleteTask Error:", err);
    return res.status(500).json({ success: false, message: "Error deleting task", error: err.message });
  }
};



/**
 * @desc Assign a task to an employee (Teamlead/Admin only)
 */
export const assignTask = async (req, res) => {
  try {
    // Only teamlead or admin can assign
    if (!["teamlead", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to assign tasks" });
    }

    const { title, description, assignedTo, project, dueDate, projectLink, priority, specialInstructions } = req.body;

    // Check if project exists
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ success: false, message: "Project not found" });

    // Optional: Teamlead can only assign tasks for projects they lead
    if (req.user.role === "teamlead" && proj.assignedTeamLead.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only assign tasks for your projects" });
    }

    const newTask = new Task({
      title,
      description,
      specialInstructions,
      assignedTo,
      project,
      dueDate,
      projectLink,
      priority: priority || "medium",
      createdBy: req.user._id,
    });

    await newTask.save();

    return res.status(201).json({ success: true, message: "Task assigned successfully", task: newTask });
  } catch (err) {
    console.error("AssignTask Error:", err);
    return res.status(500).json({ success: false, message: "Error assigning task", error: err.message });
  }
};
/**
 * @desc Get tasks assigned to the logged-in employee
 */
export const getMyAssignedTasks = async (req, res) => {
  try {
    // Only employees can access this
    if (req.user.role !== "employee") {
      return res.status(403).json({ success: false, message: "Not authorized to view assigned tasks" });
    }

    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("project", "projectName clientName deadline")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    console.error("GetMyAssignedTasks Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching assigned tasks", error: err.message });
  }
};
/**
 * @desc Reassign a task to an employee (Teamlead/Admin only)
 * @route PUT /api/tasks/:taskId/reassign
 * @access Teamlead/Admin
 */
export const reassignTask = async (req, res) => {
  const { taskId } = req.params;
  const { newAssignedTo } = req.body; // ID of employee to reassign to

  try {
    if (!["teamlead", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to reassign tasks" });
    }

    const task = await Task.findById(taskId).populate("project");
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Optional: Teamlead can only reassign tasks for projects they lead
    if (req.user.role === "teamlead" && String(task.project.teamLead) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only reassign tasks in your projects" });
    }

    // Reassign task
    const oldAssignedTo = task.assignedTo;
    task.assignedTo = newAssignedTo || oldAssignedTo; // allow same employee if desired

    await task.save();

    return res.status(200).json({
      success: true,
      message: `Task reassigned from ${oldAssignedTo} to ${task.assignedTo}`,
      task,
    });
  } catch (err) {
    console.error("ReassignTask Error:", err);
    return res.status(500).json({ success: false, message: "Error reassigning task", error: err.message });
  }
};
/**
 * @desc Employee logs time on a task
 * @route POST /api/tasks/:taskId/log-time
 * @access Employee
 */
export const logTime = async (req, res) => {
  const { taskId } = req.params;
  const { startTime, endTime, description } = req.body;

  try {
    // Only employees can log time
    if (req.user.role !== "employee") {
      return res.status(403).json({ success: false, message: "Only employees can log time" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Ensure the employee is assigned to this task
    if (String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to log time for this task" });
    }

    // Validate times
    if (!startTime || !endTime || new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ success: false, message: "Invalid start or end time" });
    }

    // Calculate total time in minutes
    const totalMinutes = Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60));

    // Add log entry
    task.logs.push({
      startTime,
      endTime,
      totalTime: totalMinutes,
      description: description || "",
      updatedBy: req.user._id,
    });

    await task.save();

    return res.status(200).json({ success: true, message: "Time logged successfully", task });
  } catch (err) {
    console.error("LogTime Error:", err);
    return res.status(500).json({ success: false, message: "Error logging time", error: err.message });
  }
};
/**
 * @desc Mark a task as complete
 * @route PUT /api/tasks/:taskId/mark-complete
 * @access Employee / Teamlead / Admin
 */
export const markComplete = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId).populate("project");
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Employee: can only mark their own task
    if (req.user.role === "employee") {
      if (String(task.assignedTo) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: "Not authorized to mark this task complete" });
      }
      task.status = "completed";
      task.completedBy = req.user._id;
    }

    // Teamlead: can mark tasks in their projects
    else if (req.user.role === "teamlead") {
      if (String(task.project.teamLead) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: "Not authorized to mark this task complete" });
      }
      task.status = "completed";
      task.completedBy = req.user._id;
      task.overrideBy = "teamlead"; // optional flag
    }

    // Admin: can mark any task complete
    else if (req.user.role === "admin") {
      task.status = "completed";
      task.completedBy = req.user._id;
      task.overrideBy = "admin"; // optional flag
    } else {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    task.completedAt = new Date();
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task marked as complete",
      task,
    });
  } catch (err) {
    console.error("MarkComplete Error:", err);
    return res.status(500).json({ success: false, message: "Error marking task complete", error: err.message });
  }
};
