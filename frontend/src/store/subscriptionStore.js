import { create } from 'zustand';
import axios from 'axios';

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/subscriptions"
    : "/api/subscriptions";

axios.defaults.withCredentials = true;

const useSubscriptionStore = create((set, get) => ({
  chefSubscriptions: [],
  mySubscriptions: [],
  currentSubscription: null, // New state for single subscription
  isLoading: false,
  error: null,

  clearSubscriptions: () => set({ chefSubscriptions: [], mySubscriptions: [], currentSubscription: null }),

  fetchChefSubscriptions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_URL}/chef?${params}`);
      set({ chefSubscriptions: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch subscriptions", isLoading: false });
      throw error;
    }
  },

  fetchMySubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/my-subscriptions`);
      set({ mySubscriptions: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch subscriptions", isLoading: false });
      throw error;
    }
  },

  fetchSubscriptionById: async (subscriptionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${subscriptionId}`);
      set({ currentSubscription: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch subscription details", isLoading: false });
      throw error;
    }
  },

  createSubscription: async (subscriptionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, subscriptionData);
      // Add to mySubscriptions, since only subscribers can create subscriptions
      set((state) => ({
        mySubscriptions: [...state.mySubscriptions, response.data.data],
        isLoading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to create subscription", isLoading: false });
      throw error;
    }
  },

  updateSubscriptionStatus: async (subscriptionId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`${API_URL}/${subscriptionId}/status`, { status });
      const updatedSubscription = response.data.data;

      set((state) => ({
        chefSubscriptions: state.chefSubscriptions.map((sub) =>
          sub._id === subscriptionId ? updatedSubscription : sub
        ),
        mySubscriptions: state.mySubscriptions.map((sub) =>
          sub._id === subscriptionId ? updatedSubscription : sub
        ),
        currentSubscription: state.currentSubscription?._id === subscriptionId ? updatedSubscription : state.currentSubscription, // Update currentSubscription if it's the one being updated
        isLoading: false,
      }));
      return updatedSubscription;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to update subscription status", isLoading: false });
      throw error;
    }
  },

  renewSubscription: async (subscriptionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/${subscriptionId}/renew`);
      const renewedSubscription = response.data.data;
      set((state) => ({
        mySubscriptions: state.mySubscriptions.map((sub) =>
          sub._id === subscriptionId ? renewedSubscription : sub
        ),
        currentSubscription: state.currentSubscription?._id === subscriptionId ? renewedSubscription : state.currentSubscription, // Update currentSubscription if it's the one being renewed
        isLoading: false,
      }));
      return renewedSubscription;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to renew subscription", isLoading: false });
      throw error;
    }
  },
}));

export default useSubscriptionStore;