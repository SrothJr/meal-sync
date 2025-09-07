import express from 'express';
import { getAllUsers } from '../controllers/admin.controller.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

// @route   GET /api/admin/users
// This route is protected by the verifyAdmin middleware.
// Only requests with a valid admin token will be able to access it.
router.get('/users', verifyAdmin, getAllUsers);

export default router;
