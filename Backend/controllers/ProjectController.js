// controllers/projectController.js
import { Project, ProjectDetails, ProjectGroup } from "../models/Project.js";




/* ------------------- PROJECT CRUD ------------------- */



/**
 * @desc Get all projects
 * @route GET /api/projects
 * @access Private
 */


/**
 * @desc Get single project by ID
 * @route GET /api/projects/:id
 * @access Private
 */


/**
 * @desc Update a project
 * @route PUT /api/projects/:id
 * @access Admin
 */


/**
 * @desc Delete a project
 * @route DELETE /api/projects/:id
 * @access Admin
 */


/* ------------------- PROJECT DETAILS CRUD ------------------- */

/**
 * @desc Update ProjectDetails
 */


/**
 * @desc Delete ProjectDetails
 */


/* ------------------- PROJECT GROUP CRUD ------------------- */

/**
 * @desc Create Project Group
 */


/**
 * @desc Get all Project Groups
 */


/**
 * @desc Update Project Group
 */


/**
 * @desc Delete Project Group
 */


/* ------------------- PAYMENTS & TIME ENTRIES ------------------- */


/**
 * @desc Add Time Entry (Hourly Projects)
 */


/**
 * @desc Add Milestone Payment
 */
export const addMilestonePayment = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const { amount, paymentMethod, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });

    project.payments.push({
      amount,
      paymentMethod,
      notes,
      milestoneId,
      addedBy: req.user._id,
      paymentDate: new Date(),
    });

    if (amount >= milestone.amount) milestone.status = "completed";

    await project.save();

    res.status(200).json({ success: true, message: "Milestone payment added", project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding milestone payment", error: error.message });
  }
};

/**
 * @desc Update Client Status (accept / reject / review / away)
 */

// controllers/projectController.js


/* ------------------- PROJECT CRUD ------------------- */

// ... (keep your addProject, getAllProjects, getProjectById, updateProject)

/**
 * @desc Delete a project (Cascade deletes subdocs)
 * @route DELETE /api/projects/:id
 * @access Admin
 */

/* ------------------- MILESTONES ------------------- */

/**
 * @desc Update Milestone
 * @route PUT /api/projects/:projectId/milestones/:milestoneId
 * @access Admin
 */


/**
 * @desc Delete Milestone
 * @route DELETE /api/projects/:projectId/milestones/:milestoneId
 * @access Admin
 */


/* ------------------- PAYMENTS ------------------- */

/**
 * @desc Update Payment
 * @route PUT /api/projects/:projectId/payments/:paymentId
 * @access Admin
 */


/**
 * @desc Delete Payment
 * @route DELETE /api/projects/:projectId/payments/:paymentId
 * @access Admin
 */


/* ------------------- TIME ENTRIES ------------------- */

/**
 * @desc Update Time Entry
 * @route PUT /api/projects/:projectId/time-entries/:timeEntryId
 * @access Admin
 */


/**
 * @desc Delete Time Entry
 * @route DELETE /api/projects/:projectId/time-entries/:timeEntryId
 * @access Admin
 */

/**
 * @desc Get projects for the logged-in user
 *       - Teamlead: projects they lead
 *       - Employee: projects assigned to them by teamlead
 * @route GET /api/projects/my-projects
 * @access Private
 */

/**
 * @desc Teamlead picks a project
 * @route PUT /api/projects/:projectId/pick
 * @access Teamlead
 */

/**
 * @desc Get projects assigned to the logged-in employee by their teamlead
 * @route GET /api/projects/assigned
 * @access Employee
 */

// controllers/projectController.js




/* ----------------- PROJECT DETAILS ----------------- */





/* ----------------- PROJECT GROUPS ----------------- */
export const createProjectGroup = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    project.groups.push(req.body);
    await project.save();
    res.json({ success: true, groups: project.groups });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



// Additional controller method fixes - Add these to your projectController.js

// Updated controller methods with proper calculations

/**
 * @desc Add Time Entry with proper calculation
 * @route POST /api/admin/projects/:projectId/time-entries
 */


/**
 * @desc Add Payment with proper calculation
 * @route POST /api/admin/projects/:projectId/payments
 */


/**
 * @desc Add Milestone with proper calculation
 * @route POST /api/admin/projects/:projectId/milestones
 */

/**
 * @desc Create Project with proper initialization
 * @route POST /api/admin/projects
 */


/**
 * @desc Recalculate project totals (utility function)
 * @route PUT /api/admin/projects/:projectId/recalculate
 */

// controllers/projectController.js


/* ------------------- PROJECT CRUD ------------------- */

/**
 * @desc Get all projects
 * @route GET /api/admin/projects
 * @access Private (Admin)
 */
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("teamLead", "name email")
      .populate("employees", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const projectDetails = await ProjectDetails.find().populate("project");

    res.status(200).json({ 
      success: true, 
      projects, 
      projectDetails,
      count: projects.length 
    });
  } catch (error) {
    console.error("Get all projects error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching projects", 
      error: error.message 
    });
  }
};

/**
 * @desc Get single project by ID
 * @route GET /api/admin/projects/:id
 * @access Private (Admin)
 */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("teamLead", "name email")
      .populate("employees", "name email")
      .populate("createdBy", "name email");

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    const projectDetails = await ProjectDetails.findOne({ project: req.params.id });

    res.status(200).json({ 
      success: true, 
      project, 
      projectDetails 
    });
  } catch (error) {
    console.error("Get project by ID error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching project", 
      error: error.message 
    });
  }
};

/**
 * @desc Create Project with proper initialization
 * @route POST /api/admin/projects
 * @access Private (Admin)
 */
export const addProject = async (req, res) => {
  try {
    const {
      projectName,
      description,
      deadline,
      clientName,
      clientEmail,
      clientPhone,
      projectPlatform,
      profile,
      category,
      priority,
      fixedAmount,
      paymentSchedule,
      scopePolicy,
      hourlyRate,
      estimatedHours,
      milestones,
      onboardingDate,
    } = req.body;

    // Validation
    if (!projectName || !category || !clientName) {
      return res.status(400).json({ 
        success: false, 
        message: "Project name, category, and client name are required" 
      });
    }

    if (category === "fixed" && (!fixedAmount || fixedAmount <= 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Fixed amount is required for fixed projects" 
      });
    }

    if (category === "hourly" && (!hourlyRate || hourlyRate <= 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Hourly rate is required for hourly projects" 
      });
    }

    // Initialize amounts based on category
    let initialTotalAmount = 0;
    let initialPaidAmount = 0;
    let initialPendingAmount = 0;

    if (category === "fixed") {
      initialTotalAmount = parseFloat(fixedAmount) || 0;
      initialPendingAmount = initialTotalAmount;
    } else if (category === "hourly") {
      // For hourly projects, total amount will be calculated when time entries are added
      initialTotalAmount = 0;
      initialPendingAmount = 0;
    } else if (category === "milestone") {
      // For milestone projects, total amount will be calculated when milestones are added
      initialTotalAmount = 0;
      initialPendingAmount = 0;
    }

    const project = await Project.create({
      projectName,
      description,
      deadline: deadline ? new Date(deadline) : null,
      clientName,
      clientEmail,
      clientPhone,
      projectPlatform,
      profile,
      category,
      priority: priority || "medium",
      fixedAmount: category === "fixed" ? (parseFloat(fixedAmount) || 0) : 0,
      paymentSchedule: paymentSchedule || "upfront",
      scopePolicy,
      hourlyRate: category === "hourly" ? (parseFloat(hourlyRate) || 0) : 0,
      estimatedHours: parseFloat(estimatedHours) || 0,
      milestones: milestones || [],
      totalAmount: initialTotalAmount,
      paidAmount: initialPaidAmount,
      pendingAmount: initialPendingAmount,
      createdBy: req.user._id,
    });

    // Create project details if provided
    let projectDetails = null;
    if (onboardingDate || profile || projectPlatform) {
      projectDetails = await ProjectDetails.create({
        project: project._id,
        totalPrice: initialTotalAmount,
        onBoardDate: onboardingDate ? new Date(onboardingDate) : null,
        profile: profile || "",
        projectPlatform: projectPlatform || "",
      });
    }

    res.status(201).json({ 
      success: true, 
      message: "Project created successfully",
      project, 
      projectDetails 
    });
  } catch (error) {
    console.error("Add project error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating project", 
      error: error.message 
    });
  }
};

/**
 * @desc Update a project
 * @route PUT /api/admin/projects/:id
 * @access Private (Admin)
 */
export const updateProject = async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedBy: req.user._id }, 
      {
        new: true,
        runValidators: true,
      }
    ).populate("teamLead", "name email")
     .populate("employees", "name email");

    if (!updatedProject) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Project updated successfully",
      project: updatedProject 
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating project", 
      error: error.message 
    });
  }
};

/**
 * @desc Delete a project
 * @route DELETE /api/admin/projects/:id
 * @access Private (Admin)
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    // Also delete associated project details
    await ProjectDetails.deleteOne({ project: req.params.id });

    res.status(200).json({ 
      success: true, 
      message: "Project deleted successfully" 
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting project", 
      error: error.message 
    });
  }
};

/* ------------------- PAYMENTS ------------------- */

/**
 * @desc Add Payment with proper calculation
 * @route POST /api/admin/projects/:projectId/payments
 * @access Private (Admin)
 */
export const addPayment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amount, paymentMethod = "bank-transfer", notes, milestoneId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid amount is required" 
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    // Calculate current totals before adding payment
    if (project.category === "hourly") {
      project.actualHours = project.timeEntries.reduce((total, entry) => total + (entry.hours || 0), 0);
      project.totalAmount = project.hourlyRate * project.actualHours;
    } else if (project.category === "milestone") {
      project.totalAmount = project.milestones.reduce((total, milestone) => total + (milestone.amount || 0), 0);
    } else if (project.category === "fixed") {
      project.totalAmount = project.fixedAmount || 0;
    }

    // Add payment using model method
    await project.addPayment({ 
      amount: parseFloat(amount), 
      paymentMethod, 
      notes, 
      milestoneId 
    }, req.user._id);

    await project.save();

    res.status(200).json({ 
      success: true, 
      message: "Payment added successfully", 
      project
    });
  } catch (error) {
    console.error("Add payment error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error adding payment", 
      error: error.message 
    });
  }
};

/**
 * @desc Update Payment
 * @route PUT /api/admin/projects/:projectId/payments/:paymentId
 * @access Private (Admin)
 */
export const updatePayment = async (req, res) => {
  try {
    const { projectId, paymentId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    const payment = project.payments.id(paymentId);
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }

    // Store old amount to recalculate totals
    const oldAmount = payment.amount;
    
    Object.assign(payment, req.body);
    
    // Recalculate paid amount
    project.paidAmount = project.payments.reduce((total, payment) => total + (payment.amount || 0), 0);
    project.pendingAmount = project.totalAmount - project.paidAmount;
    
    await project.save();

    res.status(200).json({ 
      success: true, 
      message: "Payment updated successfully",
      payment, 
      project 
    });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating payment", 
      error: error.message 
    });
  }
};

/**
 * @desc Delete Payment
 * @route DELETE /api/admin/projects/:projectId/payments/:paymentId
 * @access Private (Admin)
 */
export const deletePayment = async (req, res) => {
  try {
    const { projectId, paymentId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    await project.deletePayment(paymentId);

    res.status(200).json({ 
      success: true, 
      message: "Payment deleted successfully", 
      project 
    });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting payment", 
      error: error.message 
    });
  }
};

/* ------------------- TIME ENTRIES ------------------- */

/**
 * @desc Add Time Entry with proper calculation
 * @route POST /api/admin/projects/:projectId/time-entries
 * @access Private (Admin)
 */
export const addTimeEntry = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { date, hours, description, taskType = "development" } = req.body;

    if (!hours || hours <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid hours are required" 
      });
    }

    if (!description) {
      return res.status(400).json({ 
        success: false, 
        message: "Description is required" 
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    if (project.category !== "hourly") {
      return res.status(400).json({ 
        success: false, 
        message: "Time entries can only be added to hourly projects" 
      });
    }

    // Use the model method which handles calculations automatically
    await project.addTimeEntry({
      date: date ? new Date(date) : new Date(),
      hours: parseFloat(hours),
      description,
      taskType
    }, req.user._id);

    await project.save();

    res.status(200).json({ 
      success: true, 
      message: "Time entry added successfully", 
      project
    });
  } catch (error) {
    console.error("Add time entry error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error adding time entry", 
      error: error.message 
    });
  }
};

/**
 * @desc Update Time Entry
 * @route PUT /api/admin/projects/:projectId/time-entries/:timeEntryId
 * @access Private (Admin)
 */
export const updateTimeEntry = async (req, res) => {
  try {
    const { projectId, timeEntryId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    const timeEntry = project.timeEntries.id(timeEntryId);
    if (!timeEntry) {
      return res.status(404).json({ 
        success: false, 
        message: "Time entry not found" 
      });
    }

    Object.assign(timeEntry, req.body);
    
    // Recalculate totals for hourly projects
    if (project.category === "hourly") {
      project.actualHours = project.timeEntries.reduce((total, entry) => total + (entry.hours || 0), 0);
      project.totalAmount = project.hourlyRate * project.actualHours;
      project.pendingAmount = project.totalAmount - project.paidAmount;
    }
    
    await project.save();

    res.status(200).json({ 
      success: true, 
      message: "Time entry updated successfully",
      timeEntry, 
      project 
    });
  } catch (error) {
    console.error("Update time entry error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating time entry", 
      error: error.message 
    });
  }
};

/**
 * @desc Delete Time Entry
 * @route DELETE /api/admin/projects/:projectId/time-entries/:timeEntryId
 * @access Private (Admin)
 */
export const deleteTimeEntry = async (req, res) => {
  try {
    const { projectId, timeEntryId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    await project.deleteTimeEntry(timeEntryId);

    res.status(200).json({ 
      success: true, 
      message: "Time entry deleted successfully", 
      project 
    });
  } catch (error) {
    console.error("Delete time entry error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting time entry", 
      error: error.message 
    });
  }
};

/* ------------------- MILESTONES ------------------- */

/**
 * @desc Add Milestone with proper calculation
 * @route POST /api/admin/projects/:projectId/milestones
 * @access Private (Admin)
 */
export const addMilestone = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, amount, dueDate, deliverables } = req.body;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, amount, and due date are required" 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Amount must be greater than 0" 
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    // Use the model method which handles calculations automatically
    await project.addMilestone({
      title,
      description,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      deliverables,
      order: project.milestones.length
    });

    await project.save();

    res.status(201).json({ 
      success: true, 
      message: "Milestone added successfully", 
      project
    });
  } catch (error) {
    console.error("Add milestone error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error adding milestone", 
      error: error.message 
    });
  }
};

/**
 * @desc Update Milestone
 * @route PUT /api/admin/projects/:projectId/milestones/:milestoneId
 * @access Private (Admin)
 */
export const updateMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ 
        success: false, 
        message: "Milestone not found" 
      });
    }

    Object.assign(milestone, req.body);
    
    // Recalculate totals for milestone projects
    if (project.category === "milestone") {
      project.totalAmount = project.milestones.reduce((total, milestone) => total + (milestone.amount || 0), 0);
      project.pendingAmount = project.totalAmount - project.paidAmount;
    }
    
    await project.save();

    res.status(200).json({ 
      success: true, 
      message: "Milestone updated successfully",
      milestone, 
      project 
    });
  } catch (error) {
    console.error("Update milestone error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating milestone", 
      error: error.message 
    });
  }
};

/**
 * @desc Delete Milestone
 * @route DELETE /api/admin/projects/:projectId/milestones/:milestoneId
 * @access Private (Admin)
 */
export const deleteMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    await project.deleteMilestone(milestoneId);

    res.status(200).json({ 
      success: true, 
      message: "Milestone deleted successfully", 
      project 
    });
  } catch (error) {
    console.error("Delete milestone error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting milestone", 
      error: error.message 
    });
  }
};

/* ------------------- CLIENT STATUS ------------------- */

/**
 * @desc Update Client Status (accept / reject / review / away)
 * @route PUT /api/admin/projects/:projectId/client-status
 * @access Private (Admin)
 */
export const updateClientStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { clientStatus } = req.body;

    if (!["accept", "reject", "review", "away"].includes(clientStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid client status" 
      });
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { clientStatus },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Client status updated successfully", 
      project 
    });
  } catch (error) {
    console.error("Update client status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating client status", 
      error: error.message 
    });
  }
};

/* ------------------- TEAM MANAGEMENT ------------------- */

/**
 * @desc Assign Team Lead
 * @route PUT /api/admin/projects/:projectId/teamlead
 * @access Private (Admin)
 */
export const assignTeamLead = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { teamLead } = req.body;

    if (!teamLead) {
      return res.status(400).json({ 
        success: false, 
        message: "Team Lead ID is required" 
      });
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { teamLead },
      { new: true }
    ).populate("teamLead", "name email");

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Team Lead assigned successfully",
      project 
    });
  } catch (error) {
    console.error("Assign team lead error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error assigning team lead", 
      error: error.message 
    });
  }
};

/**
 * @desc Assign Employees
 * @route PUT /api/admin/projects/:projectId/employees
 * @access Private (Admin)
 */
export const assignEmployees = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { employees } = req.body;

    if (!employees || !Array.isArray(employees)) {
      return res.status(400).json({ 
        success: false, 
        message: "Employee IDs array is required" 
      });
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { employees },
      { new: true }
    ).populate("employees", "name email");

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Employees assigned successfully",
      project 
    });
  } catch (error) {
    console.error("Assign employees error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error assigning employees", 
      error: error.message 
    });
  }
};

/* ------------------- PROJECT DETAILS ------------------- */

/**
 * @desc Add Project Details
 * @route POST /api/admin/projects/:projectId/details
 * @access Private (Admin)
 */
export const addProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { description, totalPrice, profile, projectPlatform, onBoardDate } = req.body;

    if (!description) {
      return res.status(400).json({ 
        success: false, 
        message: "Description is required" 
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    // Check if project details already exist
    let projectDetails = await ProjectDetails.findOne({ project: projectId });
    
    if (projectDetails) {
      return res.status(400).json({ 
        success: false, 
        message: "Project details already exist. Use update instead." 
      });
    }

    projectDetails = await ProjectDetails.create({
      project: projectId,
      description,
      totalPrice: totalPrice ? parseFloat(totalPrice) : undefined,
      profile,
      projectPlatform,
      onBoardDate: onBoardDate ? new Date(onBoardDate) : undefined
    });

    res.status(201).json({ 
      success: true, 
      message: "Project details added successfully",
      projectDetails 
    });
  } catch (error) {
    console.error("Add project details error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error adding project details", 
      error: error.message 
    });
  }
};

/**
 * @desc Get Project Details
 * @route GET /api/admin/projects/:projectId/details
 * @access Private (Admin)
 */
export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectDetails = await ProjectDetails.findOne({ project: projectId })
      .populate("project", "projectName clientName");

    if (!projectDetails) {
      return res.status(404).json({ 
        success: false, 
        message: "Project details not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      projectDetails 
    });
  } catch (error) {
    console.error("Get project details error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching project details", 
      error: error.message 
    });
  }
};

/**
 * @desc Update Project Details
 * @route PUT /api/admin/projects/:projectId/details/:detailId
 * @access Private (Admin)
 */
export const updateProjectDetails = async (req, res) => {
  try {
    const { detailId } = req.params;

    const updatedDetails = await ProjectDetails.findByIdAndUpdate(
      detailId, 
      req.body, 
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDetails) {
      return res.status(404).json({ 
        success: false, 
        message: "Project details not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Project details updated successfully",
      projectDetails: updatedDetails 
    });
  } catch (error) {
    console.error("Update project details error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating project details", 
      error: error.message 
    });
  }
};

/**
 * @desc Delete Project Details
 * @route DELETE /api/admin/projects/:projectId/details/:detailId
 * @access Private (Admin)
 */
export const deleteProjectDetails = async (req, res) => {
  try {
    const { detailId } = req.params;

    const details = await ProjectDetails.findByIdAndDelete(detailId);
    
    if (!details) {
      return res.status(404).json({ 
        success: false, 
        message: "Project details not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Project details deleted successfully" 
    });
  } catch (error) {
    console.error("Delete project details error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting project details", 
      error: error.message 
    });
  }
};

/* ------------------- PROJECT GROUPS ------------------- */

/**
 * @desc Create Project Group
 * @route POST /api/admin/project-groups
 * @access Private (Admin)
 */
export const addProjectGroup = async (req, res) => {
  try {
    const { groupId, mainProject, projects, pricingModel, totalValue, clientName } = req.body;

    if (!groupId || !mainProject || !clientName) {
      return res.status(400).json({ 
        success: false, 
        message: "Group ID, main project, and client name are required" 
      });
    }

    // Check if group ID already exists
    const existingGroup = await ProjectGroup.findOne({ groupId });
    if (existingGroup) {
      return res.status(400).json({ 
        success: false, 
        message: "Group ID already exists" 
      });
    }

    const group = await ProjectGroup.create({
      groupId,
      mainProject,
      projects: projects || [],
      pricingModel: pricingModel || "fixed",
      totalValue: totalValue ? parseFloat(totalValue) : 0,
      clientName,
      createdBy: req.user._id,
    });

    const populatedGroup = await ProjectGroup.findById(group._id)
      .populate("mainProject", "projectName clientName")
      .populate("projects", "projectName clientName")
      .populate("createdBy", "name email");

    res.status(201).json({ 
      success: true, 
      message: "Project group created successfully",
      group: populatedGroup 
    });
  } catch (error) {
    console.error("Add project group error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating project group", 
      error: error.message 
    });
  }
};

/**
 * @desc Get all Project Groups
 * @route GET /api/admin/project-groups
 * @access Private (Admin)
 */
export const getAllProjectGroups = async (req, res) => {
  try {
    const groups = await ProjectGroup.find()
      .populate("mainProject", "projectName clientName")
      .populate("projects", "projectName clientName")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      groups,
      count: groups.length 
    });
  } catch (error) {
    console.error("Get project groups error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching project groups", 
      error: error.message 
    });
  }
};

/**
 * @desc Update Project Group
 * @route PUT /api/admin/project-groups/:id
 * @access Private (Admin)
 */
export const updateProjectGroup = async (req, res) => {
  try {
    const updatedGroup = await ProjectGroup.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      {
        new: true,
        runValidators: true,
      }
    ).populate("mainProject", "projectName clientName")
     .populate("projects", "projectName clientName")
     .populate("createdBy", "name email");

    if (!updatedGroup) {
      return res.status(404).json({ 
        success: false, 
        message: "Project group not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Project group updated successfully",
      group: updatedGroup 
    });
  } catch (error) {
    console.error("Update project group error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating project group", 
      error: error.message 
    });
  }
};

/**
 * @desc Delete Project Group
 * @route DELETE /api/admin/project-groups/:id
 * @access Private (Admin)
 */
export const deleteProjectGroup = async (req, res) => {
  try {
    const group = await ProjectGroup.findByIdAndDelete(req.params.id);
    
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Project group not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Project group deleted successfully" 
    });
  } catch (error) {
    console.error("Delete project group error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting project group", 
      error: error.message 
    });
  }
};

/* ------------------- UTILITY FUNCTIONS ------------------- */

/**
 * @desc Recalculate project totals (utility function)
 * @route PUT /api/admin/projects/:projectId/recalculate
 * @access Private (Admin)
 */
export const recalculateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    // Recalculate based on category
    if (project.category === "hourly") {
      project.actualHours = project.timeEntries.reduce((total, entry) => total + (entry.hours || 0), 0);
      project.totalAmount = project.hourlyRate * project.actualHours;
    } else if (project.category === "milestone") {
      project.totalAmount = project.milestones.reduce((total, milestone) => total + (milestone.amount || 0), 0);
    } else if (project.category === "fixed") {
      project.totalAmount = project.fixedAmount || 0;
    }

    // Recalculate payments
    project.paidAmount = project.payments.reduce((total, payment) => total + (payment.amount || 0), 0);
    project.pendingAmount = project.totalAmount - project.paidAmount;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project totals recalculated successfully",
      project: {
        totalAmount: project.totalAmount,
        paidAmount: project.paidAmount,
        pendingAmount: project.pendingAmount,
        actualHours: project.actualHours
      }
    });
  } catch (error) {
    console.error("Recalculate project error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error recalculating project", 
      error: error.message 
    });
  }
};

/* ------------------- ADDITIONAL FUNCTIONS FOR OTHER ROLES ------------------- */

/**
 * @desc Get projects for the logged-in user
 *       - Teamlead: projects they lead
 *       - Employee: projects assigned to them by teamlead
 * @route GET /api/projects/my-projects
 * @access Private
 */
export const getMyProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "teamlead") {
      projects = await Project.find({ 
        teamLead: req.user._id,
        visibleToTeamLeads: true
      })
      .populate("teamLead", "name email")
      .populate("employees", "name email")
      .populate("createdBy", "name email");
    } else if (req.user.role === "employee") {
      // Projects where the employee is assigned
      projects = await Project.find({ employees: req.user._id })
        .populate("teamLead", "name email")
        .populate("employees", "name email")
        .populate("createdBy", "name email");
    } else {
      // Admin sees all projects
      projects = await Project.find()
        .populate("teamLead", "name email")
        .populate("employees", "name email")
        .populate("createdBy", "name email");
    }

    if (!projects || projects.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No projects found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      count: projects.length, 
      projects 
    });
  } catch (error) {
    console.error("Get my projects error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching projects", 
      error: error.message 
    });
  }
};

/**
 * @desc Teamlead picks a project
 * @route PUT /api/projects/:projectId/pick
 * @access Teamlead
 */
export const pickProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find the project and ensure it's visible to teamleads and unassigned
    const project = await Project.findOne({
      _id: projectId,
      visibleToTeamLeads: true,
      teamLead: null
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found, already picked, or not available for team leads"
      });
    }

    // Assign the logged-in teamlead as the project lead
    project.teamLead = req.user._id;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project successfully picked",
      project
    });
  } catch (error) {
    console.error("Pick project error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error picking project", 
      error: error.message 
    });
  }
};

/**
 * @desc Get projects assigned to the logged-in employee by their teamlead
 * @route GET /api/projects/assigned
 * @access Employee
 */
export const getAssignedProjects = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ 
        success: false, 
        message: "Only employees can access assigned projects" 
      });
    }

    // Find projects where the logged-in employee is assigned
    const projects = await Project.find({ employees: req.user._id })
      .populate("teamLead", "name email role")
      .populate("employees", "name email role")
      .populate("createdBy", "name email role")
      .populate("milestones") // optional: if you want milestones
      .populate("payments")   // optional: if you want payment info
      .sort({ createdAt: -1 });

    if (!projects || projects.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No assigned projects found" 
      });
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error("getAssignedProjects Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching assigned projects", 
      error: error.message 
    });
  }
};