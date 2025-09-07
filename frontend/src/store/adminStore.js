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
}));
