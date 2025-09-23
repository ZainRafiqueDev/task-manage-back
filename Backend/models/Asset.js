import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ["laptop", "imac", "mouse", "keyboard", "headphone", "charger", "bag"],
      required: true,
      lowercase: true, // auto-normalize input
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

    // Return functionality
    returnDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > Date.now();
        },
        message: "Return date must be in the future",
      },
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

export default mongoose.model("Asset", assetSchema);
