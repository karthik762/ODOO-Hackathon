import express from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Authenticated users can view categories (Read-only for Employee, AssetManager, DepartmentHead)
router.get('/', protect, getCategories);
router.get('/:id', protect, getCategoryById);

// Mutating endpoints are strictly restricted to Admin role
router.post('/', protect, authorize('Admin'), createCategory);
router.put('/:id', protect, authorize('Admin'), updateCategory);
router.delete('/:id', protect, authorize('Admin'), deleteCategory);

export default router;
