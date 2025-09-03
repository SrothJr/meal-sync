import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useSubscriptionStore from '../store/subscriptionStore';
import { useAuthStore } from '../store/authStore';
import useDeliveryStore from '../store/deliveryStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const SubscriptionDetailsPage = () => {
  const { subscriptionId } = useParams();
  const { currentSubscription, fetchSubscriptionById, updateSubscriptionStatus, renewSubscription, isLoading, error } = useSubscriptionStore();
  const { user, isCheckingAuth } = useAuthStore();
  const { getDeliveryRequests, appointDeliveryman } = useDeliveryStore();

  const [deliveryRequests, setDeliveryRequests] = useState([]);

  useEffect(() => {
    const getSubscription = async () => {
      try {
        await fetchSubscriptionById(subscriptionId);
      } catch (err) {
        toast.error(err.message);
      }
    };
    getSubscription();

    if (user?.role === 'chef' && subscriptionId) {
      const fetchRequests = async () => {
        try {
          const requests = await getDeliveryRequests(subscriptionId);
          setDeliveryRequests(requests);
        } catch (err) {
          toast.error(err.message);
        }
      };
      fetchRequests();
    }
  }, [subscriptionId, fetchSubscriptionById, user?.role, getDeliveryRequests]);

  const handleAppointDeliveryman = async (deliverymanId, requestId) => {
    if (window.confirm('Are you sure you want to appoint this deliveryman?')) {
      try {
        await appointDeliveryman(subscriptionId, deliverymanId, requestId);
        toast.success('Deliveryman appointed successfully!');
        await fetchSubscriptionById(subscriptionId); // Re-fetch to update UI
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

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

          {console.log("isChef:", isChef)}
          {console.log("currentSubscription.delivery?.deliveryStatus:", currentSubscription.delivery?.deliveryStatus)}
          {console.log("deliveryRequests:", deliveryRequests)}

          {isChef && (currentSubscription.delivery?.deliveryStatus === 'unassigned' || currentSubscription.delivery?.deliveryStatus === 'pending_approval') && deliveryRequests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white mb-3">Delivery Requests:</h3>
              {deliveryRequests.map((request) => (
                <div key={request._id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md mb-2">
                  <p className="text-gray-300">
                    {request.deliveryman.name} ({request.deliveryman.email})
                    {request.message && <span className="text-sm text-gray-400 ml-2"> - "{request.message}"</span>}
                  </p>
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleAppointDeliveryman(request.deliveryman._id, request._id)}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                    >
                      Appoint
                    </button>
                  )}
                  {request.status === 'approved' && (
                    <span className="text-green-400">Appointed</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {isChef && currentSubscription.delivery?.deliveryStatus === 'assigned' && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white mb-3">Assigned Deliveryman:</h3>
              <p className="text-gray-300">
                {currentSubscription.delivery.deliveryPerson?.name} ({currentSubscription.delivery.deliveryPerson?.email})
              </p>
            </div>
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
