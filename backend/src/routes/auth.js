import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import School from '../models/School.js';
import { auth, checkRole } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourgmail@gmail.com',
    pass: 'your-app-password' // Use an App Password, not your main Gmail password
  }
});

// Create initial super admin (should be called only once)
router.post('/create-super-admin', async (req, res) => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super admin already exists' });
    }

    // Create a default school for super admin
    const defaultSchool = new School({
      name: 'System School',
      schoolId: 'SYSTEM',
      address: 'System Address',
      contactEmail: 'system@lms.com',
      contactPhone: '0000000000'
    });
    await defaultSchool.save();

    // Create super admin with specified details
    const superAdmin = new User({
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

    res.status(201).json({ 
      message: 'Super admin created successfully',
      user: {
        userId: superAdmin.userId,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
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
  body('userId').notEmpty().trim(),
  body('password').notEmpty(),
  body('schoolId').optional().trim(),
  body('role').optional().trim()
], async (req, res) => {
  try {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ 
        message: 'Server configuration error',
        details: 'JWT secret is not configured'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Invalid request data',
        errors: errors.array() 
      });
    }

    const { schoolId, userId, password, role } = req.body;
    console.log('Login attempt:', { userId, schoolId, role });

    // For SuperAdmin login
    if (role === 'SUPER_ADMIN' || !schoolId) {
      console.log('Attempting super admin login...');
      
      const superAdmin = await User.findOne({ 
        userId,
        role: 'SUPER_ADMIN',
        isActive: true
      });

      console.log('Found super admin:', superAdmin ? {
        userId: superAdmin.userId,
        email: superAdmin.email,
        isActive: superAdmin.isActive,
        role: superAdmin.role
      } : 'No super admin found');

      if (!superAdmin) {
        return res.status(401).json({ 
          message: 'Invalid credentials',
          details: 'Super admin not found or inactive'
        });
      }

      const isMatch = await superAdmin.comparePassword(password);
      console.log('Password match result:', isMatch);

      if (!isMatch) {
        return res.status(401).json({ 
          message: 'Invalid credentials',
          details: 'Password does not match'
        });
      }

      // Update last login
      superAdmin.lastLogin = new Date();
      await superAdmin.save();

      try {
        // Generate token
        const token = jwt.sign(
          { userId: superAdmin._id, role: superAdmin.role },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        console.log('Login successful, sending response...');

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
      } catch (jwtError) {
        console.error('JWT signing error:', jwtError);
        return res.status(500).json({ 
          message: 'Server error',
          details: 'Error generating authentication token'
        });
      }
    }

    // For other users (School Admin, Teacher, Student)
    const school = await School.findOne({ schoolId });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Try to find user by userId or email
    const user = await User.findOne({ 
      $or: [
        { userId: userId },
        { email: userId }
      ],
      schoolId: school._id,
      isActive: true
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        userId: user.userId,
        schoolId: school._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
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
  body('adminLastName').notEmpty(),
  body('admissionDate').isDate()
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
      adminLastName,
      admissionDate
    } = req.body;

    const admissionDateObj = new Date(admissionDate);
    const admissionYear = admissionDateObj.getFullYear();

    // Create school
    const school = new School({
      name,
      schoolId,
      address,
      contactEmail,
      contactPhone
    });
    await school.save();

    // Create admin user
    const userId = generateStudentUserId(admissionYear);
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      userId,
      schoolId: school._id,
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      firstName: adminFirstName,
      lastName: adminLastName,
      admissionYear: admissionYear
    });
    await user.save();

    // Send email with credentials
    const mailOptions = {
      from: 'yourgmail@gmail.com',
      to: adminEmail,
      subject: 'School Admin Account Information',
      text: `
        Dear ${adminFirstName} ${adminLastName},

        You have been successfully registered as an admin for the school "${name}".

        Here are your login details:
        - User ID: ${userId}
        - Password: ${password}

        Please log in to the system using these credentials.

        Best regards,
        LMS Team
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Email sending failed' });
      }
      res.status(201).json({
        message: 'School and admin created successfully',
        school: {
          id: school._id,
          schoolId: school.schoolId,
          name: school.name
        },
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'School ID or email already exists' 
      });
    }
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