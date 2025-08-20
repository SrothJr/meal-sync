import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useMenuStore from '../store/menuStore';

const MenuCard = ({ menu }) => {
  const { deleteMenu } = useMenuStore();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this menu?')) {
      try {
        await deleteMenu(menu._id);
        toast.success('Menu deleted successfully');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1 p-6 mb-4">
      <h2 className="text-xl font-bold text-white mb-2">{menu.title}</h2>
      <p className="text-gray-300 mb-4">{menu.description}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Link to={`/menus/${menu._id}`} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">View/Edit</Link>
        <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">Delete</button>
      </div>
    </div>
  );
};

export default MenuCard;
