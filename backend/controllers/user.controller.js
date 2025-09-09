import { User } from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import Menu from "../models/menu.model.js";
import Delivery from "../models/delivery.model.js";

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export const findChefsInArea = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const chefs = await User.find({
      area: currentUser.area,
      role: "chef",
      _id: { $ne: currentUserId },
    }).select("email name area");

    res.status(200).json({ success: true, chefs });
  } catch (error) {
    console.error("Error in findChefsInArea: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in getUserProfile: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, area } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    user.name = name || user.name;
    user.area = area || user.area;
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        area: updatedUser.area,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error in updateUserProfile: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getChefDashboardMeals = async (req, res) => {
  try {
    const chefId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const endOfNextWeek = new Date(today);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

    const activeSubscriptions = await Subscription.find({
      chef: chefId,
      status: "active",
      endDate: { $gte: today },
    })
      .populate("menu", "schedule")
      .populate("subscriber", "name")
      .populate("delivery.deliveryPerson", "name email");

    const allMeals = [];

    activeSubscriptions.forEach((sub) => {
      for (
        let d = new Date(today);
        d <= endOfNextWeek;
        d.setDate(d.getDate() + 1)
      ) {
        const currentDayOfWeek = d.toLocaleDateString("en-US", {
          weekday: "long",
        });

        if (d >= sub.startDate && d <= sub.endDate) {
          sub.selection.forEach((selectedDay) => {
            if (selectedDay.day === currentDayOfWeek) {
              selectedDay.mealTypes.forEach((mealType) => {
                const menuItem = sub.menu.schedule.find(
                  (item) =>
                    item.day === currentDayOfWeek && item.mealType === mealType
                );

                if (menuItem) {
                  const mealItem = {
                    subscriptionId: sub._id,
                    deliveryDate: new Date(d).setHours(0, 0, 0, 0),
                    day: currentDayOfWeek,
                    mealType: mealType,
                    itemName: menuItem.name,
                    quantity: 1,
                    subscribers: [
                      { id: sub.subscriber._id, name: sub.subscriber.name },
                    ],
                    price: menuItem.price,
                    deliveryStatus: "unprepared",
                    deliveryRecordId: null,

                    deliveryPerson: sub.delivery?.deliveryPerson
                      ? {
                          _id: sub.delivery.deliveryPerson._id,
                          name: sub.delivery.deliveryPerson.name,
                          email: sub.delivery.deliveryPerson.email,
                        }
                      : null,
                    subscriptionDeliveryStatus: sub.delivery?.deliveryStatus,
                  };
                  allMeals.push(mealItem);
                }
              });
            }
          });
        }
      }
    });

    const aggregatedMealsMap = new Map();
    allMeals.forEach((meal) => {
      const mealKey = `${meal.deliveryDate}-${meal.day}-${meal.mealType}-${meal.itemName}`;
      if (!aggregatedMealsMap.has(mealKey)) {
        aggregatedMealsMap.set(mealKey, {
          ...meal,
          quantity: 0,
          subscribers: [],
          subscriptionIds: new Set(),
        });
      }
      const aggregatedMeal = aggregatedMealsMap.get(mealKey);
      aggregatedMeal.quantity += meal.quantity;
      aggregatedMeal.subscribers.push(...meal.subscribers);
      aggregatedMeal.subscriptionIds.add(meal.subscriptionId);
    });

    const finalAggregatedMeals = Array.from(aggregatedMealsMap.values()).map(
      (meal) => {
        meal.subscriptionIds = Array.from(meal.subscriptionIds);
        return meal;
      }
    );

    const relevantDeliveryRecords = await Delivery.find({
      chef: chefId,
      deliveryDate: { $gte: today, $lte: endOfNextWeek },
      subscription: { $in: activeSubscriptions.map((sub) => sub._id) },
    });

    const deliveryRecordMap = new Map();
    relevantDeliveryRecords.forEach((record) => {
      const key = `${record.subscription}-${new Date(
        record.deliveryDate
      ).setHours(0, 0, 0, 0)}-${record.dayOfWeek}-${record.mealType}-${
        record.itemName
      }`;
      deliveryRecordMap.set(key, record);
    });

    finalAggregatedMeals.forEach((meal) => {
      const key = `${meal.subscriptionId}-${meal.deliveryDate}-${meal.day}-${meal.mealType}-${meal.itemName}`;
      if (deliveryRecordMap.has(key)) {
        const record = deliveryRecordMap.get(key);
        meal.deliveryStatus = record.status;
        meal.deliveryRecordId = record._id;
      }
    });

    const finalMealsToday = finalAggregatedMeals.filter((meal) =>
      isSameDay(new Date(meal.deliveryDate), today)
    );
    const finalMealsTomorrow = finalAggregatedMeals.filter((meal) =>
      isSameDay(new Date(meal.deliveryDate), tomorrow)
    );
    const finalMealsNextWeek = finalAggregatedMeals.filter(
      (meal) =>
        new Date(meal.deliveryDate) > tomorrow &&
        new Date(meal.deliveryDate) <= endOfNextWeek
    );

    res.status(200).json({
      success: true,
      data: {
        today: finalMealsToday,
        tomorrow: finalMealsTomorrow,
        nextWeek: finalMealsNextWeek,
      },
    });
  } catch (error) {
    console.error("Error in getChefDashboardMeals: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
