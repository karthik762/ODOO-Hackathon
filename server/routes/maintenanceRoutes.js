import express from 'express';
import { getMaintenanceTickets, createMaintenanceTicket, approveMaintenanceTicket, rejectMaintenanceTicket, resolveMaintenanceTicket, deleteMaintenanceTicket } from '../controllers/maintenanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// General routes (accessible to any authenticated role)
router.get('/', protect, getMaintenanceTickets);
router.post('/', protect, createMaintenanceTicket);

// Mutation workflow endpoints (restricted to Admin and AssetManager roles only)
router.patch('/:id/approve', protect, authorize('Admin', 'AssetManager'), approveMaintenanceTicket);
router.patch('/:id/reject', protect, authorize('Admin', 'AssetManager'), rejectMaintenanceTicket);
router.patch('/:id/resolve', protect, authorize('Admin', 'AssetManager'), resolveMaintenanceTicket);
router.delete('/:id', protect, authorize('Admin', 'AssetManager'), deleteMaintenanceTicket);

export default router;
