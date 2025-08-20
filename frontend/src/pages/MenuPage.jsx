import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import useMenuStore from "../store/menuStore";
import MenuCard from "../components/MenuCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";

const MenuPage = () => {
  const { user } = useAuthStore();
  const { menus, setMenus, fetchMenusByChefId } = useMenuStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMenus = async () => {
      if (user?._id) {
        try {
          setLoading(true);
          await fetchMenusByChefId(user._id);
        } catch (err) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    getMenus();
  }, [user?._id, fetchMenusByChefId]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 pt-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-500 pl-3">
            Menus
          </h1>
          <Link
            to="/menus/new"
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Create New Menu
          </Link>
        </div>
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-10 z-50">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menus.map((menu) => (
              <MenuCard key={menu._id} menu={menu} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MenuPage;
