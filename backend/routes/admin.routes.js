import express from 'express';
// 1. Import the new function
import { getAllUsers, toggleUserBanStatus } from '../controllers/admin.controller.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

// @route   GET /api/admin/users
router.get('/users', verifyAdmin, getAllUsers);

// 2. Add the new PATCH route
// @route   PATCH /api/admin/users/:userId/toggle-ban
router.patch('/users/:userId/toggle-ban', verifyAdmin, toggleUserBanStatus);

export default router;