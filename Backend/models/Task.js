import mongoose from "mongoose";

// -------------------
// Sub-schemas
// -------------------
const logSchema = new mongoose.Schema(
  {
    update: { type: String, required: true }, // What was updated/done
    startTime: Date,
    endTime: Date,
    totalTime: { type: Number, default: 0 }, // minutes spent
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Auto-calc totalTime if start & end are provided
logSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    this.totalTime = Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
  }
  next();
});

const employeeResponseSchema = new mongoose.Schema(
  {
    message: { type: String, required: true }, // Employee's feedback/progress
    type: { type: String, enum: ["progress", "issue", "pending-info"], default: "progress" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// -------------------
// Main Task Schema
// -------------------
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    specialInstructions: { type: String, trim: true },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Employee
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // Project link

    status: {
      type: String,
      enum: ["pending", "in-progress", "review", "completed", "blocked"],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    dueDate: Date,
    projectLink: { type: String, trim: true },

    logs: [logSchema], // Time tracking & updates
    employeeResponses: [employeeResponseSchema], // Employee feedback/issues

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Teamlead/Admin
  },
  { timestamps: true }
);

// Indexes for faster queries
taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });

export default mongoose.model("Task", taskSchema);
