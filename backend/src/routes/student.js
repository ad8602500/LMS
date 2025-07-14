import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import User from '../models/User.js';
import School from '../models/School.js';
import Class from '../models/Class.js';
import StudentInfo from '../models/StudentInfo.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/students/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(4).toString('hex');
};

// Get all students for a school
router.get('/', auth, checkRole('ADMIN'), async (req, res) => {
  console.log('GET /api/admin/students: req.user', req.user);
  try {
    const students = await User.find({ schoolId: req.user.schoolId, role: 'STUDENT' });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add new student
router.post('/', auth, checkRole('ADMIN'), upload.single('image'), async (req, res) => {
  console.log('POST /api/admin/students: req.user', req.user);
  try {
    // Ensure schoolId is available from req.user
    if (!req.user || !req.user.schoolId) {
      console.error('req.user.schoolId is missing during student creation', req.user);
      return res.status(400).json({ message: 'School ID not found for authenticated user.' });
    }

    const school = await School.findById(req.user.schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Get class details to extract class number
    const classDetails = await Class.findById(req.body.classId);
    if (!classDetails) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Extract class number from class name (assuming format like "Class 10" or "10")
    const classNumber = classDetails.name.replace(/[^0-9]/g, '');
    if (!classNumber) {
      return res.status(400).json({ message: 'Invalid class name format. Class name should contain a number.' });
    }

    // Pad class number to 2 digits
    const paddedClassNumber = classNumber.padStart(2, '0');

    // Find the last student in this class to get the next sequence number
    const lastStudent = await User.findOne(
      { 
        schoolId: req.user.schoolId,
        role: 'STUDENT',
        classId: req.body.classId
      },
      { userId: 1 },
      { sort: { userId: -1 } }
    );

    let sequenceNumber;
    if (lastStudent) {
      // Extract the sequence number from the last student's userId
      const lastSequence = parseInt(lastStudent.userId.slice(-4));
      sequenceNumber = (lastSequence + 1).toString().padStart(4, '0');
    } else {
      // If no students in this class yet, start with 0001
      sequenceNumber = '0001';
    }

    // Construct the 6-digit userId: classNumber (2 digits) + sequence (4 digits)
    const userId = `${paddedClassNumber}${sequenceNumber}`;

    // Check if student with this email already exists in this school
    const existingEmailUser = await User.findOne({
      email: req.body.email,
      schoolId: req.user.schoolId,
      role: 'STUDENT'
    });

    if (existingEmailUser) {
      return res.status(400).json({ message: 'Student with this email already exists in this school' });
    }

    const password = generatePassword(); // Keep unhashed password here for response

    const student = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      classId: req.body.classId,
      section: req.body.section,
      rollNo: req.body.rollNo,
      admissionNo: req.body.admissionNo,
      parentName: req.body.parentName,
      parentPhone: req.body.parentPhone,
      schoolId: req.user.schoolId,
      userId,
      password,
      role: 'STUDENT',
      image: req.file ? `/uploads/students/${req.file.filename}` : null
    });

    const newStudent = await student.save();

    res.status(201).json({
      student: newStudent.toJSON(),
      credentials: {
        userId: userId,
        password: password
      }
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update student by ID
router.put('/:id', auth, checkRole('ADMIN'), upload.single('image'), async (req, res) => {
  console.log(`PUT /api/admin/students/${req.params.id}: req.user`, req.user);
  try {
    const { id } = req.params;
    if (!req.user || !req.user.schoolId) {
      return res.status(400).json({ message: 'School ID not found for authenticated user.' });
    }

    const student = await User.findOneAndUpdate(
      { _id: id, schoolId: req.user.schoolId, role: 'STUDENT' },
      { ...req.body, image: req.file ? `/uploads/students/${req.file.filename}` : req.body.image || null },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found or not authorized' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete student by ID
router.delete('/:id', auth, checkRole('ADMIN'), async (req, res) => {
  console.log(`DELETE /api/admin/students/${req.params.id}: req.user`, req.user);
  try {
    const { id } = req.params;
    if (!req.user || !req.user.schoolId) {
      return res.status(400).json({ message: 'School ID not found for authenticated user.' });
    }
    const student = await User.findOneAndDelete({ _id: id, schoolId: req.user.schoolId, role: 'STUDENT' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found or not authorized' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get current student's profile (with addresses from StudentInfo)
router.get('/me', auth, checkRole('STUDENT'), async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.user._id, role: 'STUDENT' }).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const info = await StudentInfo.findOne({ user: req.user._id });
    res.json({
      ...student.toObject(),
      permanentAddress: info?.permanentAddress || {},
      correspondingAddress: info?.correspondingAddress || {},
      payingGuestAddress: info?.payingGuestAddress || {},
      // Add extra personal info fields
      dob: info?.dob || '',
      gender: info?.gender || '',
      category: info?.category || '',
      emergencyContact: info?.emergencyContact || '',
      motherName: info?.motherName || '',
      motherMobile: info?.motherMobile || '',
      fatherMobile: info?.fatherMobile || '',
      landline: info?.landline || '',
      fatherEmail: info?.fatherEmail || '',
      lpuEmail: info?.lpuEmail || '',
      photo: info?.photo || '',
      studentProfileFinalized: info?.finalized || false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update current student's profile (only if not finalized)
router.put('/me', auth, checkRole('STUDENT'), async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.user._id, role: 'STUDENT' });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (student.studentProfileFinalized) {
      return res.status(403).json({ message: 'Profile already finalized. No further edits allowed.' });
    }
    // Save all fields (add validation as needed)
    Object.assign(student, req.body);
    student.studentProfileFinalized = true;
    await student.save();
    res.json({ message: 'Profile updated and finalized', student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Save student addresses (permanent, corresponding, paying guest) in StudentInfo
router.post('/update-addresses', auth, checkRole('STUDENT'), async (req, res) => {
  try {
    let info = await StudentInfo.findOne({ user: req.user._id });
    if (info && info.finalized) {
      return res.status(403).json({ message: 'Profile already finalized. No further edits allowed.' });
    }
    const extraFields = {
      dob: req.body.dob,
      gender: req.body.gender,
      category: req.body.category,
      emergencyContact: req.body.emergencyContact,
      motherName: req.body.motherName,
      motherMobile: req.body.motherMobile,
      fatherMobile: req.body.fatherMobile,
      landline: req.body.landline,
      fatherEmail: req.body.fatherEmail,
      lpuEmail: req.body.lpuEmail,
      photo: req.body.photo
    };
    if (!info) {
      info = new StudentInfo({
        user: req.user._id,
        permanentAddress: req.body.permanentAddress,
        correspondingAddress: req.body.correspondingAddress,
        payingGuestAddress: req.body.payingGuestAddress,
        ...extraFields,
        finalized: true
      });
    } else {
      info.permanentAddress = req.body.permanentAddress;
      info.correspondingAddress = req.body.correspondingAddress;
      info.payingGuestAddress = req.body.payingGuestAddress;
      Object.assign(info, extraFields);
      info.finalized = true;
    }
    await info.save();
    res.json({ message: 'Addresses and extra info updated and profile finalized.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;