import { create } from 'zustand';
import axios from 'axios';

const API_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api/admin'
    : '/api/admin';

axios.defaults.withCredentials = true;

export const useAdminStore = create((set) => ({
  users: [],
  isLoading: false,
  error: null,

  getUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/users`);
      set({ users: response.data.data, isLoading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      set({ error: errorMessage, isLoading: false });
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  toggleUserBanStatus: async (userId) => {
    try {
      // Call the new PATCH endpoint on the backend
      const response = await axios.patch(`${API_URL}/users/${userId}/toggle-ban`);
      const updatedUser = response.data.data;

      // Update the specific user within the 'users' array in our state
      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId ? updatedUser : user
        ),
      }));
    } catch (error) {
      // We'll log the error, but you could also set an error state to show a toast notification
      console.error('Failed to update ban status:', error);
      throw error;
    }
  },
}));
