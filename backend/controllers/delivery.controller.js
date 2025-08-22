import Delivery from "../models/delivery.model.js";
import Subscription from "../models/subscription.model.js";
import Menu from "../models/menu.model.js";
import { User } from "../models/user.model.js";

export const markMealAsDelivered = async (req, res) => {
  try {
    const chefId = req.userId;
    const { subscriptionId, deliveryDate, dayOfWeek, mealType, itemName, quantity } = req.body;

    // Basic validation
    if (!subscriptionId || !deliveryDate || !dayOfWeek || !mealType || !itemName || !quantity) {
      return res.status(400).json({ success: false, message: "Missing required delivery details." });
    }

    // Verify the subscription exists and belongs to the chef
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found." });
    }
    if (subscription.chef.toString() !== chefId) {
      return res.status(403).json({ success: false, message: "Access denied. You are not the chef for this subscription." });
    }

    // Check if a delivery record already exists for this specific meal on this date
    let delivery = await Delivery.findOne({
      subscription: subscriptionId,
      deliveryDate: new Date(deliveryDate).setHours(0, 0, 0, 0),
      dayOfWeek,
      mealType,
      itemName,
    });

    if (delivery) {
      // If exists, update its status to delivered
      if (delivery.status === 'delivered') {
        return res.status(200).json({ success: true, message: "Meal already marked as delivered.", data: delivery });
      }
      delivery.status = 'delivered';
      delivery.deliveredAt = new Date();
      delivery.deliveryPerson = chefId; // Chef is marking it delivered
    } else {
      // If not exists, create a new delivery record
      delivery = new Delivery({
        subscription: subscriptionId,
        chef: chefId,
        subscriber: subscription.subscriber, // Get subscriber from subscription
        deliveryDate: new Date(deliveryDate).setHours(0, 0, 0, 0),
        dayOfWeek,
        mealType,
        itemName,
        quantity,
        status: 'delivered',
        deliveredAt: new Date(),
        deliveryPerson: chefId,
      });
    }

    await delivery.save();

    res.status(200).json({ success: true, message: "Meal marked as delivered successfully.", data: delivery });
  } catch (error) {
    console.error("Error in markMealAsDelivered: ", error);
    res.status(500).json({ success: false, message: "Server Error in markMealAsDelivered" });
  }
};
