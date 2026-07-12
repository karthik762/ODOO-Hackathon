import fs from 'fs';
import path from 'path';
import Asset from '../models/assetModel.js';

// Helper function to remove asset images from local uploads storage
const deleteFile = (filePath) => {
  if (!filePath) return;
  const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const fullPath = path.resolve(relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  }
};

/**
 * Get All Assets
 * GET /api/assets
 */
export const getAssets = async (req, res) => {
  const { search, category, department, status, page = 1, limit = 10 } = req.query;

  try {
    const query = {};

    // 1. Keyword search (Name or SerialNumber)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Filter logic
    if (category) query.category = category;
    if (department) query.department = department;
    if (status) query.status = status;

    // 3. Pagination math
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Asset.countDocuments(query);
    const assets = await Asset.find(query)
      .populate('category', 'name')
      .populate('department', 'name code')
      .populate('assignedTo', 'name email')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: assets.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      assets
    });
  } catch (err) {
    console.error('Get Assets Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving assets list'
    });
  }
};

/**
 * Get Single Asset By ID
 * GET /api/assets/:id
 */
export const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('category', 'name description')
      .populate('department', 'name code')
      .populate('assignedTo', 'name email role department');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      asset
    });
  } catch (err) {
    console.error('Get Asset Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving asset details'
    });
  }
};

/**
 * Create Asset (Admin / AssetManager Only)
 * POST /api/assets
 */
export const createAsset = async (req, res) => {
  try {
    const { name, serialNumber, model, category, department, purchaseDate, cost, status, assignedTo, description } = req.body;

    if (!name || !serialNumber || !category || !department) {
      if (req.file) deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Asset name, serial number, category, and department are required'
      });
    }

    const serialExists = await Asset.findOne({ serialNumber });
    if (serialExists) {
      if (req.file) deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Asset with this serial number already exists'
      });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const asset = await Asset.create({
      name,
      serialNumber,
      model: model || '',
      category,
      department,
      purchaseDate: purchaseDate || null,
      cost: cost ? parseFloat(cost) : 0,
      status: status || 'Available',
      image: imagePath,
      assignedTo: assignedTo || null,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      asset
    });
  } catch (err) {
    if (req.file) deleteFile(req.file.path);
    console.error('Create Asset Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error creating asset record'
    });
  }
};

/**
 * Update Asset (Admin / AssetManager Only)
 * PUT /api/assets/:id
 */
export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      if (req.file) deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const { name, serialNumber, model, category, department, purchaseDate, cost, status, assignedTo, description } = req.body;

    if (serialNumber && serialNumber !== asset.serialNumber) {
      const serialExists = await Asset.findOne({ serialNumber });
      if (serialExists) {
        if (req.file) deleteFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Asset with this serial number already exists'
        });
      }
      asset.serialNumber = serialNumber;
    }

    if (name) asset.name = name;
    if (model !== undefined) asset.model = model;
    if (category) asset.category = category;
    if (department) asset.department = department;
    if (purchaseDate !== undefined) asset.purchaseDate = purchaseDate || null;
    if (cost !== undefined) asset.cost = cost ? parseFloat(cost) : 0;
    if (status) asset.status = status;
    if (assignedTo !== undefined) asset.assignedTo = assignedTo || null;
    if (description !== undefined) asset.description = description;

    // Swap files if a new file is uploaded
    if (req.file) {
      if (asset.image) deleteFile(asset.image);
      asset.image = `/uploads/${req.file.filename}`;
    }

    const updatedAsset = await asset.save();
    res.json({
      success: true,
      asset: updatedAsset
    });
  } catch (err) {
    if (req.file) deleteFile(req.file.path);
    console.error('Update Asset Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error updating asset record'
    });
  }
};

/**
 * Delete Asset (Admin / AssetManager Only)
 * DELETE /api/assets/:id
 */
export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    if (asset.image) deleteFile(asset.image);

    await Asset.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (err) {
    console.error('Delete Asset Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting asset record'
    });
  }
};
