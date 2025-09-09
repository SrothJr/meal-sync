import express from "express";
import {
  createSubscription,
  getChefSubscriptions,
  updateSubscriptionStatus,
  renewSubscription,
  getMySubscriptions,
  getSubscriptionById,
  unassignDeliverymanByChef,
  unassignDeliverymanByDeliveryman,
} from "../controllers/subscription.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createSubscription);

router.get("/chef", verifyToken, getChefSubscriptions);

router.get("/my-subscriptions", verifyToken, getMySubscriptions);

router.patch("/:subscriptionId/status", verifyToken, updateSubscriptionStatus);

router.post("/:subscriptionId/renew", verifyToken, renewSubscription);

router.get("/:subscriptionId", verifyToken, getSubscriptionById);

router.patch(
  "/:subscriptionId/unassign/chef",
  verifyToken,
  unassignDeliverymanByChef
);

router.patch(
  "/:subscriptionId/unassign/deliveryman",
  verifyToken,
  unassignDeliverymanByDeliveryman
);

export default router;
