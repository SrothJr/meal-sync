import Stripe from 'stripe'; // Import Stripe
import dotenv from 'dotenv';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Initialize Stripe here or pass it from server.js

export const createPaymentIntent = async (req, res) => {
  const { amount } = req.body; // Amount should be in the smallest currency unit (e.g., cents for USD)

  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd', // Or your desired currency
      // In a real application, you would also include customer, description, etc.
      // For mock, this is sufficient.
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating PaymentIntent',
      error: error.message,
    });
  }
};