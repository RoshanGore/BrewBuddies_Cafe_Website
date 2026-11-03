import express from "express";
import {
  register,
  login,
  customerSession,
  getMe,
  updateProfile,
  firebaseCustomerLogin,
  sendCustomerOtp,
  verifyCustomerOtp,
  linkCustomerProvider,
  unlinkCustomerProvider,
  getCustomerSecurityStatus,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Authentication Endpoints
router.post("/register", register);
router.post("/login", login);
router.post("/customer-session", customerSession);

// Customer Multi-Method & Firebase Authentication
router.post("/customer/firebase-login", firebaseCustomerLogin);
router.post("/customer/send-otp", sendCustomerOtp);
router.post("/customer/verify-otp", verifyCustomerOtp);

// Customer Account & Security (Protected)
router.post("/customer/link-provider", protect, linkCustomerProvider);
router.post("/customer/unlink-provider", protect, unlinkCustomerProvider);
router.get("/customer/security-status", protect, getCustomerSecurityStatus);

// Profile & Session
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;
