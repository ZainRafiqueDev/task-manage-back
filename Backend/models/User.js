// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  email: { 
    type: String, 
    unique: true, 
    index: true,
    required: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
  },

  password: { type: String, required: true, minlength: 6 },

  role: { 
    type: String, 
    enum: ["admin", "teamlead", "employee"], 
    default: "employee"
  },

  cnic: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    match: [/^\d{5}-\d{7}-\d$/, "Please enter a valid CNIC (e.g. 12345-1234567-1)"]
  },

  phone: { 
    type: String,
    required: true,
    match: [/^(03[0-9]{9}|(\+923[0-9]{9}))$/, "Please enter a valid Pakistani phone number"]
  },

  isActive: { type: Boolean, default: true },

  assignedAssets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],

  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
