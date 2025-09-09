import React, { useState, useEffect } from "react";
import SelectInput from "./SelectInput";
import Input from "./Input";
import { toast } from "react-hot-toast";
import { Calendar } from "lucide-react";
import useSubscriptionStore from "../store/subscriptionStore";
import PaymentForm from "./PaymentForm";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/payment"
    : "/api/payment";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SubscriptionFormModal = ({ isOpen, onClose, menu }) => {
  const { createSubscription, isLoading } = useSubscriptionStore();
  const [selectedDays, setSelectedDays] = useState({});
  const [subscriptionType, setSubscriptionType] = useState("weekly");
  const [startDate, setStartDate] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedDays({});
      setSubscriptionType("weekly");
      setStartDate("");
      setAutoRenew(false);
      setCurrentStep(1);
      setCalculatedPrice(0);
      setClientSecret(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (menu && Object.keys(selectedDays).length > 0 && startDate) {
      let price = 0;
      const priceLookup = new Map();
      menu.schedule.forEach((item) => {
        const key = `${item.day}-${item.mealType}`;
        priceLookup.set(key, item.price);
      });

      if (subscriptionType === "weekly") {
        Object.entries(selectedDays).forEach(([day, mealTypes]) => {
          mealTypes.forEach((mealType) => {
            const key = `${day}-${mealType}`;
            price += priceLookup.get(key) || 0;
          });
        });
      } else if (subscriptionType === "monthly") {
        let weeklyPrice = 0;
        Object.entries(selectedDays).forEach(([day, mealTypes]) => {
          mealTypes.forEach((mealType) => {
            const key = `${day}-${mealType}`;
            weeklyPrice += priceLookup.get(key) || 0;
          });
        });
        price = weeklyPrice * 4;
      }
      setCalculatedPrice(price);
      console.log("Calculated Price:", price);
    } else {
      setCalculatedPrice(0);
    }
  }, [selectedDays, subscriptionType, startDate, menu]);

  useEffect(() => {
    if (currentStep === 2 && calculatedPrice > 0) {
      const fetchClientSecret = async () => {
        try {
          const { data } = await axios.post(
            `${API_URL}/create-payment-intent`,
            {
              amount: Math.round(calculatedPrice * 100),
            }
          );
          console.log("Fetched clientSecret from backend:", data.clientSecret);
          setClientSecret(data.clientSecret);
        } catch (error) {
          console.error("Error fetching client secret:", error);
          toast.error("Failed to initialize payment. Please try again.");
          setCurrentStep(1);
        }
      };
      fetchClientSecret();
    }
  }, [currentStep, calculatedPrice]);

  const handleMealTypeChange = (day, mealType, isChecked) => {
    setSelectedDays((prev) => {
      const newDaySelection = isChecked
        ? [...(prev[day] || []), mealType]
        : (prev[day] || []).filter((type) => type !== mealType);

      if (newDaySelection.length === 0) {
        const newState = { ...prev };
        delete newState[day];
        console.log("Updated Selected Days:", newState);
        return newState;
      }
      const newState = { ...prev, [day]: newDaySelection };
      console.log("Updated Selected Days:", newState);
      return newState;
    });
  };

  const handleProceedToPayment = () => {
    const hasSelectedMeals = Object.values(selectedDays).some(
      (mealTypes) => mealTypes.length > 0
    );

    console.log("Proceed to Payment Check:", { hasSelectedMeals, startDate });

    if (!hasSelectedMeals || !startDate) {
      toast.error("Please select at least one meal and a start date.");
      return;
    }
    setCurrentStep(2);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const selectionArray = Object.entries(selectedDays).map(
        ([day, mealTypes]) => ({
          day,
          mealTypes,
        })
      );

      await createSubscription({
        menuId: menu._id,
        selection: selectionArray,
        subscriptionType,
        startDate,
        autoRenew,
      });
      toast.success("Subscription created successfully!");
      onClose();
    } catch (error) {
      toast.error(
        error.message || "Failed to create subscription after payment."
      );
    }
  };

  const handlePaymentError = (errorMessage) => {
    toast.error(`Payment failed: ${errorMessage}`);
    setCurrentStep(1);
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealTypes = ["Breakfast", "Lunch", "Dinner"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-white max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Subscribe to {menu.title}</h2>

        {currentStep === 1 && (
          <>
            )
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subscription Type
              </label>
              <SelectInput
                options={[
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                ]}
                value={subscriptionType}
                onChange={(e) => setSubscriptionType(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate || ""}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Meals
              </label>
              {daysOfWeek.map((day) => (
                <div key={day} className="mb-2">
                  <h3 className="font-semibold text-gray-200">{day}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mealTypes.map((mealType) => {
                      const menuItem = menu.schedule.find(
                        (item) => item.day === day && item.mealType === mealType
                      );
                      if (!menuItem) return null;

                      const isChecked =
                        selectedDays[day]?.includes(mealType) || false;
                      return (
                        <label
                          key={`${day}-${mealType}`}
                          className="inline-flex items-center bg-gray-700 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-600 transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-green-600 rounded"
                            checked={isChecked}
                            onChange={(e) =>
                              handleMealTypeChange(
                                day,
                                mealType,
                                e.target.checked
                              )
                            }
                          />
                          <span className="ml-2 text-sm">
                            {mealType} ({menuItem.name} - $
                            {menuItem.price.toFixed(2)})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="autoRenew"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="form-checkbox h-4 w-4 text-green-600 rounded"
              />
              <label
                htmlFor="autoRenew"
                className="ml-2 text-sm font-medium text-gray-300"
              >
                Auto-renew Subscription
              </label>
            </div>
            <div className="text-right text-xl font-bold mb-4">
              Total Price: ${calculatedPrice.toFixed(2)}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Proceed to Payment
              </button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Payment Details</h3>
            <p className="mb-4">Amount to pay: ${calculatedPrice.toFixed(2)}</p>
            {clientSecret && typeof clientSecret === "string" ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  amount={calculatedPrice}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  clientSecret={clientSecret}
                />
              </Elements>
            ) : (
              <div className="text-center py-4">Loading payment form...</div>
            )}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="mt-4 px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700"
            >
              Back to Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFormModal;
