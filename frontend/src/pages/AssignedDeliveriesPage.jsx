import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useDeliveryStore from '../store/deliveryStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const AssignedDeliveriesPage = () => {
  const { assignedDeliveries, fetchAssignedDeliveries, unassignDeliverymanByDeliveryman, isLoading, error } = useDeliveryStore();
  const { user, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'deliveryman') {
      fetchAssignedDeliveries();
    }
  }, [user, fetchAssignedDeliveries]);

  const handleUnassign = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to unassign yourself from this delivery?')) {
      try {
        await unassignDeliverymanByDeliveryman(subscriptionId);
        toast.success('Successfully unassigned from delivery!');
        fetchAssignedDeliveries(); // Re-fetch the list
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

  if (!user || user.role !== 'deliveryman') {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Access Denied: You must be a deliveryman to view this page.
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            My Assigned Deliveries
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedDeliveries.length === 0 ? (
            <p className="text-white text-center col-span-full">No assigned deliveries found.</p>
          ) : (
            assignedDeliveries.map((subscription) => (
              <div key={subscription._id} className="bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{subscription.menu.title}</h2>
                <p className="text-gray-300 mb-1"><strong>Chef:</strong> {subscription.chef.name}</p>
                <p className="text-gray-300 mb-1"><strong>Subscriber:</strong> {subscription.subscriber.name}</p>
                <p className="text-gray-300 mb-1"><strong>Type:</strong> <span className="capitalize">{subscription.subscriptionType}</span></p>
                <p className="text-gray-300 mb-4"><strong>Status:</strong> <span className={`font-semibold ${subscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{subscription.status}</span></p>
                <button
                  onClick={() => handleUnassign(subscription._id)}
                  disabled={isLoading}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 w-full"
                >
                  Unassign Myself
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AssignedDeliveriesPage;
