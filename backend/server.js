import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Stripe from 'stripe';
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
const app = express();
const PORT = process.env.PORT || 5000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json()); //parse incoming requests: req.body
app.use(cookieParser()); // parse incoming cookies
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port:", PORT);
});
