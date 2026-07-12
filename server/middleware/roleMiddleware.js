/**
 * Role Authorization Middleware
 * Restricts access to routes based on user roles (e.g. admin, manager, staff).
 * 
 * @param  {...string} roles - The list of permitted roles for the route
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user profile missing'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${req.user.role}'`
      });
    }

    next();
  };
};
