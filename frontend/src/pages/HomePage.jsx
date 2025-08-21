import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/authStore";
import useMenuStore from "../store/menuStore";
import MenuCard from "../components/MenuCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";

const HomePage = () => {
  const { user } = useAuthStore();
  const { menus, fetchMenusByArea, isLoading, error } = useMenuStore();
  const [loadingMenus, setLoadingMenus] = useState(false);

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
            {loadingMenus ? (
              <div className="flex justify-center items-center h-48">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
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
          <div className="mt-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Manage Your Delicious Menus!
            </h2>
            <p className="text-lg text-gray-400">
              Head over to "My Menus" to create, update, or delete your meal
              offerings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;