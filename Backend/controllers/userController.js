import User from "../models/User.js";
import Asset from "../models/Asset.js";

/* ----------------------- USER MANAGEMENT ----------------------- */

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new user (admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, cnic, phone, role } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Email already exists" });

    const cnicExists = await User.findOne({ cnic });
    if (cnicExists) return res.status(400).json({ message: "CNIC already registered" });

    const user = await User.create({ name, email, password, cnic, phone, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user by ID (admin only)
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user by ID (admin only)
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    // Remove assigned assets
    await Asset.updateMany({ assignedTo: deleted._id }, { $unset: { assignedTo: "" } });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign employees to a team (Teamlead only)
export const assignTeam = async (req, res) => {
  try {
    // Only teamlead can assign their team
    if (req.user.role !== "teamlead") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { employeeIds } = req.body; // array of employee _id's to assign

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ success: false, message: "Provide employee IDs to assign" });
    }

    // Validate all employee IDs
    const employees = await User.find({ _id: { $in: employeeIds }, role: "employee" });
    if (employees.length !== employeeIds.length) {
      return res.status(400).json({ success: false, message: "Some users are invalid or not employees" });
    }

    // Assign each employee to this teamlead
    await User.updateMany(
      { _id: { $in: employeeIds } },
      { teamLead: req.user._id }
    );

    res.status(200).json({
      success: true,
      message: `Assigned ${employees.length} employees to your team`,
      assignedEmployees: employees.map((e) => ({ id: e._id, name: e.name, email: e.email })),
    });
  } catch (err) {
    console.error("AssignTeam Error:", err);
    res.status(500).json({ success: false, message: "Error assigning team", error: err.message });
  }
};

// Remove employees from team (Teamlead only)
export const removeFromTeam = async (req, res) => {
  try {
    if (req.user.role !== "teamlead") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { employeeIds } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ success: false, message: "Provide employee IDs to remove" });
    }

    // Remove teamlead assignment
    await User.updateMany(
      { _id: { $in: employeeIds }, teamLead: req.user._id },
      { $unset: { teamLead: "" } }
    );

    res.status(200).json({
      success: true,
      message: `Removed ${employeeIds.length} employees from your team`,
    });
  } catch (err) {
    console.error("RemoveFromTeam Error:", err);
    res.status(500).json({ success: false, message: "Error removing from team", error: err.message });
  }
};

// Promote user to team lead (admin only)
export const promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "teamlead";
    await user.save();
    res.json({ message: "User promoted to Team Lead", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------- EMPLOYEE MANAGEMENT ----------------------- */

// Get all employees (teamlead/admin)
export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");
    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get teamlead's assigned employees
export const getMyTeam = async (req, res) => {
  try {
    if (req.user.role !== "teamlead") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const teamMembers = await User.find({ 
      teamLead: req.user._id, 
      role: "employee" 
    }).select("-password");

    res.json({
      success: true,
      teamMembers,
      count: teamMembers.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users filtered by role
export const getAllUsersFiltered = async (req, res) => {
  try {
    let users;

    if (req.user.role === "admin") {
      // Admin sees all users
      users = await User.find().select("-password");
    } else if (req.user.role === "teamlead") {
      // Teamlead sees only employees (exclude admins & other teamleads)
      users = await User.find({ role: "employee" }).select("-password");
    } else {
      return res.status(403).json({ message: "Not authorized to view users" });
    }

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};