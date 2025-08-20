import { create } from 'zustand';
import axios from 'axios';

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/menus"
    : "/api/menus";

axios.defaults.withCredentials = true;

const useMenuStore = create((set, get) => ({
  menus: [],
  currentMenu: null,
  isLoading: false,
  error: null,

  setMenus: (menus) => set({ menus }),
  setCurrentMenu: (menu) => set({ currentMenu: menu }),

  fetchMenusByChefId: async (chefId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/chef/${chefId}`);
      set({ menus: response.data.menus, isLoading: false });
      return response.data.menus;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch menus", isLoading: false });
      throw error;
    }
  },

  fetchMenuById: async (menuId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${menuId}`);
      set({ currentMenu: response.data.menu, isLoading: false });
      return response.data.menu;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch menu details", isLoading: false });
      throw error;
    }
  },

  createMenu: async (menuData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, menuData);
      set((state) => ({ menus: [...state.menus, response.data.menu], isLoading: false }));
      return response.data.menu;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to create menu", isLoading: false });
      throw error;
    }
  },

  updateMenu: async (menuId, menuData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${menuId}`, menuData);
      set((state) => ({
        menus: state.menus.map((menu) =>
          menu._id === menuId ? response.data.menu : menu
        ),
        currentMenu: response.data.menu,
        isLoading: false,
      }));
      return response.data.menu;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to update menu", isLoading: false });
      throw error;
    }
  },

  deleteMenu: async (menuId) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${menuId}`);
      set((state) => ({ menus: state.menus.filter((menu) => menu._id !== menuId), isLoading: false }));
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to delete menu", isLoading: false });
      throw error;
    }
  },
}));

export default useMenuStore;