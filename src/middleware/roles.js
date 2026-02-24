const { User, Parent, Student } = require('../models');

const roleMiddleware = {
  adminOnly: (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    next();
  },
  
  teacherOnly: (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher only.'
      });
    }
    next();
  },
  
  parentOnly: (req, res, next) => {
    if (req.user.role !== 'parent' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Parent only.'
      });
    }
    next();
  },
  
  studentOnly: (req, res, next) => {
    if (req.user.role !== 'student' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student only.'
      });
    }
    next();
  },
  
  superAdminOnly: (req, res, next) => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin only.'
      });
    }
    next();
  },
  
  checkOwnership: (model) => async (req, res, next) => {
    try {
      const resource = await model.findByPk(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }
      
      if (req.user.role === 'super_admin') {
        req.resource = resource;
        return next();
      }
      
      let isOwner = false;
      
      if (resource.userId) {
        isOwner = resource.userId === req.user.id;
      } else if (resource.studentId) {
        if (req.user.role === 'student') {
          isOwner = resource.studentId === req.user.id;
        } else if (req.user.role === 'parent') {
          const parent = await Parent.findOne({ where: { userId: req.user.id } });
          if (parent) {
            const student = await Student.findByPk(resource.studentId);
            isOwner = student && await student.hasParent(parent.id);
          }
        }
      }
      
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You do not own this resource'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = roleMiddleware;