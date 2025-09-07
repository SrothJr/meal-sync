import { useEffect, useState, useMemo } from 'react'; // 1. Import useState and useMemo
import { useAdminStore } from '../../store/adminStore';
import { Loader, ShieldAlert, UserCheck, UserX } from 'lucide-react';

const UserManagementPage = () => {
  const { users, isLoading, error, getUsers } = useAdminStore();
  // 2. Add state to manage the current sort configuration
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // 3. Create a sorted list of users that only recalculates when needed
  const sortedUsers = useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig.key !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader className="size-12 animate-spin text-green-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <ShieldAlert className="size-16 mb-4" />
        <h2 className="text-2xl font-bold">Error Fetching Users</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        {/* 4. Add UI controls for sorting */}
        <div className="flex items-center space-x-4">
          <label htmlFor="sort-key" className="text-sm font-medium text-gray-300">Sort By:</label>
          <select
            id="sort-key"
            value={sortConfig.key}
            onChange={(e) => setSortConfig({ ...sortConfig, key: e.target.value })}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
            <option value="area">Area</option>
          </select>
          <select
            id="sort-direction"
            value={sortConfig.direction}
            onChange={(e) => setSortConfig({ ...sortConfig, direction: e.target.value })}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2"
          >
            <option value="ascending">Ascending</option>
            <option value="descending">Descending</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {/* Use the new sortedUsers array for rendering */}
            {sortedUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-700 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {user.isVerified ? (
                    <UserCheck className="size-5 text-green-400 inline-block" />
                  ) : (
                    <UserX className="size-5 text-red-400 inline-block" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
