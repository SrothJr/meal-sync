import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  adminLogin,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);

router.post("/login", login);

router.post("/admin/login", adminLogin);

router.post("/logout", logout);

router.post("/verify-email", verifyEmail);

router.post("/reset-password/:token", resetPassword);

router.post("/forgot-password", forgotPassword);
export default router;
