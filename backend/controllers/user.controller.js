import { User } from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import Menu from "../models/menu.model.js";
import Delivery from "../models/delivery.model.js"; // Import Delivery model

// Helper function to check if two dates are the same day
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

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

    console.error("Step 1: Fetching active subscriptions...");
    const activeSubscriptions = await Subscription.find({
      chef: chefId,
      status: "active",
      endDate: { $gte: today }, // Subscription must end today or in the future
    })
      .populate("menu", "schedule")
      .populate("subscriber", "name") // Populate subscriber name for display
      .populate("delivery.deliveryPerson", "name email"); // Populate delivery person details
    console.error("Step 1 Complete: Active subscriptions fetched.");

    const allMeals = [];

    console.error("Step 2: Processing active subscriptions and creating allMeals array...");
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
                  const mealItem = {
                    subscriptionId: sub._id,
                    deliveryDate: new Date(d).setHours(0,0,0,0), // Store the actual date
                    day: currentDayOfWeek,
                    mealType: mealType,
                    itemName: menuItem.name,
                    quantity: 1, // Start with 1, will aggregate later
                    subscribers: [{ id: sub.subscriber._id, name: sub.subscriber.name }],
                    price: menuItem.price,
                    deliveryStatus: 'unprepared', // Default status
                    deliveryRecordId: null, // To store the _id of the Delivery record if found
                    // Add deliveryPerson details if needed for display
                    deliveryPerson: sub.delivery?.deliveryPerson ? {
                      _id: sub.delivery.deliveryPerson._id,
                      name: sub.delivery.deliveryPerson.name,
                      email: sub.delivery.deliveryPerson.email
                    } : null,
                    subscriptionDeliveryStatus: sub.delivery?.deliveryStatus // Status of the subscription's delivery assignment
                  };
                  allMeals.push(mealItem);
                }
              });
            }
          });
        }
      }
    });
    console.error("Step 2 Complete: allMeals array created. allMeals.length:", allMeals.length);

    // Aggregate meals (combine same meals from different subscribers)
    const aggregatedMealsMap = new Map();
    console.error("Step 3: Aggregating meals...");
    allMeals.forEach(meal => {
      const mealKey = `${meal.deliveryDate}-${meal.day}-${meal.mealType}-${meal.itemName}`;
      if (!aggregatedMealsMap.has(mealKey)) {
        aggregatedMealsMap.set(mealKey, {
          ...meal,
          quantity: 0, // Reset quantity for aggregation
          subscribers: [], // Reset subscribers for aggregation
          subscriptionIds: new Set(), // To track unique subscriptions for this aggregated meal
        });
      }
      const aggregatedMeal = aggregatedMealsMap.get(mealKey);
      aggregatedMeal.quantity += meal.quantity;
      aggregatedMeal.subscribers.push(...meal.subscribers);
      aggregatedMeal.subscriptionIds.add(meal.subscriptionId); // Add subscription ID to the set
    });
    console.error("Step 3 Complete: Meals aggregated. aggregatedMealsMap.size:", aggregatedMealsMap.size);

    const finalAggregatedMeals = Array.from(aggregatedMealsMap.values()).map(meal => {
      // Convert Set to Array for easier consumption
      meal.subscriptionIds = Array.from(meal.subscriptionIds);
      return meal;
    });
    console.error("Step 4: Final aggregated meals array created. finalAggregatedMeals.length:", finalAggregatedMeals.length);


    console.error("Step 5: Fetching relevant Delivery records...");
    const relevantDeliveryRecords = await Delivery.find({
      chef: chefId,
      deliveryDate: { $gte: today, $lte: endOfNextWeek },
      subscription: { $in: activeSubscriptions.map(sub => sub._id) } // Filter by subscriptions that are active
    });
    console.error("Step 5 Complete: Relevant Delivery records fetched. relevantDeliveryRecords.length:", relevantDeliveryRecords.length);

    // Create a map for quick lookup of delivery records
    const deliveryRecordMap = new Map();
    console.error("Step 6: Creating delivery record map...");
    relevantDeliveryRecords.forEach(record => {
      const key = `${record.subscription}-${new Date(record.deliveryDate).setHours(0,0,0,0)}-${record.dayOfWeek}-${record.mealType}-${record.itemName}`;
      deliveryRecordMap.set(key, record);
    });
    console.error("Step 6 Complete: Delivery record map created. deliveryRecordMap.size:", deliveryRecordMap.size);


    // Apply delivery record status to aggregated meals
    console.error("Step 7: Applying delivery record status to aggregated meals...");
    finalAggregatedMeals.forEach(meal => {
      const key = `${meal.subscriptionId}-${meal.deliveryDate}-${meal.day}-${meal.mealType}-${meal.itemName}`;
      if (deliveryRecordMap.has(key)) {
        const record = deliveryRecordMap.get(key);
        meal.deliveryStatus = record.status; // Update status based on Delivery record
        meal.deliveryRecordId = record._id; // Store the Delivery record ID
      }
    });
    console.error("Step 7 Complete: Delivery record status applied.");


    const finalMealsToday = finalAggregatedMeals.filter(meal => isSameDay(new Date(meal.deliveryDate), today));
    const finalMealsTomorrow = finalAggregatedMeals.filter(meal => isSameDay(new Date(meal.deliveryDate), tomorrow));
    const finalMealsNextWeek = finalAggregatedMeals.filter(meal =>
      new Date(meal.deliveryDate) > tomorrow && new Date(meal.deliveryDate) <= endOfNextWeek
    );
    console.error("Step 8: Meals categorized into today, tomorrow, next week.");

    res.status(200).json({
      success: true,
      data: {
        today: finalMealsToday,
        tomorrow: finalMealsTomorrow,
        nextWeek: finalMealsNextWeek,
      },
    });
    console.error("Step 9: Response sent successfully.");
  } catch (error) {
    console.error("Error in getChefDashboardMeals: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
