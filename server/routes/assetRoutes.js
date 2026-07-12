import express from 'express';
import { getAssets, getAssetById, createAsset, updateAsset, deleteAsset } from '../controllers/assetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// General read-only routes (accessible to any authenticated role)
router.get('/', protect, getAssets);
router.get('/:id', protect, getAssetById);

// Mutating endpoints (Admin and AssetManager only, supports single image file upload under 'image' name field)
router.post('/', protect, authorize('Admin', 'AssetManager'), upload.single('image'), createAsset);
router.put('/:id', protect, authorize('Admin', 'AssetManager'), upload.single('image'), updateAsset);
router.delete('/:id', protect, authorize('Admin', 'AssetManager'), deleteAsset);

export default router;
