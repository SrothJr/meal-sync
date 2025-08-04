import express from "express";
import { findChefsInArea } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/find-chefs", verifyToken, findChefsInArea);

export default router;
