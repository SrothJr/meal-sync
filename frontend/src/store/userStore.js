import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/users"
    : "/api/users";

axios.defaults.withCredentials = true;

export const useUserStore = create((set) => ({
  chefs: [],
  profile: null,
  chefDashboardMeals: { today: [], tomorrow: [], nextWeek: [] }, // New state
  isLoading: false,
  error: null,

  findChefs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/find-chefs`);

      set({
        chefs: response.data.chefs,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.message || "Error finding chefs",
        isLoading: false,
      });
      throw new Error(error.response.data.message);
    }
  },
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/profile`);
      set({ profile: response.data.user, isLoading: false });
    } catch (error) {
      set({
        error: error.response.data.message || "Error fetching profile",
        isLoading: false,
      });
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.put(`${API_URL}/profile`, profileData);
      set({ profile: response.data.user, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response.data.message || "Error updating profile",
        isLoading: false,
      });

      throw new Error(error.response.data.message);
    }
  },

  fetchChefDashboardMeals: async () => { // New function
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/dashboard-meals`);
      set({ chefDashboardMeals: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching chef dashboard meals",
        isLoading: false,
      });
      throw new Error(error.response?.data?.message);
    }
  },
}));