import express from 'express';
import { getDashboardStats, exportAssetsCSV, exportBookingsCSV } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/export/assets', protect, exportAssetsCSV);
router.get('/export/bookings', protect, exportBookingsCSV);

export default router;
