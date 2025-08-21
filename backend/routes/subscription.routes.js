import express from "express";
import {
  createSubscription,
  getChefSubscriptions,
  updateSubscriptionStatus,
  renewSubscription,
  getMySubscriptions,
} from "../controllers/subscription.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// @route   POST /api/subscriptions
// @desc    Create a new subscription (for subscribers)
// @access  Private
router.post("/", verifyToken, createSubscription);

// @route   GET /api/subscriptions/chef
// @desc    Get all subscriptions for the logged-in chef
// @access  Private (for chefs)
router.get("/chef", verifyToken, getChefSubscriptions);

// @route   GET /api/subscriptions/my-subscriptions
// @desc    Get all subscriptions for the logged-in subscriber
// @access  Private (for subscribers)
router.get("/my-subscriptions", verifyToken, getMySubscriptions);

// @route   PATCH /api/subscriptions/:subscriptionId/status
// @desc    Update a subscription's status (for chefs and subscribers)
// @access  Private
router.patch("/:subscriptionId/status", verifyToken, updateSubscriptionStatus);

// @route   POST /api/subscriptions/:subscriptionId/renew
// @desc    Manually renew a subscription (for subscribers)
// @access  Private
router.post("/:subscriptionId/renew", verifyToken, renewSubscription);

export default router;
