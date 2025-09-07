import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // 2. Initialize the navigate function
  const { adminLogin, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await adminLogin(email, password);
      // 3. On success, navigate to the dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      // The authStore already handles setting the error state.
      // We just need to catch the error to prevent navigation.
      console.error("Admin login failed:", err);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            <Shield className="inline-block mb-1 mr-2" />
            Admin Panel
          </h2>

          <form onSubmit={handleLogin}>
            <Input
              icon={Mail}
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-red-500 font-semibold my-4 text-center">{error}</p>
            )}
            <motion.button
              className="mt-8 w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white
						font-bold rounded-lg shadow-lg hover:from-cyan-600
						hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="size-6 animate-spin mx-auto" />
              ) : (
                "Login"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;