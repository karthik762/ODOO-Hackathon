import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * Protect Middleware
 * Verifies JWT token and attaches authenticated user to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token using our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and attach to request (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      // Check if user is inactive
      if (req.user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      next();
    } catch (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};
