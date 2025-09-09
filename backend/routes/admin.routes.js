import express from "express";

import {
  getAllUsers,
  toggleUserBanStatus,
  getAllSubscriptions,
} from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

router.get("/users", verifyAdmin, getAllUsers);

router.patch("/users/:userId/toggle-ban", verifyAdmin, toggleUserBanStatus);

router.get("/subscriptions", verifyAdmin, getAllSubscriptions);

export default router;
