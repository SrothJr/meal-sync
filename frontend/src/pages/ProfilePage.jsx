import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/userStore";
import { User, Mail, MapPin, Edit, Save, X, Loader } from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import Input from "../components/Input";

const ProfilePage = () => {
  const { profile, isLoading, error, fetchProfile, updateProfile } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", area: "" });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({ name: profile.name, area: profile.area });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-full max-w-4xl mx-auto py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-gray-700"
        >
          <div className="p-8">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text mb-6">
                My Profile
              </h2>
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  <Edit size={18} /> Edit
                </motion.button>
              ) : (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleUpdateProfile}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    <X size={18} /> Cancel
                  </motion.button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4 mt-4">
                <Input
                  name="name"
                  icon={User}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                />
                {/* For consistency, using the Input component. A dropdown could be used here as well. */}
                <Input
                  name="area"
                  icon={MapPin}
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Area"
                />
              </form>
            ) : (
              <div className="mt-4 space-y-4 text-lg text-gray-300">
                <p className="flex items-center gap-3"><User className="text-green-400" /> Name: {profile?.name}</p>
                <p className="flex items-center gap-3"><Mail className="text-green-400" /> Email: {profile?.email}</p>
                <p className="flex items-center gap-3"><MapPin className="text-green-400" /> Area: {profile?.area}</p>
                {/* Corrected to use profile.role */}
                <p className="flex items-center gap-3 capitalize"><User className="text-green-400" /> Role: {profile?.role}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ProfilePage;
