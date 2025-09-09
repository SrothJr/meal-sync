import { useEffect, useState, useMemo } from "react";
import { useAdminStore } from "../../store/adminStore";
import { Loader, ShieldAlert, UserCheck, UserX } from "lucide-react";

const UserManagementPage = () => {
  const { users, isLoading, error, getUsers, toggleUserBanStatus } =
    useAdminStore();
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig.key !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const handleBanClick = async (userId) => {
    try {
      await toggleUserBanStatus(userId);
    } catch (err) {
      console.error("Failed to update user ban status from component");
    }
  };

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
        <div className="flex items-center space-x-4">
          <label
            htmlFor="sort-key"
            className="text-sm font-medium text-gray-300"
          >
            Sort By:
          </label>
          <select
            id="sort-key"
            value={sortConfig.key}
            onChange={(e) =>
              setSortConfig({ ...sortConfig, key: e.target.value })
            }
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
            onChange={(e) =>
              setSortConfig({ ...sortConfig, direction: e.target.value })
            }
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Verified
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedUsers.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-700 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {user.isVerified ? (
                    <UserCheck className="size-5 text-green-400 inline-block" />
                  ) : (
                    <UserX className="size-5 text-red-400 inline-block" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isBanned
                        ? "bg-red-900 text-red-200"
                        : "bg-green-900 text-green-200"
                    }`}
                  >
                    {user.isBanned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <button
                    onClick={() => handleBanClick(user._id)}
                    className={`px-4 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
                      ${
                        user.isBanned
                          ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                          : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                      }`}
                  >
                    {user.isBanned ? "Unban" : "Ban"}
                  </button>
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
