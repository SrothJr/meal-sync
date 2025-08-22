import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/authStore";
import useMenuStore from "../store/menuStore";
import { useUserStore } from "../store/userStore";
import MenuCard from "../components/MenuCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";

const HomePage = () => {
  const { user } = useAuthStore();
  const { menus, fetchMenusByArea, isLoading: menuLoading, error: menuError } = useMenuStore();
  const { chefDashboardMeals, fetchChefDashboardMeals, markMealAsDelivered, isLoading: userLoading, error: userError } = useUserStore(); // Get markMealAsDelivered
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [deliveredMeals, setDeliveredMeals] = useState({});

  useEffect(() => {
    const getMenus = async () => {
      if (user?.role === "client" && user?.area) {
        setLoadingMenus(true);
        try {
          await fetchMenusByArea(user.area);
        } catch (err) {
          toast.error(err.message);
        } finally {
          setLoadingMenus(false);
        }
      }
    };
    getMenus();
  }, [user?.role, user?.area, fetchMenusByArea]);

  useEffect(() => {
    if (user?.role === "chef") {
      fetchChefDashboardMeals();
    }
  }, [user?.role, fetchChefDashboardMeals]);

  const handleDeliverMeal = async (mealItem) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Ensure date is start of day

      await markMealAsDelivered({
        subscriptionId: mealItem.subscriptionId,
        deliveryDate: today.toISOString(),
        dayOfWeek: mealItem.day,
        mealType: mealItem.mealType,
        itemName: mealItem.itemName,
        quantity: mealItem.quantity,
        subscriberId: mealItem.subscribers[0].id, // Assuming one subscriber per meal item for simplicity
      });

      setDeliveredMeals(prev => ({
        ...prev,
        [`${mealItem.day}-${mealItem.mealType}-${mealItem.itemName}`]: true
      }));
      toast.success(`Meal "${mealItem.itemName}" for ${mealItem.day} ${mealItem.mealType} marked as delivered!`);
    } catch (error) {
      toast.error(error.message || "Failed to mark meal as delivered.");
    }
  };

  const getDayOfWeek = (offset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const renderMealList = (meals, title, showDeliverButton = false) => (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      {meals.length > 0 ? (
        <div className="bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 p-4">
          {meals.map((meal, index) => {
            const mealKey = `${meal.day}-${meal.mealType}-${meal.itemName}`;
            const isDelivered = deliveredMeals[mealKey] || meal.isDelivered; // Check initial state from backend
            return (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                <div className="text-gray-300">
                  <p className="font-semibold">{meal.itemName} ({meal.mealType})</p>
                  <p className="text-sm">Quantity: {meal.quantity}</p>
                  <p className="text-sm">Subscribers: {meal.subscribers.map(s => s.name).join(', ')}</p>
                </div>
                {showDeliverButton && (
                  <button
                    onClick={() => handleDeliverMeal(meal)}
                    disabled={isDelivered}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      isDelivered ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isDelivered ? 'Delivered' : 'Deliver'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400">No meals scheduled.</p>
      )}
    </div>
  );

  return (
    <div className="w-full">
      <Navbar />
      <div className="w-full max-w-6xl mx-auto py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              Meal Sync
            </span>
            !
          </h1>
          <p className="text-lg text-gray-400 mt-4">
            Your hyperlocal meal subscription and delivery platform.
          </p>
          <p className="text-lg text-gray-400 mt-2">
            Connecting home-based cooks with subscribers in Dhaka.
          </p>
        </motion.div>

        {user?.role === "client" && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Menus in your area ({user.area})
            </h2>
            {loadingMenus || menuLoading ? (
              <div className="flex justify-center items-center h-48">
                <LoadingSpinner />
              </div>
            ) : menuError ? (
              <p className="text-red-500 text-center">{menuError}</p>
            ) : menus.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus.map((menu) => (
                  <MenuCard key={menu._id} menu={menu} isClientView={true} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">
                No menus found in your area yet.
              </p>
            )}
          </div>
        )}

        {user?.role === "chef" && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Chef Dashboard
            </h2>
            {userLoading ? (
              <div className="flex justify-center items-center h-48">
                <LoadingSpinner />
              </div>
            ) : userError ? (
              <p className="text-red-500 text-center">{userError}</p>
            ) : (
              <>
                {renderMealList(chefDashboardMeals.today, `Meals for Today (${getDayOfWeek(0)})`, true)}
                {renderMealList(chefDashboardMeals.tomorrow, `Meals for Tomorrow (${getDayOfWeek(1)})`)}
                {renderMealList(chefDashboardMeals.nextWeek, "Meals for Next 7 Days")}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;