import express from "express";
import {
  findChefsInArea,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/find-chefs", verifyToken, findChefsInArea);

router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

export default router;
