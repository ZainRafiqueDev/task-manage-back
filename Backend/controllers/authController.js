import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";  // ✅ Added

// Generate JWT and set HttpOnly cookie
// controllers/authController.js


const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true, // prevent JS access
    secure: process.env.NODE_ENV === "production", // only https in prod
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(res, user._id);

    res.json({
      success: true,
      token, // optional if you also set in cookie
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc Register new user
export const register = async (req, res) => {
  const { name, email, password, role, cnic, phone } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    if (await User.findOne({ cnic })) {
      return res.status(400).json({ success: false, message: "CNIC already registered" });
    }

    const user = await User.create({ name, email, password, role, cnic, phone });

    generateToken(res, user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed", error: err.message });
  }
};

// @desc Login user


// @desc Reset password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.password = password; // ✅ will be hashed in pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
};

// @desc Get current user
export const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Not authorized" });

    res.json({
      success: true,
      user: { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to load user" });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    // Generate reset token (JWT)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // token valid for 15 minutes
    );

    // Reset link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * @desc Logout user (clear cookie)
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
