import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import School from '../models/School.js';
import { auth, checkRole } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Create initial super admin (should be called only once)
router.post('/create-super-admin', async (req, res) => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super admin already exists' });
    }

    // Create super admin
    const superAdmin = new User({
      userId: 'SUPER_ADMIN',
      email: 'admin@lms.com',
      password: 'admin123',
      role: 'SUPER_ADMIN',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true
    });

    await superAdmin.save();

    res.status(201).json({
      message: 'Super admin created successfully',
      user: {
        userId: superAdmin.userId,
        email: superAdmin.email,
        role: superAdmin.role
      }
    });
  } catch (error) {
    console.error('Create super admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', [
  body('schoolId').optional().trim(),
  body('userId').notEmpty().trim(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolId, userId, password } = req.body;
    console.log('Login attempt:', { schoolId, userId });

    // For Super Admin login
    if (!schoolId) {
      console.log('Attempting Super Admin login...');
      const superAdmin = await User.findOne({
        userId,
        role: 'SUPER_ADMIN',
        isActive: true
      });

      if (!superAdmin) {
        console.log('Super Admin not found');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await superAdmin.comparePassword(password);
      if (!isMatch) {
        console.log('Super Admin password mismatch');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      superAdmin.lastLogin = new Date();
      await superAdmin.save();

      const token = jwt.sign(
        { userId: superAdmin._id, role: superAdmin.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: superAdmin._id,
          userId: superAdmin.userId,
          role: superAdmin.role,
          firstName: superAdmin.firstName,
          lastName: superAdmin.lastName,
          email: superAdmin.email
        }
      });
    }

    // For School Users (Admin, Teacher, Student)
    console.log('Searching for school:', schoolId);
    const school = await School.findOne({ schoolId, isActive: true });
    if (!school) {
      console.log('School not found or inactive:', schoolId);
      return res.status(404).json({ message: 'School not found or inactive' });
    }

    console.log('Searching for user in school:', school._id);
    // Find user in the school
    const user = await User.findOne({
      $or: [
        { userId: userId },
        { email: userId }
      ],
      schoolId: school._id,
      isActive: true
    });

    if (!user) {
      console.log('User not found in school');
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: 'User not found in the specified school'
      });
    }

    console.log('User found, checking password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: 'Password is incorrect'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, schoolId: school._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('Login successful for user:', user.userId);
    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: error.message
    });
  }
});

// Register new school (Super Admin only)
router.post('/register-school', [
  auth,
  checkRole('SUPER_ADMIN'),
  body('name').notEmpty().trim(),
  body('schoolId').notEmpty().trim(),
  body('address').notEmpty(),
  body('contactEmail').isEmail(),
  body('contactPhone').notEmpty(),
  body('adminEmail').isEmail(),
  body('adminPassword').isLength({ min: 6 }),
  body('adminFirstName').notEmpty(),
  body('adminLastName').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      schoolId,
      address,
      contactEmail,
      contactPhone,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName
    } = req.body;

    // Check if school ID already exists
    const existingSchool = await School.findOne({ schoolId });
    if (existingSchool) {
      return res.status(400).json({ message: 'School ID already exists' });
    }

    // Create school
    const school = new School({
      name,
      schoolId,
      address,
      contactEmail,
      contactPhone
    });

    await school.save();

    // Create school admin
    const admin = new User({
      userId: `ADMIN_${schoolId}`,
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN',
      firstName: adminFirstName,
      lastName: adminLastName,
      schoolId: school._id,
      isActive: true
    });

    await admin.save();

    res.status(201).json({
      message: 'School registered successfully',
      school: {
        id: school._id,
        name: school.name,
        schoolId: school.schoolId
      },
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Register school error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if super admin exists
router.get('/check-super-admin', async (req, res) => {
  try {
    const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (superAdmin) {
      res.json({
        exists: true,
        userId: superAdmin.userId,
        email: superAdmin.email
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Check super admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify and create super admin if needed
router.post('/verify-super-admin', async (req, res) => {
  try {
    // Check if super admin exists
    let superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    
    if (!superAdmin) {
      console.log('No super admin found, creating one...');
      
      // Create a default school for super admin
      const defaultSchool = new School({
        name: 'System School',
        schoolId: 'SYSTEM',
        address: 'System Address',
        contactEmail: 'system@lms.com',
        contactPhone: '0000000000'
      });
      await defaultSchool.save();

      // Create super admin
      superAdmin = new User({
        userId: '121',
        schoolId: defaultSchool._id,
        email: 'aditya@lms.com',
        password: '1138',
        role: 'SUPER_ADMIN',
        firstName: 'Aditya',
        lastName: 'Admin',
        isActive: true
      });
      await superAdmin.save();
      
      console.log('Super admin created successfully');
    }

    // Return super admin details
    res.json({
      exists: true,
      user: {
        userId: superAdmin.userId,
        email: superAdmin.email,
        role: superAdmin.role,
        isActive: superAdmin.isActive
      }
    });
  } catch (error) {
    console.error('Verify super admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

function generateTeacherUserId() {
  // Generate a random 5-digit number
  return Math.floor(10000 + Math.random() * 90000).toString();
}
function generateStudentUserId(admissionYear) {
  // Get last 3 digits of the year (e.g., 2021 -> 121)
  const yearPart = (admissionYear % 1000).toString().padStart(3, '0');
  // Generate a random 5-digit number
  const uniquePart = Math.floor(10000 + Math.random() * 90000).toString();
  return yearPart + uniquePart; // e.g., '12106635'
}
function generatePassword() {
  return Math.random().toString(36).slice(-8); // 8-char random password
}

export default router; 