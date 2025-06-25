import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('All cookies:', req.cookies);
    console.log('Authorization header:', req.header('Authorization'));
    
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies?.token;
    console.log('Token from cookie:', token ? 'Present' : 'Missing');
    
    if (!token) {
      // Fallback to Authorization header
      token = req.header('Authorization')?.replace('Bearer ', '');
      console.log('Token from header:', token ? 'Present' : 'Missing');
    }
    
    if (!token) {
      console.log('No token found - returning 401');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('Token found, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { userId: decoded.userId, role: decoded.role });
    
    const user = await User.findOne({ _id: decoded.userId, isActive: true });

    if (!user) {
      console.log('User not found or inactive');
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    console.log('User found:', { id: user._id, role: user.role, email: user.email });
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
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


