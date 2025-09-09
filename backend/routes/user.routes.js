import express from "express";
import {
  findChefsInArea,
  getUserProfile,
  updateUserProfile,
  getChefDashboardMeals,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/find-chefs", verifyToken, findChefsInArea);

router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

router.get("/dashboard-meals", verifyToken, getChefDashboardMeals);

export default router;
