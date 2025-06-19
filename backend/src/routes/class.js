import express from 'express';
import Class from '../models/Class.js';
import School from '../models/School.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all classes for a school
router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.user.schoolId });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new class
router.post('/', auth, async (req, res) => {
  try {
    const school = await School.findById(req.user.schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const newClass = new Class({
      ...req.body,
      schoolId: req.user.schoolId
    });

    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update class
router.put('/:id', auth, async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Convert both to strings for comparison
    const classSchoolId = classDoc.schoolId.toString();
    const userSchoolId = req.user.schoolId.toString();
    
    if (classSchoolId !== userSchoolId) {
      return res.status(403).json({ message: 'Not authorized to update this class' });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete class
router.delete('/:id', auth, async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Convert both to strings for comparison
    const classSchoolId = classDoc.schoolId.toString();
    const userSchoolId = req.user.schoolId.toString();
    
    if (classSchoolId !== userSchoolId) {
      return res.status(403).json({ message: 'Not authorized to delete this class' });
    }

    await classDoc.remove();
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get students for a specific class
router.get('/:id/students', auth, async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Convert both to strings for comparison
    const classSchoolId = classDoc.schoolId.toString();
    const userSchoolId = req.user.schoolId.toString();
    
    if (classSchoolId !== userSchoolId) {
      return res.status(403).json({ message: 'Not authorized to access this class' });
    }

    console.log('Looking for students with:', {
      classId: req.params.id,
      role: 'STUDENT',
      schoolId: req.user.schoolId,
      isActive: true
    });

    const students = await User.find({
      classId: req.params.id,
      role: 'STUDENT',
      schoolId: req.user.schoolId,
      isActive: true
    }).select('-password').sort({ rollNo: 1 });

    console.log('Found students:', students.length);

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get classes assigned to the logged-in teacher
router.get('/teacher/classes', auth, async (req, res) => {
  try {
    if (req.user.role !== 'TEACHER') {
      return res.status(403).json({ message: 'Access denied: Only teachers can access this endpoint.' });
    }
    const classes = await Class.find({ teacherId: req.user._id, schoolId: req.user.schoolId });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 