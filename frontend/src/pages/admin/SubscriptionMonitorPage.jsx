import { useEffect } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { Loader, ShieldAlert } from 'lucide-react';

const SubscriptionMonitorPage = () => {
  const { subscriptions, isLoading, error, getSubscriptions } = useAdminStore();

  useEffect(() => {
    getSubscriptions();
  }, [getSubscriptions]);

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
        <h2 className="text-2xl font-bold">Error Fetching Subscriptions</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-6">Subscription Monitor</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Subscriber</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Chef</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Menu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {subscriptions.map((sub) => (
              <tr key={sub._id} className="hover:bg-gray-700 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{sub._id.substring(0, 8)}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sub.subscriber?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sub.chef?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sub.menu?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(sub.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(sub.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{sub.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${sub.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionMonitorPage;
