import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useSubscriptionStore from '../store/subscriptionStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const SubscriptionDetailsPage = () => {
  const { subscriptionId } = useParams();
  const { currentSubscription, fetchSubscriptionById, updateSubscriptionStatus, renewSubscription, isLoading, error } = useSubscriptionStore();
  const { user, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    const getSubscription = async () => {
      try {
        await fetchSubscriptionById(subscriptionId);
      } catch (err) {
        toast.error(err.message);
      }
    };
    getSubscription();
  }, [subscriptionId, fetchSubscriptionById]);

  const handleStatusUpdate = async (status) => {
    if (window.confirm(`Are you sure you want to ${status} this subscription?`)) {
      try {
        await updateSubscriptionStatus(subscriptionId, status);
        toast.success(`Subscription ${status} successfully`);
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handleRenew = async () => {
    if (window.confirm('Are you sure you want to renew this subscription?')) {
      try {
        await renewSubscription(subscriptionId);
        toast.success('Subscription renewed successfully');
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  if (isLoading || isCheckingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-10 z-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
    );
  }

  if (!currentSubscription) {
    return (
      <div className="container mx-auto p-4">
        Subscription not found or still loading...
      </div>
    );
  }

  const isChef = user?.role === 'chef';
  const isClient = user?.role === 'client';

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Subscription Details
          </h1>
        </div>

        <div className="bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 p-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">{currentSubscription.menu.title}</h2>
          <p className="text-gray-300 mb-2"><strong>Chef:</strong> {currentSubscription.chef.name}</p>
          <p className="text-gray-300 mb-2"><strong>Subscriber:</strong> {currentSubscription.subscriber.name}</p>
          <p className="text-gray-300 mb-2"><strong>Type:</strong> <span className="capitalize">{currentSubscription.subscriptionType}</span></p>
          <p className="text-gray-300 mb-2"><strong>Status:</strong> <span className={`font-semibold ${currentSubscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{currentSubscription.status}</span></p>
          <p className="text-gray-300 mb-2"><strong>Start Date:</strong> {new Date(currentSubscription.startDate).toLocaleDateString()}</p>
          <p className="text-gray-300 mb-2"><strong>End Date:</strong> {new Date(currentSubscription.endDate).toLocaleDateString()}</p>
          <p className="text-gray-300 mb-4"><strong>Total Price:</strong> ${currentSubscription.totalPrice.toFixed(2)}</p>

          <h3 className="text-xl font-bold text-white mb-3">Selected Meals:</h3>
          {currentSubscription.selection.length > 0 ? (
            <ul className="list-disc list-inside text-gray-300 mb-4">
              {currentSubscription.selection.map((sel, index) => (
                <li key={index}>{sel.day}: {sel.mealTypes.join(', ')}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mb-4">No specific meals selected.</p>
          )}

          <div className="mt-6 flex justify-end space-x-2">
            {isChef && currentSubscription.status === 'pending' && (
              <>
                <button onClick={() => handleStatusUpdate('active')} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Approve</button>
                <button onClick={() => handleStatusUpdate('rejected')} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Reject</button>
              </>
            )}

            {isClient && (
              <>
                {currentSubscription.status === 'active' && (
                  <button onClick={() => handleStatusUpdate('paused')} disabled={isLoading} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Pause</button>
                )}
                {currentSubscription.status === 'paused' && (
                  <button onClick={() => handleStatusUpdate('active')} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Resume</button>
                )}
                {currentSubscription.status !== 'cancelled' && currentSubscription.status !== 'rejected' && (
                   <button onClick={() => handleStatusUpdate('cancelled')} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Cancel</button>
                )}
                <button onClick={() => handleRenew()} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">Renew</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionDetailsPage;
