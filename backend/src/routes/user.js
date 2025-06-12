import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import School from '../models/School.js';
import { auth, checkRole, checkSchoolAccess } from '../middleware/auth.js';

const router = express.Router();

// Get all users for a school (Admin only)
router.get('/school/:schoolId', [
  auth,
  checkRole('ADMIN'),
  checkSchoolAccess
], async (req, res) => {
  try {
    const school = await School.findOne({ schoolId: req.params.schoolId });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const users = await User.find({ 
      schoolId: school._id,
      isActive: true 
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new user (Admin only)
router.post('/register', [
  auth,
  checkRole('ADMIN'),
  body('schoolId').notEmpty(),
  body('userId').notEmpty().trim(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['TEACHER', 'STUDENT']),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      schoolId,
      userId,
      email,
      password,
      role,
      firstName,
      lastName
    } = req.body;

    // Check if school exists
    const school = await School.findOne({ schoolId });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { userId },
        { email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User ID or email already exists' 
      });
    }

    // Create new user
    const user = new User({
      userId,
      schoolId: school._id,
      email,
      password,
      role,
      firstName,
      lastName
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (Admin only)
router.put('/:userId', [
  auth,
  checkRole('ADMIN'),
  body('email').optional().isEmail(),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({ 
      userId: req.params.userId,
      isActive: true 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if admin has access to this user's school
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.schoolId.toString() !== user.schoolId.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to update this user' 
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'password') {
        user[key] = req.body[key];
      }
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate user (Admin only)
router.delete('/:userId', auth, checkRole('ADMIN'), async (req, res) => {
  try {
    const user = await User.findOne({ 
      userId: req.params.userId,
      isActive: true 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if admin has access to this user's school
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.schoolId.toString() !== user.schoolId.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to deactivate this user' 
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 