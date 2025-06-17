import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import User from '../models/User.js';
import School from '../models/School.js';
import { auth, checkRole } from '../middleware/auth.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/teachers')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Helper to generate teacher userId
function generateTeacherUserId() {
  return Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
}

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(4).toString('hex');
};

// Get all teachers for a school
router.get('/', auth, checkRole('ADMIN'), async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const teachers = await User.find({ schoolId, role: 'TEACHER' });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new teacher
router.post('/', auth, checkRole('ADMIN'), upload.single('image'), async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const school = await School.findById(schoolId);
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const userId = generateTeacherUserId();
    const password = generatePassword();

    // Check if user already exists by email or generated userId
    const existingUser = await User.findOne({ 
      $or: [{ email: req.body.email }, { userId: userId }],
      schoolId,
      role: 'TEACHER'
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Teacher with this email or User ID already exists' });
    }

    const teacher = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      qualification: req.body.qualification,
      joiningDate: req.body.joiningDate,
      schoolId,
      userId,
      password,
      role: 'TEACHER',
      image: req.file ? `/uploads/teachers/${req.file.filename}` : null
    });

    const newTeacher = await teacher.save();

    // Send email with credentials
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"${school.name}" <${process.env.EMAIL_USER}>`,
        to: newTeacher.email,
        subject: 'Your Account Credentials',
        text: `Welcome to ${school.name}!\n\nYour User ID: ${userId}\nYour Password: ${password}\n\nPlease log in and change your password after first login.`
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue with the response even if email fails
    }

    res.status(201).json({
      teacher: newTeacher.toJSON(),
      credentials: {
        userId,
        password
      }
    });
  } catch (error) {
    console.error('Add teacher error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a teacher
router.put('/:id', auth, checkRole('ADMIN'), upload.single('image'), async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const teacher = await User.findOne({ _id: req.params.id, schoolId, role: 'TEACHER' });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.image = `/uploads/teachers/${req.file.filename}`;
    }
    if (updates.email && updates.email !== teacher.email) {
      const existingEmailUser = await User.findOne({ email: updates.email, schoolId, role: 'TEACHER' });
      if (existingEmailUser) {
        return res.status(400).json({ message: 'Another teacher with this email already exists' });
      }
    }

    Object.assign(teacher, updates);
    const updatedTeacher = await teacher.save();
    
    res.json(updatedTeacher);
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a teacher
router.delete('/:id', auth, checkRole('ADMIN'), async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const teacher = await User.findOne({ _id: req.params.id, schoolId, role: 'TEACHER' });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await teacher.deleteOne();
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 