import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/admin"
    : "/api/admin";

axios.defaults.withCredentials = true;

export const useAdminStore = create((set) => ({
  users: [],
  subscriptions: [], // New state variable
  isLoading: false,
  error: null,

  getUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/users`);
      set({ users: response.data.data, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch users";
      set({ error: errorMessage, isLoading: false });
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  toggleUserBanStatus: async (userId) => {
    try {
      // Call the new PATCH endpoint on the backend
      const response = await axios.patch(
        `${API_URL}/users/${userId}/toggle-ban`
      );
      const updatedUser = response.data.data;

      // Update the specific user within the 'users' array in our state
      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId ? updatedUser : user
        ),
      }));
    } catch (error) {
      console.error("Failed to update ban status:", error);
      throw error;
    }
  },

  getSubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/subscriptions`);
      set({ subscriptions: response.data.data, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch subscriptions";
      set({ error: errorMessage, isLoading: false });
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
}));
