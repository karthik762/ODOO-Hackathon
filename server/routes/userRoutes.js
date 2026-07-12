import express from 'express';
import { getUsers, updateUserRole, updateUserStatus } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// User management endpoints are strictly Admin-only
router.get('/', protect, authorize('Admin', 'AssetManager'), getUsers);
router.patch('/:id/role', protect, authorize('Admin'), updateUserRole);
router.patch('/:id/status', protect, authorize('Admin'), updateUserStatus);

export default router;
