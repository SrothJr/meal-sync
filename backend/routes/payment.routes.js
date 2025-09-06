import express from 'express';
import { createPaymentIntent } from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/verifyToken.js'; // Assuming payment requires authentication

const router = express.Router();

// Route to create a PaymentIntent
router.post('/create-payment-intent', verifyToken, createPaymentIntent);

export default router;