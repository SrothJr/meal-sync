import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, LayoutDashboard, ChefHat } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import useSubscriptionStore from "../store/subscriptionStore";
import useMenuStore from "../store/menuStore";
import logo from "../assets/meal-sync-logo.svg";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { clearSubscriptions } = useSubscriptionStore();
  const { clearMenus } = useMenuStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    clearSubscriptions();
    clearMenus();
    navigate("/login");
  };

  const navItemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gray-800 bg-opacity-40 backdrop-filter backdrop-blur-lg text-white shadow-lg w-full fixed top-0 left-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}

          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text"
            >
              <img
                src={logo}
                alt="meal-sync-logo"
                className="h-12 w-auto mr-2"
              />{" "}
              Meal Sync
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <motion.div
              className="ml-10 flex items-baseline space-x-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              <motion.div variants={navItemVariants}>
                <Link
                  to="/"
                  className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants}>
                <Link
                  to="/find-chefs"
                  className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <ChefHat className="w-4 h-4 mr-2" />
                  Chefs
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants}>
                <Link
                  to="/profile"
                  className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </motion.div>
              {user?.role === "chef" && (
                <motion.div variants={navItemVariants}>
                  <Link
                    to="/menus"
                    className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    My Menus
                  </Link>
                </motion.div>
              )}
              {user?.role === "chef" && (
                <motion.div variants={navItemVariants}>
                  <Link
                    to="/chef/subscriptions"
                    className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Client Subscriptions
                  </Link>
                </motion.div>
              )}
              {user?.role === "client" && (
                <motion.div variants={navItemVariants}>
                  <Link
                    to="/my-subscriptions"
                    className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    My Subscriptions
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center">
            <span className="text-gray-300 text-sm mr-4 hidden sm:block">
              Welcome, {user?.name || "User"}
            </span>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05, backgroundColor: "#dc2626" }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
