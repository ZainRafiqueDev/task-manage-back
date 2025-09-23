import Asset from "../models/Asset.js";
import User from "../models/User.js";

// Helper: consistent error response
const handleError = (res, err, message = "Server error") => {
  console.error(err);
  return res.status(500).json({ success: false, message });
};

// ✅ Create asset (Admin only)
export const createAsset = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const newAsset = new Asset(req.body);
    await newAsset.save();
    return res.status(201).json({ success: true, data: newAsset });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Serial number already exists" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    return handleError(res, err, "Error creating asset");
  }
};

// ✅ Get ALL assets (Admin only)
export const getAssets = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const assets = await Asset.find().populate("assignedTo", "name email role");
    return res.status(200).json({ success: true, data: assets });
  } catch (err) {
    return handleError(res, err, "Error fetching assets");
  }
};

// ✅ Get available (unassigned) assets
export const getAvailableAssets = async (req, res) => {
  try {
    const availableAssets = await Asset.find({ assignmentStatus: "unassigned" });
    return res.status(200).json({ success: true, data: availableAssets });
  } catch (err) {
    return handleError(res, err, "Error fetching available assets");
  }
};

// ✅ Get assigned assets with user info
export const getAssignedAssets = async (req, res) => {
  try {
    const assignedAssets = await Asset.find({ assignmentStatus: "assigned" })
      .populate("assignedTo", "name email role");
    return res.status(200).json({ success: true, data: assignedAssets });
  } catch (err) {
    return handleError(res, err, "Error fetching assigned assets");
  }
};

// ✅ Get asset by ID
export const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.assetId).populate("assignedTo", "name email role");
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
    return res.status(200).json({ success: true, data: asset });
  } catch (err) {
    return handleError(res, err, "Error fetching asset");
  }
};

// ✅ Assign asset to user (Admin only)
export const assignAsset = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { assetId, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });

    if (asset.assignmentStatus === "assigned") {
      return res.status(400).json({ success: false, message: "Asset is already assigned" });
    }

    asset.assignedTo = userId;
    asset.assignmentStatus = "assigned";
    await asset.save();

    return res.status(200).json({ success: true, message: "Asset assigned successfully", data: asset });
  } catch (err) {
    return handleError(res, err, "Error assigning asset");
  }
};

// ✅ Return asset (Teamlead/Employee or Admin)
export const returnAsset = async (req, res) => {
  try {
    const { assetId } = req.params;
    const asset = await Asset.findById(assetId);

    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });

    if (String(asset.assignedTo) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot return this asset" });
    }

    asset.assignedTo = null;
    asset.assignmentStatus = "unassigned";
    asset.returnDate = new Date();
    await asset.save();

    return res.status(200).json({ success: true, message: "Asset returned successfully", data: asset });
  } catch (err) {
    return handleError(res, err, "Error returning asset");
  }
};

// ✅ Update asset (Admin only)
export const updateAsset = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updatedAsset = await Asset.findByIdAndUpdate(req.params.assetId, req.body, { new: true, runValidators: true });
    if (!updatedAsset) return res.status(404).json({ success: false, message: "Asset not found" });

    return res.status(200).json({ success: true, data: updatedAsset });
  } catch (err) {
    return handleError(res, err, "Error updating asset");
  }
};

// ✅ Delete asset (Admin only)
export const deleteAsset = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const deletedAsset = await Asset.findByIdAndDelete(req.params.assetId);
    if (!deletedAsset) return res.status(404).json({ success: false, message: "Asset not found" });

    return res.status(200).json({ success: true, message: "Asset deleted successfully" });
  } catch (err) {
    return handleError(res, err, "Error deleting asset");
  }
};

// ✅ Get assets assigned to logged-in user (Teamlead/Employee)
export const getMyAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ assignedTo: req.user._id });
    return res.status(200).json({ success: true, data: assets });
  } catch (err) {
    return handleError(res, err, "Error fetching your assets");
  }
};
