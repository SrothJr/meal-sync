import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

const PaymentForm = ({ amount, onPaymentSuccess, onPaymentError, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    try {
      // 1. Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Submit Error:", submitError);
        toast.error(submitError.message);
        onPaymentError(submitError.message);
        setIsLoading(false);
        return;
      }

      // 2. Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`, // A more specific URL
        },
        redirect: "if_required",
      });

      if (error) {
        // This point is only reached if there's an immediate error confirming the payment.
        // Otherwise, the customer is redirected to the return_url.
        const errorMessage =
          error.type === "card_error" || error.type === "validation_error"
            ? error.message
            : "An unexpected error occurred.";
        toast.error(errorMessage);
        onPaymentError(errorMessage);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // This block will be reached if redirect: 'if_required' doesn't redirect.
        toast.success("Payment succeeded!");
        onPaymentSuccess(paymentIntent);
      } else if (paymentIntent) {
        // Handle other statuses if needed
        toast.info(`Payment status: ${paymentIntent.status}`);
        onPaymentError(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error("PaymentForm error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to process payment.";
      toast.error(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the PaymentElement directly, as Elements provider is now in parent
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={isLoading || !stripe || !elements} className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
        {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default PaymentForm;