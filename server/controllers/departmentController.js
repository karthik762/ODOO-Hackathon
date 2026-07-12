import Department from '../models/departmentModel.js';

/**
 * Get All Departments
 * GET /api/departments
 */
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).populate('departmentHead', 'name email');
    res.json({
      success: true,
      count: departments.length,
      departments
    });
  } catch (err) {
    console.error('Get Departments Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving departments'
    });
  }
};

/**
 * Get Department By ID
 * GET /api/departments/:id
 */
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('departmentHead', 'name email');
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    res.json({
      success: true,
      department
    });
  } catch (err) {
    console.error('Get Department Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving department details'
    });
  }
};

/**
 * Create Department (Admin Only)
 * POST /api/departments
 */
export const createDepartment = async (req, res) => {
  const { name, code, description, departmentHead, status } = req.body;

  try {
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required'
      });
    }

    const codeExists = await Department.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      return res.status(400).json({
        success: false,
        message: 'Department code already exists'
      });
    }

    const nameExists = await Department.findOne({ name });
    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: 'Department name already exists'
      });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || '',
      departmentHead: departmentHead || null,
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      department
    });
  } catch (err) {
    console.error('Create Department Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error creating department'
    });
  }
};

/**
 * Update Department (Admin Only)
 * PUT /api/departments/:id
 */
export const updateDepartment = async (req, res) => {
  const { name, code, description, departmentHead, status } = req.body;

  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (name) department.name = name;
    if (code) {
      const codeExists = await Department.findOne({ code: code.toUpperCase(), _id: { $ne: req.params.id } });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Department code already exists'
        });
      }
      department.code = code.toUpperCase();
    }
    if (description !== undefined) department.description = description;
    if (departmentHead !== undefined) department.departmentHead = departmentHead || null;
    if (status) department.status = status;

    const updatedDepartment = await department.save();
    res.json({
      success: true,
      department: updatedDepartment
    });
  } catch (err) {
    console.error('Update Department Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error updating department'
    });
  }
};

/**
 * Delete Department (Admin Only)
 * DELETE /api/departments/:id
 */
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    await Department.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (err) {
    console.error('Delete Department Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting department'
    });
  }
};
