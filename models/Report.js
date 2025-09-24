// models/Report.js
import mongoose from "mongoose";

// ----------------------
// Feedback Subdocument
// ----------------------
const feedbackSchema = new mongoose.Schema(
  {
    givenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Admin or TeamLead
    role: { type: String, enum: ["admin", "teamlead"], required: true },
    comment: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 }, // Optional rating
  },
  { timestamps: true }
);

// ----------------------
// Main Report Schema
// ----------------------
const reportSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["daily", "monthly"], required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    forUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    content: { type: String, required: true, trim: true },

    tasksCompleted: { type: Number, default: 0, min: 0 },
    tasksPending: { type: Number, default: 0, min: 0 },

    projectStats: {
      done: { type: Number, default: 0, min: 0 },
      inProgress: { type: Number, default: 0, min: 0 },
      selected: { type: Number, default: 0, min: 0 },
    },

    completionStatus: {
      type: String,
      enum: ["pending", "complete", "incomplete"],
      default: "pending",
    },

    feedbacks: [feedbackSchema],

    status: {
      type: String,
      enum: ["submitted", "reviewed", "approved"],
      default: "submitted",
    },

    parentReport: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },

    // New fields
    attachments: [
      {
        filename: String,
        url: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        uploadedAt: Date,
      },
    ],

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: Date,
  },
  { timestamps: true }
);

// ----------------------
// Indexes
// ----------------------
reportSchema.index({ createdBy: 1 });
reportSchema.index({ forUser: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ status: 1 });

export default mongoose.model("Report", reportSchema);
