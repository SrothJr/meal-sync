import Delivery from "../models/delivery.model.js";
import Subscription from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

export const getDeliveryOffers = async (req, res) => {
  try {
    const deliveryman = await User.findById(req.user.userId);
    if (deliveryman.role !== "deliveryman") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Not a deliveryman." });
    }

    const deliverymanArea = deliveryman.area;

    const availableSubscriptions = await Subscription.find({
      "delivery.deliveryStatus": { $in: ["unassigned", "pending_approval"] },
    })
      .populate({
        path: "chef",
        select: "name area",
        match: { area: deliverymanArea },
      })
      .populate("subscriber", "name area");

    const filteredSubscriptions = availableSubscriptions.filter(
      (sub) => sub.chef !== null
    );

    res.status(200).json({ success: true, data: filteredSubscriptions });
  } catch (error) {
    console.error("Error in getDeliveryOffers: ", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error in getDeliveryOffers" });
  }
};

export const requestDelivery = async (req, res) => {
  try {
    const deliverymanId = req.user.userId;
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

    const existingRequest = subscription.delivery.requests.find(
      (req) => req.deliveryman.toString() === deliverymanId
    );
    if (existingRequest) {
      return res.status(400).json({
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

export const getDeliveryRequests = async (req, res) => {
  try {
    const chefId = req.user.userId;
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
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not the chef for this subscription.",
      });
    }

    res
      .status(200)
      .json({ success: true, data: subscription.delivery.requests });
  } catch (error) {
    console.error("Error in getDeliveryRequests: ", error);
    res.status(500).json({
      success: false,
      message: "Server Error in getDeliveryRequests",
    });
  }
};

export const appointDeliveryman = async (req, res) => {
  try {
    const chefId = req.user.userId;
    const { subscriptionId } = req.params;
    const { deliverymanId, requestId } = req.body;

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found." });
    }

    if (subscription.chef.toString() !== chefId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not the chef for this subscription.",
      });
    }

    subscription.delivery.deliveryPerson = deliverymanId;
    subscription.delivery.deliveryStatus = "assigned";

    subscription.delivery.requests.forEach((request) => {
      if (request._id.toString() === requestId) {
        request.status = "approved";
      } else {
        request.status = "rejected";
      }
    });

    await subscription.save();

    res.status(200).json({
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

export const markAsReadyForDelivery = async (req, res) => {
  try {
    const chefId = req.user.userId;
    const {
      subscriptionId,
      deliveryDate,
      dayOfWeek,
      mealType,
      itemName,
      quantity,
    } = req.body;

    if (
      !subscriptionId ||
      !deliveryDate ||
      !dayOfWeek ||
      !mealType ||
      !itemName ||
      !quantity
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required delivery details.",
      });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found." });
    }
    if (subscription.chef.toString() !== chefId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not the chef for this subscription.",
      });
    }
    if (subscription.delivery.deliveryStatus !== "assigned") {
      return res.status(400).json({
        success: false,
        message: "No delivery person assigned to this subscription.",
      });
    }

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
      status: "prepared",
    });

    await delivery.save();

    res.status(200).json({
      success: true,
      message: "Meal marked as ready for delivery.",
      data: delivery,
    });
  } catch (error) {
    console.error("Error in markAsReadyForDelivery: ", error);
    res.status(500).json({
      success: false,
      message: "Server Error in markAsReadyForDelivery",
    });
  }
};

export const markMealAsDelivered = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deliveryId } = req.body;

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

    if (user.role !== "chef" && delivery.deliveryPerson.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You are not authorized to perform this action.",
      });
    }

    if (delivery.status === "delivered") {
      return res.status(200).json({
        success: true,
        message: "Meal already marked as delivered.",
        data: delivery,
      });
    }

    delivery.status = "delivered";
    delivery.deliveredAt = new Date();

    await delivery.save();

    res.status(200).json({
      success: true,
      message: "Meal marked as delivered successfully.",
      data: delivery,
    });
  } catch (error) {
    console.error("Error in markMealAsDelivered: ", error);
    res.status(500).json({
      success: false,
      message: "Server Error in markMealAsDelivered",
    });
  }
};

export const getDeliverymanDashboardMeals = async (req, res) => {
  try {
    const deliverymanId = req.user.userId;
    const deliveryman = await User.findById(deliverymanId);

    if (deliveryman.role !== "deliveryman") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Not a deliveryman." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const deliveries = await Delivery.find({
      deliveryPerson: deliverymanId,
      status: { $ne: "delivered" },
      deliveryDate: { $gte: today },
    })
      .populate("subscription", "menu chef subscriber")
      .populate("chef", "name")
      .populate("subscriber", "name area");

    const todayDeliveries = deliveries.filter(
      (delivery) =>
        delivery.deliveryDate.toDateString() === today.toDateString()
    );

    const tomorrowDeliveries = deliveries.filter(
      (delivery) =>
        delivery.deliveryDate.toDateString() === tomorrow.toDateString()
    );

    const nextWeekDeliveries = deliveries.filter(
      (delivery) =>
        delivery.deliveryDate > tomorrow && delivery.deliveryDate <= nextWeek
    );

    res.status(200).json({
      success: true,
      data: {
        today: todayDeliveries,
        tomorrow: tomorrowDeliveries,
        nextWeek: nextWeekDeliveries,
      },
    });
  } catch (error) {
    console.error("Error in getDeliverymanDashboardMeals: ", error);
    res.status(500).json({
      success: false,
      message: "Server Error in getDeliverymanDashboardMeals",
    });
  }
};

export const cancelDelivery = async (req, res) => {
  try {
    const chefId = req.user.userId;
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery record not found." });
    }

    if (delivery.chef.toString() !== chefId) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You are not authorized to cancel this delivery.",
      });
    }

    if (delivery.status === "delivered") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel a delivered meal." });
    }

    await Delivery.findByIdAndDelete(deliveryId);

    res
      .status(200)
      .json({ success: true, message: "Delivery cancelled successfully." });
  } catch (error) {
    console.error("Error in cancelDelivery: ", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error in cancelDelivery" });
  }
};

export const getAssignedDeliveries = async (req, res) => {
  try {
    const deliverymanId = req.user.userId;

    const deliveryman = await User.findById(deliverymanId);
    if (deliveryman.role !== "deliveryman") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Not a deliveryman." });
    }

    const assignedSubscriptions = await Subscription.find({
      "delivery.deliveryPerson": deliverymanId,
      "delivery.deliveryStatus": "assigned",
    })
      .populate("chef", "name email area")
      .populate("subscriber", "name email area")
      .populate("menu", "title");

    res.status(200).json({ success: true, data: assignedSubscriptions });
  } catch (error) {
    console.error("Error in getAssignedDeliveries: ", error);
    res.status(500).json({
      success: false,
      message: "Server Error in getAssignedDeliveries",
    });
  }
};
