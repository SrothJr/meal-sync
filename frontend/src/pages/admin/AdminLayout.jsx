import { NavLink, Outlet } from 'react-router-dom';
import { Users, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = () => {
  const { logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex flex-col shadow-lg">
        <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700 text-green-400">
          Admin Panel
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-green-600 text-white' : 'hover:bg-gray-700'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-green-600 text-white' : 'hover:bg-gray-700'
              }`
            }
          >
            <Users className="w-5 h-5 mr-3" />
            Users
          </NavLink>
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
           <button
            onClick={logout}
            className="w-full text-left flex items-center px-4 py-2 rounded-lg transition-colors duration-200 text-red-400 hover:bg-red-600 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
