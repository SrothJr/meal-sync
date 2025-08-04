import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/users"
    : "/api/users";

axios.defaults.withCredentials = true;

export const useUserStore = create((set) => ({
  chefs: [],
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
}));
