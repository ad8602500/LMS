import express from 'express';
import { body, validationResult } from 'express-validator';
import School from '../models/School.js';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import { auth, checkRole, checkSchoolAccess } from '../middleware/auth.js';

const router = express.Router();

// Get all schools (Super Admin only)
router.get('/', auth, checkRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const schools = await School.find({ isActive: true });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get school by ID
router.get('/:schoolId', auth, checkSchoolAccess, async (req, res) => {
  try {
    const school = await School.findOne({ 
      schoolId: req.params.schoolId,
      isActive: true 
    });
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update school (Admin only)
router.put('/:schoolId', [
  auth,
  checkRole('ADMIN'),
  checkSchoolAccess,
  body('name').optional().trim(),
  body('address').optional(),
  body('contactEmail').optional().isEmail(),
  body('contactPhone').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const school = await School.findOne({ 
      schoolId: req.params.schoolId,
      isActive: true 
    });

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        school[key] = req.body[key];
      }
    });

    await school.save();
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate school (Super Admin only)
router.delete('/:schoolId', auth, checkRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const school = await School.findOne({ 
      schoolId: req.params.schoolId,
      isActive: true 
    });

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Soft delete - set isActive to false
    school.isActive = false;
    await school.save();

    // Deactivate all users associated with this school
    await User.updateMany(
      { schoolId: school._id },
      { isActive: false }
    );

    res.json({ message: 'School deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get school-specific statistics (Admin only)
router.get('/stats', auth, checkRole('ADMIN'), async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    
    const totalTeachers = await Teacher.countDocuments({ schoolId });
    const totalStudents = await Student.countDocuments({ schoolId });
    const totalClasses = await Class.countDocuments({ schoolId });

    res.status(200).json({
      totalTeachers,
      totalStudents,
      totalClasses,
      pendingFees: 0, // Placeholder, implement actual fee logic later
      recentActivity: [] // Placeholder, implement actual activity logic later
    });
  } catch (error) {
    console.error('Error fetching school stats:', error);
    res.status(500).json({ message: 'Error fetching school statistics' });
  }
});

export default router; 