import express from "express";
import { createPaymentIntent } from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/create-payment-intent", verifyToken, createPaymentIntent);

export default router;
