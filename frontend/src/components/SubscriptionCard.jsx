import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { toast } from 'react-hot-toast';
import useSubscriptionStore from '../store/subscriptionStore';
import { useAuthStore } from '../store/authStore';

const SubscriptionCard = ({ subscription }) => {
  const {
    updateSubscriptionStatus,
    renewSubscription,
    isLoading,
  } = useSubscriptionStore();
  const { user } = useAuthStore();

  const handleStatusUpdate = async (status) => {
    if (window.confirm(`Are you sure you want to ${status} this subscription?`)) {
      try {
        await updateSubscriptionStatus(subscription._id, status);
        toast.success(`Subscription ${status} successfully`);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleRenew = async () => {
    if (window.confirm('Are you sure you want to renew this subscription?')) {
      try {
        await renewSubscription(subscription._id);
        toast.success('Subscription renewed successfully');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const isChef = user?.role === 'chef';
  const isClient = user?.role === 'client';

  return (
    <div className="bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1 p-6 mb-4">
      <h2 className="text-xl font-bold text-white mb-2">{subscription.menu.title}</h2>
      {isClient ? (
        <p className="text-gray-300 mb-1">Chef: {subscription.chef.name}</p>
      ) : (
        <p className="text-gray-300 mb-1">Subscriber: {subscription.subscriber.name}</p>
      )}
      <p className="text-gray-300 mb-1">Type: <span className="capitalize">{subscription.subscriptionType}</span></p>
      <p className="text-gray-300 mb-1">Status: <span className={`font-semibold ${subscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{subscription.status}</span></p>
      <p className="text-gray-300 mb-4">End Date: {new Date(subscription.endDate).toLocaleDateString()}</p>

      <div className="mt-4 flex justify-end space-x-2">
        {/* View Details button */}
        <Link to={`/subscriptions/${subscription._id}`} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors">View Details</Link>

        {isChef && subscription.status === 'pending' && (
          <>
            <button onClick={() => handleStatusUpdate('active')} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Approve</button>
            <button onClick={() => handleStatusUpdate('rejected')} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Reject</button>
          </>
        )}

        {isClient && (
          <>
            {subscription.status === 'active' && (
              <button onClick={() => handleStatusUpdate('paused')} disabled={isLoading} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Pause</button>
            )}
            {subscription.status === 'paused' && (
              <button onClick={() => handleStatusUpdate('active')} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Resume</button>
            )}
            {subscription.status !== 'cancelled' && subscription.status !== 'rejected' && (
               <button onClick={() => handleStatusUpdate('cancelled')} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Cancel</button>
            )}
            <button onClick={() => handleRenew()} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Renew</button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
