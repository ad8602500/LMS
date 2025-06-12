import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    next();
  };
};

export const isSuperAdmin = async (req, res, next) => {
  try {
    // First authenticate the user
    await auth(req, res, () => {
      // Then check if they are a super admin
      if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ 
          message: 'Access denied: Super Admin access required' 
        });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const checkSchoolAccess = async (req, res, next) => {
  try {
    const schoolId = req.params.schoolId || req.body.schoolId;
    
    if (!schoolId) {
      return res.status(400).json({ message: 'School ID is required' });
    }

    // Super Admin has access to all schools
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Check if user belongs to the school
    if (req.user.schoolId.toString() !== schoolId) {
      return res.status(403).json({ 
        message: 'Access denied: Not authorized for this school' 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking school access' });
  }
}; 


