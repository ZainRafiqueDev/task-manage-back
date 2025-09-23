// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    receivers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one receiver is required",
      },
    },

    message: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ["info", "warning", "alert", "task", "report"],
      default: "info",
      lowercase: true,
    },

    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Optional: Priority field for better organization
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
      lowercase: true,
    },

    // Optional: Expiry date for notifications
    expiresAt: { type: Date },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for checking if notification is read by current user
notificationSchema.virtual('isRead').get(function() {
  // This will be set dynamically in the controller based on current user
  return this._isRead || false;
});

// Indexes for performance
notificationSchema.index({ receivers: 1 });
notificationSchema.index({ readBy: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

export default mongoose.model("Notification", notificationSchema);