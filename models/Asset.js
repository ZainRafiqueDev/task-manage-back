import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ["laptop", "imac", "mouse", "keyboard", "headphone", "charger", "bag"],
      required: true,
      lowercase: true,
    },

    brand: { type: String, trim: true },
    model: { type: String, trim: true },

    serialNumber: { type: String, unique: true, required: true, trim: true },

    specification: { type: String, trim: true },

    // Extra fields only for Laptop/iMac
    processor: {
      type: String,
      required: function () {
        return this.type === "laptop" || this.type === "imac";
      },
      trim: true,
    },
    ram: {
      type: String,
      required: function () {
        return this.type === "laptop" || this.type === "imac";
      },
      trim: true,
    },
    rom: {
      type: String,
      required: function () {
        return this.type === "laptop" || this.type === "imac";
      },
      trim: true,
    },

    // Asset usage status
    conditionStatus: {
      type: String,
      enum: ["good", "bad", "repair", "broken"],
      default: "good",
      lowercase: true,
    },

    // Assignment status
    assignmentStatus: {
      type: String,
      enum: ["assigned", "unassigned"],
      default: "unassigned",
      lowercase: true,
    },

    // Reference to user (employee or teamlead)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Who assigned this asset (admin)
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Return workflow fields
    returnRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    returnRequestedAt: Date,
    returnReason: { type: String, trim: true },
    returnStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected", "cancelled", "returned"],
      default: "none",
      lowercase: true,
    },
    returnRequestedNotes: { type: String, trim: true },

    // When the asset was actually returned & by whom (admin will mark this)
    returnedAt: Date,
    returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Optional planned return date (could be null)
    plannedReturnDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > Date.now();
        },
        message: "Planned return date must be in the future",
      },
    },

    // Soft delete & audit, if you want to support soft deletes
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Indexes
assetSchema.index({ serialNumber: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ assignmentStatus: 1 });
assetSchema.index({ returnStatus: 1 });

// Instance method: request return
assetSchema.methods.requestReturn = function (userId, reason, notes) {
  if (!this.assignedTo) throw new Error("Asset is not assigned");
  if (this.assignedTo.toString() !== userId.toString()) {
    // allow teamlead to request as well if they have asset assigned to them
    // or if you want teamlead to request for their team member, controller should authorize
  }
  this.returnRequestedBy = userId;
  this.returnRequestedAt = new Date();
  this.returnReason = reason || "";
  this.returnRequestedNotes = notes || "";
  this.returnStatus = "requested";
  return this.save();
};

// Instance method: admin approves return
assetSchema.methods.approveReturn = function (adminId) {
  this.returnStatus = "approved";
  // keep returnedAt for when asset actually handed over
  this.returnedBy = adminId;
  this.returnedAt = new Date();
  // unassign asset
  this.assignedTo = null;
  this.assignmentStatus = "unassigned";
  return this.save();
};

export default mongoose.model("Asset", assetSchema);
