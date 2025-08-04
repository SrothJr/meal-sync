import { useEffect } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, User, MapPin, Mail } from "lucide-react";

import { useUserStore } from "../store/userStore";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar"; // Importing Navbar

const FindChefsPage = () => {
  const { chefs, isLoading, error, findChefs } = useUserStore();

  useEffect(() => {
    findChefs();
  }, [findChefs]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="text-center text-red-400 bg-red-900 bg-opacity-30 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-2">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (chefs.length === 0) {
      return (
        <div className="text-center text-gray-300">
          <UtensilsCrossed className="mx-auto w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-2xl font-bold">No Chefs Found</h3>
          <p>There are currently no chefs available in your area.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {chefs.map((chef, index) => (
          <motion.div
            key={chef._id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-500 bg-opacity-20 rounded-full mr-4">
                  <User className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{chef.name}</h3>
              </div>
              <div className="space-y-3 text-gray-300">
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-green-500" />
                  Area: {chef.area}
                </p>
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-green-500" />
                  Email: {chef.email}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="w-full max-w-6xl mx-auto py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Chefs In Your Area
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            Discover home-based cooks near you.
          </p>
        </motion.div>
        
        {renderContent()}
      </div>
    </>
  );
};

export default FindChefsPage;