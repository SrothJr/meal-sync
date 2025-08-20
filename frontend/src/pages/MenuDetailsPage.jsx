import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import MenuForm from "../components/MenuForm";
import LoadingSpinner from "../components/LoadingSpinner";
import Schedule from "../components/Schedule";
import useMenuStore from "../store/menuStore";
import Navbar from "../components/Navbar";
import AddScheduleItemModal from "../components/AddScheduleItemModal";
import EditScheduleItemModal from "../components/EditScheduleItemModal";

const MenuDetailsPage = () => {
  const { menuId } = useParams();
  const { currentMenu, isLoading, error, fetchMenuById, updateMenu } =
    useMenuStore();
  const [menuData, setMenuData] = useState({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("");

  useEffect(() => {
    const getMenu = async () => {
      try {
        const fetchedMenu = await fetchMenuById(menuId);
        setMenuData(fetchedMenu || { schedule: [] });
      } catch (err) {
        toast.error(err.message);
      }
    };
    getMenu();
  }, [menuId, fetchMenuById]);

  const setSchedule = (schedule) => {
    setMenuData({ ...menuData, schedule });
  };

  const handleAddItem = (newItem) => {
    const updatedSchedule = [
      ...menuData.schedule,
      { ...newItem, day: selectedDay, mealType: selectedMealType },
    ];
    setMenuData({ ...menuData, schedule: updatedSchedule });
  };

  const handleEditItem = (updatedItem) => {
    const updatedSchedule = menuData.schedule.map((item) =>
      item.day === selectedItem.day && item.mealType === selectedItem.mealType
        ? { ...item, ...updatedItem }
        : item
    );
    setMenuData({ ...menuData, schedule: updatedSchedule });
  };

  const handleDeleteItem = (itemToDelete) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const updatedSchedule = menuData.schedule.filter(
        (item) => item !== itemToDelete
      );
      setMenuData({ ...menuData, schedule: updatedSchedule });
    }
  };

  const openAddModal = (day, mealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async () => {
    try {
      await updateMenu(menuId, menuData);
      toast.success("Menu updated successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return;
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-10 z-50">
      <LoadingSpinner />
    </div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
    );
  }

  if (!menuData || !menuData._id) {
    return (
      <div className="container mx-auto p-4">
        Menu not found or still loading...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Edit Menu
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 p-6">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white">Menu Details</h2>
            <MenuForm menu={menuData} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Menu Schedule
            </h2>
            <Schedule
              schedule={menuData.schedule}
              openAddModal={openAddModal}
              openEditModal={openEditModal}
              handleDeleteItem={handleDeleteItem}
            />
            <button
              onClick={handleSaveChanges}
              className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
      <AddScheduleItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
      />
      <EditScheduleItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEditItem={handleEditItem}
        item={selectedItem}
      />
    </>
  );
};

export default MenuDetailsPage;
