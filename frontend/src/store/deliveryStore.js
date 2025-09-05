import { create } from "zustand";
import axios from "axios";
import useSubscriptionStore from "./subscriptionStore";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/deliveries"
    : "/api/deliveries";

const SUBSCRIPTION_API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/subscriptions"
    : "/api/subscriptions";

axios.defaults.withCredentials = true;

const useDeliveryStore = create((set) => ({
  deliveryOffers: [],
  deliverymanDashboardMeals: { today: [], tomorrow: [], nextWeek: [] },
  assignedDeliveries: [], // New state for assigned deliveries
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

  fetchDeliverymanDashboardMeals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/my-dashboard`);
      set({
        deliverymanDashboardMeals: response.data.data,
        isLoading: false,
      });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch deliveryman dashboard meals",
        isLoading: false,
      });
      throw error;
    }
  },

  markMealAsDelivered: async (deliveryId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/mark-delivered`, { deliveryId });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to mark meal as delivered",
        isLoading: false,
      });
      throw error;
    }
  },

  // New function to fetch delivery requests for a subscription
  getDeliveryRequests: async (subscriptionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/requests/${subscriptionId}`);
      set({ isLoading: false });
      return response.data.data; // Assuming the backend returns { success: true, data: requests }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch delivery requests",
        isLoading: false,
      });
      throw error;
    }
  },

  // New function to appoint a deliveryman
  appointDeliveryman: async (subscriptionId, deliverymanId, requestId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/appoint/${subscriptionId}`, { deliverymanId, requestId });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to appoint deliveryman",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchAssignedDeliveries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/assigned`);
      set({ assignedDeliveries: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch assigned deliveries",
        isLoading: false,
      });
      throw error;
    }
  },

  unassignDeliverymanByDeliveryman: async (subscriptionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`${SUBSCRIPTION_API_URL}/${subscriptionId}/unassign/deliveryman`);
      set((state) => ({
        assignedDeliveries: state.assignedDeliveries.filter(
          (sub) => sub._id !== subscriptionId
        ),
        isLoading: false,
      }));
      useSubscriptionStore.getState().updateSubscriptionDeliveryStatus(subscriptionId);
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to unassign from delivery",
        isLoading: false,
      });
      throw error;
    }
  },

  unassignDeliverymanByChef: async (subscriptionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`${SUBSCRIPTION_API_URL}/${subscriptionId}/unassign/chef`);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to unassign deliveryman",
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useDeliveryStore;
