import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Helper to generate JWT token (expires in 30 days)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Register User
 * POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    let dbRole = 'Employee';
    if (role === 'admin') dbRole = 'Admin';
    else if (role === 'manager') dbRole = 'AssetManager';
    else if (role === 'staff') dbRole = 'Employee';
    else if (role) dbRole = role;

    const user = await User.create({
      name,
      email,
      password,
      role: dbRole,
      department: department || ''
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          status: user.status
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data provided'
      });
    }
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration'
    });
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive'
        });
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          status: user.status
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during login'
    });
  }
};

/**
 * Get Current User Details
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    console.error('Get Me Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile'
    });
  }
};

/**
 * Update User Profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
      user.email = email;
    }

    if (password) {
      user.password = password; // The userSchema pre-save hook hashes it automatically
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        status: updatedUser.status
      }
    });
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error updating profile'
    });
  }
};
