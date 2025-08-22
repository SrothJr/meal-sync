import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useMenuStore from '../store/menuStore';
import MenuCard from '../components/MenuCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const ChefMenusPage = () => {
  const { chefId } = useParams();
  const { menus, fetchMenusByChefId } = useMenuStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMenus = async () => {
      try {
        setLoading(true);
        await fetchMenusByChefId(chefId);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    getMenus();
  }, [chefId, fetchMenusByChefId]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 pt-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-500 pl-3">
            Menus by Chef
          </h1>
        </div>
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-10 z-50">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menus.length > 0 ? (
              menus.map((menu) => (
                <MenuCard key={menu._id} menu={menu} isClientView={true} />
              ))
            ) : (
              <p className="text-gray-400 text-center col-span-full">No menus found for this chef.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ChefMenusPage;
