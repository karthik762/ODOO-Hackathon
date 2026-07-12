import User from '../models/userModel.js';

/**
 * Get All Users (Admin Only)
 * GET /api/users
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    console.error('Get Users Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user directory'
    });
  }
};

/**
 * Update User Role (Admin Only)
 * PATCH /api/users/:id/role
 */
export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  try {
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role value is required'
      });
    }

    const validRoles = ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Must be one of: ${validRoles.join(', ')}`
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Update User Role Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating user role'
    });
  }
};

/**
 * Update User Status (Admin Only)
 * PATCH /api/users/:id/status
 */
export const updateUserStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status value is required'
      });
    }

    const validStatus = ['active', 'inactive'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active or inactive'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent Admin from disabling their own account
    if (req.user._id.toString() === user._id.toString() && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'You cannot disable your own admin account'
      });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: 'User status updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Update User Status Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
};
