import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, checkRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Class from '../models/Class.js';

const router = express.Router();

// Get all students for a school
router.get('/', auth, async (req, res) => {
  try {
    const students = await User.find({
      schoolId: req.user.schoolId,
      role: 'STUDENT'
    }).select('-password');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper to generate student userId
function generateStudentUserId(admissionYear) {
  const yearPart = (admissionYear % 1000).toString().padStart(3, '0');
  const uniquePart = Math.floor(10000 + Math.random() * 90000).toString();
  return yearPart + uniquePart; // e.g., '12106635'
}

// Add new student
router.post('/', [
  auth,
  checkRole('ADMIN'),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('classId').optional().isMongoId(),
  body('admissionNumber').notEmpty().trim(),
  body('admissionDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      classId,
      admissionNumber,
      admissionDate
    } = req.body;

    // Check if student with same email or admission number exists
    const existingStudent = await User.findOne({
      $or: [
        { email },
        { admissionNumber }
      ],
      schoolId: req.user.schoolId
    });

    if (existingStudent) {
      return res.status(400).json({
        message: 'Student with this email or admission number already exists'
      });
    }

    // If classId is provided, verify it exists
    if (classId) {
      const classExists = await Class.findOne({
        _id: classId,
        schoolId: req.user.schoolId
      });
      if (!classExists) {
        return res.status(400).json({ message: 'Invalid class ID' });
      }
    }

    // Create new student
    const admissionYear = admissionDate ? new Date(admissionDate).getFullYear() : new Date().getFullYear();
    const userId = generateStudentUserId(admissionYear);
    const student = new User({
      userId,
      firstName,
      lastName,
      email,
      password,
      classId,
      admissionNumber,
      admissionDate: admissionDate || new Date(),
      role: 'STUDENT',
      schoolId: req.user.schoolId,
      isActive: true
    });

    await student.save();

    // Return student data without password
    const studentData = student.toObject();
    delete studentData.password;

    res.status(201).json(studentData);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.put('/:id', [
  auth,
  checkRole('ADMIN'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('email').optional().isEmail(),
  body('classId').optional().isMongoId(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = await User.findOne({
      _id: req.params.id,
      schoolId: req.user.schoolId,
      role: 'STUDENT'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields
    const updateFields = ['firstName', 'lastName', 'email', 'classId', 'isActive'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    // Return updated student data without password
    const studentData = student.toObject();
    delete studentData.password;

    res.json(studentData);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student
router.delete('/:id', [auth, checkRole('ADMIN')], async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      schoolId: req.user.schoolId,
      role: 'STUDENT'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.remove();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 