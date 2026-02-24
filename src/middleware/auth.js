const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

const hasPermission = (permission) => {
  return (req, res, next) => {
    const permissions = require('../config/auth').permissions;
    const userPermissions = permissions[req.user.role.toUpperCase()] || [];
    
    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to perform this action`
      });
    }
  };
};

const checkSchoolAccess = async (req, res, next) => {
  const { schoolCode } = req.params;
  
  if (!schoolCode) {
    return next();
  }
  
  if (req.user.role === 'super_admin') {
    return next();
  }
  
  if (req.user.schoolCode !== schoolCode) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this school'
    });
  }
  
  next();
};

module.exports = {
  protect,
  authorize,
  hasPermission,
  checkSchoolAccess
};