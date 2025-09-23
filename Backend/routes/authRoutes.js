// routes/authRoutes.js
import express from "express";
import { 
  register, 
  login, 
  logout, 
  forgotPassword, 
  resetPassword ,
  getMe
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// Public routes
// ==========================
router.post("/register", register);        // New user registration
router.post("/login", login);              // User login
router.post("/forgot-password", forgotPassword); // Generate reset token
router.put("/reset-password/:token", resetPassword); // Reset password
router.get("/me", protect, getMe);  
// ==========================
// Protected routes
// ==========================
router.post("/logout", protect, logout);   // Logout (requires login)

export default router;
