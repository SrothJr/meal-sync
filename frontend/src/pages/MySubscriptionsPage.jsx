import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSubscriptionStore from '../store/subscriptionStore';
import SubscriptionCard from '../components/SubscriptionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const MySubscriptionsPage = () => {
  const { mySubscriptions, fetchMySubscriptions } = useSubscriptionStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSubscriptions = async () => {
      try {
        setLoading(true);
        await fetchMySubscriptions();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    getSubscriptions();
  }, [fetchMySubscriptions]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 pt-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-500 pl-3">
            My Subscriptions
          </h1>
        </div>
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-10 z-50">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySubscriptions.map((sub) => (
              <SubscriptionCard key={sub._id} subscription={sub} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MySubscriptionsPage;
