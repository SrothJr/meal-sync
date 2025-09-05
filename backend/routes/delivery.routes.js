import express from "express";
import {
  getDeliveryOffers,
  requestDelivery,
  getDeliveryRequests,
  appointDeliveryman,
  markAsReadyForDelivery,
  markMealAsDelivered,
  getDeliverymanDashboardMeals,
  cancelDelivery,
  getAssignedDeliveries,
} from "../controllers/delivery.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// @route   GET /api/deliveries/offers
// @desc    Get all available delivery offers for deliverymen
// @access  Private (deliveryman only)
router.get("/offers", verifyToken, getDeliveryOffers);

// @route   POST /api/deliveries/request/:subscriptionId
// @desc    Request to be assigned to a subscription for delivery
// @access  Private (deliveryman only)
router.post("/request/:subscriptionId", verifyToken, requestDelivery);

// @route   GET /api/deliveries/requests/:subscriptionId
// @desc    Get all delivery requests for a subscription
// @access  Private (chef only)
router.get("/requests/:subscriptionId", verifyToken, getDeliveryRequests);

// @route   POST /api/deliveries/appoint/:subscriptionId
// @desc    Appoint a deliveryman to a subscription
// @access  Private (chef only)
router.post("/appoint/:subscriptionId", verifyToken, appointDeliveryman);

// @route   POST /api/deliveries/ready
// @desc    Mark a meal as ready for delivery
// @access  Private (chef only)
router.post("/ready", verifyToken, markAsReadyForDelivery);

// @route   POST /api/deliveries/mark-delivered
// @desc    Mark a specific meal as delivered for a subscription
// @access  Private (chef or deliveryman)
router.post("/mark-delivered", verifyToken, markMealAsDelivered);

// @route   GET /api/deliveries/my-dashboard
// @desc    Get assigned deliveries for the logged-in deliveryman
// @access  Private (deliveryman only)
router.get("/my-dashboard", verifyToken, getDeliverymanDashboardMeals);

// @route   PATCH /api/deliveries/cancel/:deliveryId
// @desc    Cancel a delivery (chef only)
// @access  Private (chef only)
router.patch("/cancel/:deliveryId", verifyToken, cancelDelivery);

// @route   GET /api/deliveries/assigned
// @desc    Get all assigned subscriptions for the logged-in deliveryman
// @access  Private (deliveryman only)
router.get("/assigned", verifyToken, getAssignedDeliveries);

export default router;
