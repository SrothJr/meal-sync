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

router.get("/offers", verifyToken, getDeliveryOffers);

router.post("/request/:subscriptionId", verifyToken, requestDelivery);

router.get("/requests/:subscriptionId", verifyToken, getDeliveryRequests);

router.post("/appoint/:subscriptionId", verifyToken, appointDeliveryman);

router.post("/ready", verifyToken, markAsReadyForDelivery);

router.post("/mark-delivered", verifyToken, markMealAsDelivered);

router.get("/my-dashboard", verifyToken, getDeliverymanDashboardMeals);

router.patch("/cancel/:deliveryId", verifyToken, cancelDelivery);

router.get("/assigned", verifyToken, getAssignedDeliveries);

export default router;
