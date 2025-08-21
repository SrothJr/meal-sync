import Subscription from "../models/subscription.model.js";
import Menu from "../models/menu.model.js";
import { User } from "../models/user.model.js";

export const createSubscription = async (req, res) => {
  try {
    const { menuId, selection, subscriptionType, startDate, autoRenew } =
      req.body;
    const subscriberId = req.userId;

    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res
        .status(404)
        .json({ success: false, message: "Menu not found" });
    }

    const chefId = menu.chef;

    const subscriber = await User.findById(subscriberId);
    if (!subscriber) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const chef = await User.findById(chefId);
    if (!chef) {
      return res
        .status(404)
        .json({ success: false, message: "Chef not found" });
    }

    // core logic starts here [won't do it in first try]

    const startDateObj = new Date(startDate);
    const endDate = new Date(startDateObj);

    const priceLookup = new Map();
    menu.schedule.forEach((item) => {
      const key = `${item.day}-${item.mealType}`;
      priceLookup.set(key, item.price);
    });

    const selectionMap = new Map();
    selection.forEach((s) => {
      selectionMap.set(s.day, s.mealTypes);
    });

    let totalPrice = 0;

    if (subscriptionType === "weekly") {
      endDate.setDate(startDateObj.getDate() + 7);

      selection.forEach((selectedDay) => {
        selectedDay.mealTypes.forEach((mealType) => {
          const key = `${selectedDay.day}-${mealType}`;
          totalPrice += priceLookup.get(key) || 0;
        });
      });
    } else if (subscriptionType == "monthly") {
      endDate.setMonth(startDateObj.getMonth() + 1);

      let currentDate = new Date(startDateObj);
      while (currentDate < endDate) {
        const dayOfWeek = currentDate.toLocaleDateString("en-US", {
          weekday: "long",
        });

        if (selectionMap.has(dayOfWeek)) {
          const mealTypesForDay = selectionMap.get(dayOfWeek);
          mealTypesForDay.forEach((mealType) => {
            const key = `${dayOfWeek}-${mealType}`;
            totalPrice += priceLookup.get(key) || 0;
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const subscription = new Subscription({
      subscriber: subscriberId,
      chef: chefId,
      menu: menuId,
      selection,
      subscriptionType,
      startDate: startDateObj,
      endDate,
      totalPrice,
      autoRenew,
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      data: subscription,
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.error("Error creating subscription ", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed. Please check your input",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error in createSubscription",
      error: error.message,
    });
  }
};

export const getChefSubscription = async (req, res) => {
  try {
    const chefId = req.userId;

    const subscriptions = await Subscription.find({ chef: chefId })
      .populate("subscriber", "name email area")
      .populate("menu", "title");

    if (!subscriptions || subscriptions.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No subscriptions found for this chef",
        });
    }

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    console.error("Error in getChefSubscription: ", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server Error in getChefSubscription",
        error: error.message,
      });
  }
};
