import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const HomePage = () => {
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
      </div>
    </div>
  );
};
export default HomePage;

