import Delivery from "../models/delivery.model.js";
import Subscription from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

// For Deliverymen: Get all subscriptions available for delivery
export const getDeliveryOffers = async (req, res) => {
  try {
    const deliveryman = await User.findById(req.userId);
    if (deliveryman.role !== "deliveryman") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Not a deliveryman." });
    }

    const availableSubscriptions = await Subscription.find({
      "delivery.deliveryStatus": "unassigned",
    }).populate("chef", "name area");

    res.status(200).json({ success: true, data: availableSubscriptions });
  } catch (error) {
    console.error("Error in getDeliveryOffers: ", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error in getDeliveryOffers" });
  }
};

// For Deliverymen: Request to be assigned to a subscription
export const requestDelivery = async (req, res) => {
  try {
    const deliverymanId = req.userId;
    const { subscriptionId } = req.params;
    const { message } = req.body;

    const deliveryman = await User.findById(deliverymanId);
    if (deliveryman.role !== "deliveryman") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Not a deliveryman." });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found." });
    }

    // Check if the deliveryman has already requested this subscription
    const existingRequest = subscription.delivery.requests.find(
      (req) => req.deliveryman.toString() === deliverymanId
    );
    if (existingRequest) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already requested this delivery.",
        });
    }

    subscription.delivery.requests.push({
      deliveryman: deliverymanId,
      message,
    });
    subscription.delivery.deliveryStatus = "pending_approval";

    await subscription.save();

    res
      .status(200)
      .json({ success: true, message: "Delivery request sent successfully." });
  } catch (error) {
    console.error("Error in requestDelivery: ", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error in requestDelivery" });
  }
};

// For Chefs: Get all delivery requests for a subscription
export const getDeliveryRequests = async (req, res) => {
  try {
    const chefId = req.userId;
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId).populate(
      "delivery.requests.deliveryman",
      "name email"
    );

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found." });
    }

    if (subscription.chef.toString() !== chefId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. You are not the chef for this subscription.",
        });
    }

    res.status(200).json({ success: true, data: subscription.delivery.requests });
  } catch (error) {
    console.error("Error in getDeliveryRequests: ", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server Error in getDeliveryRequests",
      });
  }
};

// For Chefs: Appoint a deliveryman to a subscription
export const appointDeliveryman = async (req, res) => {
  try {
    const chefId = req.userId;
    const { subscriptionId } = req.params;
    const { deliverymanId, requestId } = req.body;

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found." });
    }

    if (subscription.chef.toString() !== chefId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. You are not the chef for this subscription.",
        });
    }

    // Appoint the deliveryman
    subscription.delivery.deliveryPerson = deliverymanId;
    subscription.delivery.deliveryStatus = "assigned";

    // Update the status of the approved request
    const request = subscription.delivery.requests.id(requestId);
    if (request) {
      request.status = "approved";
    }

    await subscription.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Deliveryman appointed successfully.",
        data: subscription,
      });
  } catch (error) {
    console.error("Error in appointDeliveryman: ", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error in appointDeliveryman" });
  }
};

// For Chefs: Mark a meal as ready for delivery
export const markAsReadyForDelivery = async (req, res) => {
  try {
    const chefId = req.userId;
    const {
      subscriptionId,
      deliveryDate,
      dayOfWeek,
      mealType,
      itemName,
      quantity,
    } = req.body;

    // Basic validation
    if (
      !subscriptionId ||
      !deliveryDate ||
      !dayOfWeek ||
      !mealType ||
      !itemName ||
      !quantity
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required delivery details." });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found." });
    }
    if (subscription.chef.toString() !== chefId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. You are not the chef for this subscription.",
        });
    }
    if (subscription.delivery.deliveryStatus !== "assigned") {
      return res
        .status(400)
        .json({
          success: false,
          message: "No delivery person assigned to this subscription.",
        });
    }

    // Create a new delivery record
    const delivery = new Delivery({
      subscription: subscriptionId,
      chef: chefId,
      subscriber: subscription.subscriber,
      deliveryPerson: subscription.delivery.deliveryPerson,
      deliveryDate: new Date(deliveryDate).setHours(0, 0, 0, 0),
      dayOfWeek,
      mealType,
      itemName,
      quantity,
      status: "prepared", // New status
    });

    await delivery.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Meal marked as ready for delivery.",
        data: delivery,
      });
  } catch (error) {
    console.error("Error in markAsReadyForDelivery: ", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server Error in markAsReadyForDelivery",
      });
  }
};

export const markMealAsDelivered = async (req, res) => {
  try {
    const userId = req.userId; // Can be chef or deliveryman
    const {
      deliveryId, // We'll use deliveryId to find the delivery record
    } = req.body;

    if (!deliveryId) {
      return res
        .status(400)
        .json({ success: false, message: "Delivery ID is required." });
    }

    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery record not found." });
    }

    const user = await User.findById(userId);

    // Authorization: only the assigned delivery person or the chef can mark as delivered
    if (
      user.role !== "chef" &&
      delivery.deliveryPerson.toString() !== userId
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. You are not authorized to perform this action.",
        });
    }

    if (delivery.status === "delivered") {
      return res
        .status(200)
        .json({
          success: true,
          message: "Meal already marked as delivered.",
          data: delivery,
        });
    }

    delivery.status = "delivered";
    delivery.deliveredAt = new Date();

    await delivery.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Meal marked as delivered successfully.",
        data: delivery,
      });
  } catch (error) {
    console.error("Error in markMealAsDelivered: ", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server Error in markMealAsDelivered",
      });
  }
};