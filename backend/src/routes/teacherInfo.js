import express from 'express';
import TeacherInfo from '../models/TeacherInfo.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get current teacher's info (with personal info fallback from User)
router.get('/me', auth, checkRole('TEACHER'), async (req, res) => {
  try {
    let info = await TeacherInfo.findOne({ user: req.user._id });
    if (!info) {
      // fallback: return personal info from User, rest blank
      const user = req.user;
      return res.json({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        subject: user.subject || '',
        qualification: user.qualification || '',
        joiningDate: user.joiningDate || '',
        permanentAddress: '',
        currentAddress: '',
        aadharNumber: '',
        panNumber: '',
        motherName: '',
        fatherName: '',
        bankAccountNumber: '',
        ifscCode: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        mobileNumber: '',
        emergencyContactNumber: '',
        emailId: '',
        bloodGroup: '',
        finalized: false
      });
    }
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update or create current teacher's info (copy personal info from User)
router.put('/me', auth, checkRole('TEACHER'), async (req, res) => {
  try {
    let info = await TeacherInfo.findOne({ user: req.user._id });
    if (info && info.finalized) {
      return res.status(403).json({ message: 'Info already finalized. No further edits allowed.' });
    }
    // Copy personal info from User
    const user = req.user;
    const data = {
      ...req.body,
      user: req.user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      subject: user.subject,
      qualification: user.qualification,
      joiningDate: user.joiningDate
    };
    if (!info) {
      info = new TeacherInfo(data);
    } else {
      Object.assign(info, data);
    }
    // Validate required fields
    const requiredFields = [
      'permanentAddress', 'currentAddress', 'aadharNumber', 'panNumber',
      'motherName', 'fatherName', 'bankAccountNumber', 'ifscCode'
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }
    // Validate Aadhar (12 digits)
    if (!/^\d{12}$/.test(data.aadharNumber)) {
      return res.status(400).json({ message: 'Invalid Aadhar number format' });
    }
    // Validate PAN (5 letters, 4 digits, 1 letter)
    if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(data.panNumber)) {
      return res.status(400).json({ message: 'Invalid PAN number format' });
    }
    // Validate IFSC (4 letters, 0, 6 digits)
    if (!/^[A-Z]{4}0\d{6}$/.test(data.ifscCode)) {
      return res.status(400).json({ message: 'Invalid IFSC code format' });
    }
    info.finalized = true;
    await info.save();
    res.json({ message: 'Info updated and finalized', info });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
