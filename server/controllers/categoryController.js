import Category from '../models/categoryModel.js';

/**
 * Get All Categories
 * GET /api/categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (err) {
    console.error('Get Categories Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving categories'
    });
  }
};

/**
 * Get Category By ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    res.json({
      success: true,
      category
    });
  } catch (err) {
    console.error('Get Category Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving category details'
    });
  }
};

/**
 * Create Category (Admin Only)
 * POST /api/categories
 */
export const createCategory = async (req, res) => {
  const { name, description, status } = req.body;

  try {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const nameExists = await Category.findOne({ name });
    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    const category = await Category.create({
      name,
      description: description || '',
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      category
    });
  } catch (err) {
    console.error('Create Category Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error creating category'
    });
  }
};

/**
 * Update Category (Admin Only)
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res) => {
  const { name, description, status } = req.body;

  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name) {
      const nameExists = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
      category.name = name;
    }
    if (description !== undefined) category.description = description;
    if (status) category.status = status;

    const updatedCategory = await category.save();
    res.json({
      success: true,
      category: updatedCategory
    });
  } catch (err) {
    console.error('Update Category Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error updating category'
    });
  }
};

/**
 * Delete Category (Admin Only)
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    console.error('Delete Category Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting category'
    });
  }
};
