import express from "express";
import { createSubscription } from "../controllers/subscription.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createSubscription);

export default router;
