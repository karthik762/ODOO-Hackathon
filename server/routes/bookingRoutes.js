import express from 'express';
import { getBookings, createBooking, updateBooking, cancelBooking, deleteBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// General booking management (accessible to all authenticated users)
router.get('/', protect, getBookings);
router.post('/', protect, createBooking);
router.put('/:id', protect, updateBooking);
router.patch('/:id/cancel', protect, cancelBooking);

// Delete operations are strictly restricted to Admin and AssetManager roles
router.delete('/:id', protect, authorize('Admin', 'AssetManager'), deleteBooking);

export default router;
