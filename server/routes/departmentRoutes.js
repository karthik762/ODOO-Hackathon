import express from 'express';
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Authenticated users can view departments (Read-only for Employee, AssetManager, DepartmentHead)
router.get('/', protect, getDepartments);
router.get('/:id', protect, getDepartmentById);

// Mutating endpoints are strictly restricted to Admin role
router.post('/', protect, authorize('Admin'), createDepartment);
router.put('/:id', protect, authorize('Admin'), updateDepartment);
router.delete('/:id', protect, authorize('Admin'), deleteDepartment);

export default router;
