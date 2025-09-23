import express from "express";
import {
  createAsset,
  getAssets,
  getAvailableAssets,
  getAssignedAssets,
  getAssetById,
  assignAsset,
  returnAsset,
  updateAsset,
  deleteAsset,
  getMyAssets,
} from "../controllers/assetController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ----------------- Admin Routes -----------------
router
  .route("/")
  .post(protect, authorizeRoles("admin"), createAsset) // Create asset
  .get(protect, authorizeRoles("admin"), getAssets);  // Get all assets

router.get("/available", protect, authorizeRoles("admin"), getAvailableAssets);
router.get("/assigned", protect, authorizeRoles("admin"), getAssignedAssets);

router
  .route("/:assetId")
  .put(protect, authorizeRoles("admin"), updateAsset)  // Update asset
  .delete(protect, authorizeRoles("admin"), deleteAsset) // Delete asset
  .get(protect, getAssetById); // Get asset by ID (all roles)

// Assign asset (Admin only)
router.post("/assign", protect, authorizeRoles("admin"), assignAsset);

// ----------------- Teamlead / Employee Routes -----------------
router.get("/my", protect, authorizeRoles("teamlead", "employee"), getMyAssets);

// Return asset (Employee, Teamlead, or Admin can return)
router.put(
  "/return/:assetId",
  protect,
  authorizeRoles("teamlead", "employee", "admin"),
  returnAsset
);

export default router;
