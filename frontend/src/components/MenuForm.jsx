import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useMenuStore from '../store/menuStore';

const MenuForm = ({ menu }) => {
  const navigate = useNavigate();
  const { createMenu, updateMenu } = useMenuStore();
  const [formData, setFormData] = useState({
    title: menu?.title || '',
    description: menu?.description || '',
    coverImage: menu?.coverImage || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (menu) {
        await updateMenu(menu._id, formData);
      } else {
        const newMenu = await createMenu(formData);
        navigate(`/menus/${newMenu._id}`);
      }
      toast.success(`Menu ${menu ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>
      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300">
          Cover Image URL
        </label>
        <input
          type="text"
          name="coverImage"
          id="coverImage"
          value={formData.coverImage}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        {menu ? 'Update Menu' : 'Create Menu'}
      </button>
    </form>
  );
};

export default MenuForm;
