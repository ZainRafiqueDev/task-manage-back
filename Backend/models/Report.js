// models/Report.js
import mongoose from "mongoose";

// ----------------------
// Feedback Subdocument
// ----------------------
const feedbackSchema = new mongoose.Schema(
  {
    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Admin or TeamLead
    },
    role: {
      type: String,
      enum: ["admin", "teamlead"],
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    }, // Optional rating
  },
  { timestamps: true } // tracks createdAt & updatedAt for feedback
);

// ----------------------
// Main Report Schema
// ----------------------
const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["daily", "monthly"],
      required: true,
    },

    // Who made this report
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // If the report is about a specific employee
    forUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Report content
    content: {
      type: String,
      required: true,
      trim: true,
    },

    tasksCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    tasksPending: {
      type: Number,
      default: 0,
      min: 0,
    },

    projectStats: {
      done: { type: Number, default: 0, min: 0 },
      inProgress: { type: Number, default: 0, min: 0 },
      selected: { type: Number, default: 0, min: 0 },
    },

    // Completion status (teamlead marks employee reports, admin marks teamlead reports)
    completionStatus: {
      type: String,
      enum: ["pending", "complete", "incomplete"],
      default: "pending",
    },

    // Feedback from team lead or admin
    feedbacks: [feedbackSchema],

    // Status of the report workflow
    status: {
      type: String,
      enum: ["submitted", "reviewed", "approved"],
      default: "submitted",
    },

    // For linking monthly summary
    parentReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

// ----------------------
// Indexes for Performance
// ----------------------
reportSchema.index({ createdBy: 1 });
reportSchema.index({ forUser: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ status: 1 });

export default mongoose.model("Report", reportSchema);
