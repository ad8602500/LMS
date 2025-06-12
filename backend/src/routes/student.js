import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import Student from '../models/Student.js';
import School from '../models/School.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/students');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Generate unique user ID for student
const generateUserId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `STU${timestamp}${random}`;
};

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(4).toString('hex');
};

// Get all students for a school
router.get('/', async (req, res) => {
  try {
    const students = await Student.find({ schoolId: req.user.schoolId });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new student
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const school = await School.findById(req.user.schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const userId = generateUserId();
    const password = generatePassword();

    const student = new Student({
      ...req.body,
      schoolId: req.user.schoolId,
      userId,
      password,
      image: req.file ? `/uploads/students/${req.file.filename}` : null
    });

    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.schoolId.toString() !== req.user.schoolId) {
      return res.status(403).json({ message: 'Not authorized to update this student' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/students/${req.file.filename}`;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.schoolId.toString() !== req.user.schoolId) {
      return res.status(403).json({ message: 'Not authorized to delete this student' });
    }

    await student.remove();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 