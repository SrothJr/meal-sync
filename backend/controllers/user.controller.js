import { User } from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import Menu from "../models/menu.model.js";
import Delivery from "../models/delivery.model.js"; // Import Delivery model

export const findChefsInArea = async (req, res) => {
  try {
    const currentUserId = req.userId;
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
    const user = await User.findById(req.userId).select("-password");

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

    const user = await User.findById(req.userId);
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
    const chefId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const endOfNextWeek = new Date(today);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 7); // Covers 7 days from today (inclusive)

    const activeSubscriptions = await Subscription.find({
      chef: chefId,
      status: "active",
      endDate: { $gte: today }, // Subscription must end today or in the future
    }).populate("menu", "schedule")
      .populate("subscriber", "name"); // Populate subscriber name for display

    const mealsToday = {};
    const mealsTomorrow = {};
    const mealsNextWeek = {};

    activeSubscriptions.forEach(sub => {
      for (let d = new Date(today); d <= endOfNextWeek; d.setDate(d.getDate() + 1)) {
        const currentDayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });

        if (d >= sub.startDate && d <= sub.endDate) {
          sub.selection.forEach(selectedDay => {
            if (selectedDay.day === currentDayOfWeek) {
              selectedDay.mealTypes.forEach(mealType => {
                const menuItem = sub.menu.schedule.find(
                  item => item.day === currentDayOfWeek && item.mealType === mealType
                );

                if (menuItem) {
                  const mealKey = `${currentDayOfWeek}-${mealType}-${menuItem.name}`;

                  if (isSameDay(d, today)) {
                    mealsToday[mealKey] = mealsToday[mealKey] || {
                      day: currentDayOfWeek,
                      mealType: mealType,
                      itemName: menuItem.name,
                      quantity: 0,
                      subscribers: [],
                      price: menuItem.price,
                      isDelivered: false, // Initialize isDelivered
                      subscriptionId: sub._id, // Add subscriptionId for delivery tracking
                    };
                    mealsToday[mealKey].quantity += 1;
                    mealsToday[mealKey].subscribers.push({
                      id: sub.subscriber._id,
                      name: sub.subscriber.name,
                    });
                  } else if (isSameDay(d, tomorrow)) {
                    mealsTomorrow[mealKey] = mealsTomorrow[mealKey] || {
                      day: currentDayOfWeek,
                      mealType: mealType,
                      itemName: menuItem.name,
                      quantity: 0,
                      subscribers: [],
                      price: menuItem.price,
                    };
                    mealsTomorrow[mealKey].quantity += 1;
                    mealsTomorrow[mealKey].subscribers.push({
                      id: sub.subscriber._id,
                      name: sub.subscriber.name,
                    });
                  }

                  mealsNextWeek[mealKey] = mealsNextWeek[mealKey] || {
                    day: currentDayOfWeek,
                    mealType: mealType,
                    itemName: menuItem.name,
                    quantity: 0,
                    subscribers: [],
                    price: menuItem.price,
                  };
                  mealsNextWeek[mealKey].quantity += 1;
                  mealsNextWeek[mealKey].subscribers.push({
                    id: sub.subscriber._id,
                    name: sub.subscriber.name,
                  });
                }
              });
            }
          });
        }
      }
    });

    // Check delivery status for today's meals
    const deliveredRecords = await Delivery.find({
      chef: chefId,
      deliveryDate: today,
      status: 'delivered',
    });

    deliveredRecords.forEach(record => {
      const mealKey = `${record.dayOfWeek}-${record.mealType}-${record.itemName}`;
      // Find the corresponding meal in mealsToday and mark it as delivered
      // Need to iterate through mealsToday values to find a match, as mealKey is unique per aggregated meal
      const mealToUpdate = Object.values(mealsToday).find(meal =>
        meal.day === record.dayOfWeek &&
        meal.mealType === record.mealType &&
        meal.itemName === record.itemName
      );
      if (mealToUpdate) {
        mealToUpdate.isDelivered = true;
      }
    });

    function isSameDay(d1, d2) {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
    }

    res.status(200).json({
      success: true,
      data: {
        today: Object.values(mealsToday),
        tomorrow: Object.values(mealsTomorrow),
        nextWeek: Object.values(mealsNextWeek),
      },
    });
  } catch (error) {
    console.error("Error in getChefDashboardMeals: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
