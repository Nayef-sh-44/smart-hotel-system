import { verifyToken } from '../utils/jwtHelper.js';
import { User } from '../models/index.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication token required.', status: 401 }
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User account not found or deactivated.', status: 401 }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { message: 'Invalid or expired authentication token.', status: 403 }
    });
  }
};

export const requireRole = (...allowedRoles) => {
  // Normalize allowed roles to map both 'customer'/'user', 'manager'/'hotel_manager', 'admin'/'system_admin'
  const expandedRoles = new Set();
  allowedRoles.forEach(role => {
    expandedRoles.add(role);
    if (role === 'customer' || role === 'user') {
      expandedRoles.add('customer');
      expandedRoles.add('user');
    }
    if (role === 'manager' || role === 'hotel_manager') {
      expandedRoles.add('manager');
      expandedRoles.add('hotel_manager');
    }
    if (role === 'admin' || role === 'system_admin') {
      expandedRoles.add('admin');
      expandedRoles.add('system_admin');
    }
  });

  return (req, res, next) => {
    if (!req.user || !expandedRoles.has(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Requires one of the following roles: ${Array.from(expandedRoles).join(', ')}`,
          status: 403
        }
      });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
