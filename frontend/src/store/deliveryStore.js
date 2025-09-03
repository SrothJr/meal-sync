import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/deliveries"
    : "/api/deliveries";

axios.defaults.withCredentials = true;

const useDeliveryStore = create((set) => ({
  deliveryOffers: [],
  isLoading: false,
  error: null,

  fetchDeliveryOffers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/offers`);
      set({ deliveryOffers: response.data.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch delivery offers",
        isLoading: false,
      });
      throw error;
    }
  },

  requestDelivery: async (subscriptionId, message = "") => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/request/${subscriptionId}`, { message });
      set((state) => ({
        // Optionally update the offer status in the store if needed, or refetch
        deliveryOffers: state.deliveryOffers.filter(
          (offer) => offer._id !== subscriptionId
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to request delivery",
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useDeliveryStore;
