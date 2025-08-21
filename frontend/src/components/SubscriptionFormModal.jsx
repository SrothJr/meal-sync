import React, { useState, useEffect } from 'react';
import SelectInput from './SelectInput';
import Input from './Input';
import { toast } from 'react-hot-toast';
import { Calendar } from 'lucide-react';
import useSubscriptionStore from '../store/subscriptionStore';

const SubscriptionFormModal = ({ isOpen, onClose, menu }) => {
  const { createSubscription, isLoading } = useSubscriptionStore();
  const [selection, setSelection] = useState([]);
  const [subscriptionType, setSubscriptionType] = useState('weekly');
  const [startDate, setStartDate] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Derived state for available days and meal types from menu.schedule
  const [availableSchedule, setAvailableSchedule] = useState({});

  useEffect(() => {
    if (menu && menu.schedule) {
      const scheduleMap = {};
      menu.schedule.forEach(item => {
        if (!scheduleMap[item.day]) {
          scheduleMap[item.day] = new Set();
        }
        scheduleMap[item.day].add(item.mealType);
      });

      const initialSelection = Object.keys(scheduleMap).map(day => ({
        day,
        mealTypes: [], // Initialize with no meal types selected
      }));

      setAvailableSchedule(scheduleMap);
      setSelection(initialSelection);
    }
  }, [menu]);

  useEffect(() => {
    if (menu && selection.length > 0) {
      calculateTotalPrice();
    }
  }, [selection, subscriptionType, menu]);

  const calculateTotalPrice = () => {
    let currentPrice = 0;
    const priceLookup = new Map();
    menu.schedule.forEach(item => {
      const key = `${item.day}-${item.mealType}`;
      priceLookup.set(key, item.price);
    });

    if (subscriptionType === 'weekly') {
      selection.forEach(selectedDay => {
        selectedDay.mealTypes.forEach(mealType => {
          const key = `${selectedDay.day}-${mealType}`;
          // Only add price if the meal type is actually offered on that day in the menu
          if (availableSchedule[selectedDay.day]?.has(mealType)) {
            currentPrice += priceLookup.get(key) || 0;
          }
        });
      });
    } else if (subscriptionType === 'monthly') {
      // Calculate weekly price first
      let weeklyPrice = 0;
      selection.forEach(selectedDay => {
        selectedDay.mealTypes.forEach(mealType => {
          const key = `${selectedDay.day}-${mealType}`;
          if (availableSchedule[selectedDay.day]?.has(mealType)) {
            weeklyPrice += priceLookup.get(key) || 0;
          }
        });
      });
      currentPrice = weeklyPrice * 4; // Multiply by 4 for monthly approximation
    }
    setTotalPrice(currentPrice);
  };

  const handleMealTypeChange = (day, mealType, isChecked) => {
    setSelection(prevSelection =>
      prevSelection.map(s =>
        s.day === day
          ? { ...s, mealTypes: isChecked
              ? [...s.mealTypes, mealType]
              : s.mealTypes.filter(mt => mt !== mealType)
            }
          : s
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate) {
      toast.error('Please select a start date.');
      return;
    }

    const selectedMeals = selection.filter(s => s.mealTypes.length > 0);
    if (selectedMeals.length === 0) {
      toast.error('Please select at least one meal.');
      return;
    }

    try {
      await createSubscription({
        menuId: menu._id,
        selection: selectedMeals,
        subscriptionType,
        startDate,
        autoRenew,
      });
      toast.success('Subscription created successfully!');
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 max-h-[80vh] overflow-y-auto"> {/* Added max-h and overflow */}
        <h2 className="text-2xl font-bold text-white mb-6">Subscribe to {menu?.title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">Subscription Type:</label>
            <SelectInput
              value={subscriptionType}
              onChange={(value) => setSubscriptionType(value)} // Corrected onChange
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">Start Date</label> {/* Added label directly */}
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              icon={Calendar}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">Meal Selection:</label>
            {Object.keys(availableSchedule).map(day => (
              <div key={day} className="mb-2 p-2 border border-gray-700 rounded-md">
                <h3 className="text-white font-semibold mb-1">{day}</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(availableSchedule[day]).map(mealType => (
                    <label key={`${day}-${mealType}`} className="inline-flex items-center text-gray-300">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-green-600"
                        checked={selection.find(s => s.day === day)?.mealTypes.includes(mealType) || false}
                        onChange={(e) => handleMealTypeChange(day, mealType, e.target.checked)}
                      />
                      <span className="ml-2">{mealType}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="autoRenew"
              className="form-checkbox h-5 w-5 text-green-600"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
            />
            <label htmlFor="autoRenew" className="ml-2 text-gray-300">Auto-Renew Subscription</label>
          </div>

          <div className="mb-6 text-white text-xl font-bold">
            Total Price: ${totalPrice.toFixed(2)}
            {subscriptionType === 'monthly' && <span className="text-sm text-gray-400 ml-2">(approx*)</span>}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Subscribing...' : 'Confirm Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionFormModal;