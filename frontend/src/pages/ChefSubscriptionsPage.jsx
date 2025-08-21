import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSubscriptionStore from '../store/subscriptionStore';
import SubscriptionCard from '../components/SubscriptionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import SelectInput from '../components/SelectInput'; // Import SelectInput

const ChefSubscriptionsPage = () => {
  const { chefSubscriptions, fetchChefSubscriptions } = useSubscriptionStore();
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(''); // State for status filter
  const [selectedType, setSelectedType] = useState('');     // State for type filter

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  useEffect(() => {
    const getSubscriptions = async () => {
      try {
        setLoading(true);
        const filters = {};
        if (selectedStatus) {
          filters.status = selectedStatus;
        }
        if (selectedType) {
          filters.subscriptionType = selectedType;
        }
        await fetchChefSubscriptions(filters); // Pass filters to fetch function
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    getSubscriptions();
  }, [fetchChefSubscriptions, selectedStatus, selectedType]); // Re-fetch when filters change

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 pt-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-500 pl-3">
            Client Subscriptions
          </h1>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <label className="block text-gray-300 text-sm font-bold mb-2">Filter by Status:</label>
            <SelectInput
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-gray-300 text-sm font-bold mb-2">Filter by Type:</label>
            <SelectInput
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
            />
          </div>
        </div>

        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-10 z-50">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chefSubscriptions.map((sub) => (
              <SubscriptionCard key={sub._id} subscription={sub} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ChefSubscriptionsPage;