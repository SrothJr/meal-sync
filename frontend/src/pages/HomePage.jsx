import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/authStore";
import useMenuStore from "../store/menuStore";
import { useUserStore } from "../store/userStore";
import useDeliveryStore from "../store/deliveryStore";
import MenuCard from "../components/MenuCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";

const HomePage = () => {
  // Helper function to check if two dates are the same day
  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const { user } = useAuthStore();
  const { menus, fetchMenusByArea, isLoading: menuLoading, error: menuError } = useMenuStore();
  const { chefDashboardMeals, fetchChefDashboardMeals, markAsReadyForDelivery, cancelDelivery, isLoading: userLoading, error: userError } = useUserStore();
  const { deliverymanDashboardMeals, fetchDeliverymanDashboardMeals, markMealAsDelivered, isLoading: deliveryLoading, error: deliveryError } = useDeliveryStore();
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [deliveredMeals, setDeliveredMeals] = useState({});

  const handleMarkAsReady = async (mealItem) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Ensure date is start of day

      await markAsReadyForDelivery({
        subscriptionId: mealItem.subscriptionId,
        deliveryDate: new Date(mealItem.deliveryDate).toISOString(),
        dayOfWeek: mealItem.day,
        mealType: mealItem.mealType,
        itemName: mealItem.itemName,
        quantity: mealItem.quantity,
      });

      toast.success(`Meal "${mealItem.itemName}" for ${mealItem.day} ${mealItem.mealType} marked as ready for delivery!`);
      fetchChefDashboardMeals(); // Re-fetch dashboard meals to update the UI
    } catch (error) {
      toast.error(error.message || "Failed to mark meal as ready for delivery.");
    }
  };

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
    } else if (user?.role === "deliveryman") {
      fetchDeliverymanDashboardMeals();
    }
  }, [user?.role, fetchChefDashboardMeals, fetchDeliverymanDashboardMeals]);

  const handleCancelDelivery = async (deliveryRecordId) => {
    if (window.confirm("Are you sure you want to cancel this delivery?")) {
      try {
        await cancelDelivery(deliveryRecordId);
        toast.success("Delivery cancelled successfully!");
        fetchChefDashboardMeals(); // Re-fetch dashboard meals to update the UI
      } catch (error) {
        toast.error(error.message || "Failed to cancel delivery.");
      }
    }
  };

  const getDayOfWeek = (offset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleMarkAsDelivered = async (deliveryId) => {
    try {
      await markMealAsDelivered(deliveryId);
      toast.success("Meal marked as delivered!");
      fetchDeliverymanDashboardMeals(); // Re-fetch to update UI
    } catch (error) {
      toast.error(error.message || "Failed to mark meal as delivered.");
    }
  };

  const renderMealList = (meals, title, showChefButton = false, isDeliverymanView = false, loadingState = false) => (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      {meals.length > 0 ? (
        <div className="bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 p-4">
          {meals.map((meal, index) => {
            const displayItemName = isDeliverymanView ? meal.itemName : meal.itemName;
            const displayMealType = isDeliverymanView ? meal.mealType : meal.mealType;
            const displayQuantity = isDeliverymanView ? meal.quantity : meal.quantity;
            const displaySubscriberName = isDeliverymanView ? meal.subscriber?.name : meal.subscribers?.map(s => s.name).join(', ');
            const displayChefName = isDeliverymanView ? meal.chef?.name : '';

            const isMealDelivered = isDeliverymanView ? meal.status === 'delivered' : meal.status === 'delivered';
            const isMealPrepared = isDeliverymanView ? meal.status === 'prepared' : meal.status === 'prepared';

            return (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                <div className="text-gray-300">
                  <p className="font-semibold">{displayItemName} ({displayMealType})</p>
                  <p className="text-sm">Quantity: {displayQuantity}</p>
                  {isDeliverymanView && <p className="text-sm">Chef: {displayChefName}</p>}
                  <p className="text-sm">Subscriber: {displaySubscriberName}</p>
                </div>
                {showChefButton && user?.role === 'chef' && (
                  <>
                    {meal.deliveryStatus === 'unprepared' && meal.subscriptionDeliveryStatus === 'assigned' && isSameDay(new Date(meal.deliveryDate), new Date()) && (
                      <button
                        onClick={() => handleMarkAsReady(meal)}
                        disabled={loadingState}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${loadingState ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                      >
                        Mark as Ready
                      </button>
                    )}
                    {meal.deliveryStatus === 'prepared' && (
                      <button
                        onClick={() => handleCancelDelivery(meal.deliveryRecordId)}
                        disabled={loadingState}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${loadingState ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                      >
                        Cancel Delivery
                      </button>
                    )}
                    {meal.deliveryStatus === 'delivered' && (
                      <button
                        disabled
                        className="px-3 py-1 rounded-md text-sm bg-gray-500 text-gray-300 cursor-not-allowed"
                      >
                        Delivered
                      </button>
                    )}
                    {meal.subscriptionDeliveryStatus !== 'assigned' && meal.deliveryStatus === 'unprepared' && (
                      <button
                        disabled
                        className="px-3 py-1 rounded-md text-sm bg-gray-500 text-gray-300 cursor-not-allowed"
                      >
                        Assign Deliveryman
                      </button>
                    )}
                  </>
                )}
                {isDeliverymanView && user?.role === 'deliveryman' && (
                  <button
                    onClick={() => handleMarkAsDelivered(meal._id)}
                    disabled={isMealDelivered}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      isMealDelivered ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isMealDelivered ? 'Delivered' : 'Mark as Delivered'}
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
                {chefDashboardMeals && renderMealList(chefDashboardMeals.today, `Meals for Today (${getDayOfWeek(0)})`, true, false, userLoading)}
                {chefDashboardMeals && renderMealList(chefDashboardMeals.tomorrow, `Meals for Tomorrow (${getDayOfWeek(1)})`, true, false, userLoading)}
                {chefDashboardMeals && renderMealList(chefDashboardMeals.nextWeek, "Meals for Next 7 Days", true, false, userLoading)}
              </>
            )}
          </div>
        )}

        {user?.role === "deliveryman" && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Deliveryman Dashboard
            </h2>
            {deliveryLoading ? (
              <div className="flex justify-center items-center h-48">
                <LoadingSpinner />
              </div>
            ) : deliveryError ? (
              <p className="text-red-500 text-center">{deliveryError}</p>
            ) : (
              <>
                {deliverymanDashboardMeals && renderMealList(deliverymanDashboardMeals.today, `Deliveries for Today (${getDayOfWeek(0)})`, false, true, deliveryLoading)}
                {deliverymanDashboardMeals && renderMealList(deliverymanDashboardMeals.tomorrow, `Deliveries for Tomorrow (${getDayOfWeek(1)})`, false, true, deliveryLoading)}
                {deliverymanDashboardMeals && renderMealList(deliverymanDashboardMeals.nextWeek, "Deliveries for Next 7 Days", false, true, deliveryLoading)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;