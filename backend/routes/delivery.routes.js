import express from "express";
import { markMealAsDelivered } from "../controllers/delivery.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// @route   POST /api/deliveries/mark-delivered
// @desc    Mark a specific meal as delivered for a subscription
// @access  Private (chef only)
router.post("/mark-delivered", verifyToken, markMealAsDelivered);

export default router;
