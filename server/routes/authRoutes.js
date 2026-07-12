import express from 'express';
import { registerUser, loginUser, getCurrentUser, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/me (Protected route)
router.get('/me', protect, getCurrentUser);

// PUT /api/auth/profile (Protected route)
router.put('/profile', protect, updateProfile);

export default router;
