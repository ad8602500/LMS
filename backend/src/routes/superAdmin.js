import express from 'express';
import School from '../models/School.js';
import User from '../models/User.js';
import { isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create new school
router.post('/schools', isSuperAdmin, async (req, res) => {
    try {
        const { name, address, contactEmail, contactPhone } = req.body;
        
        const school = new School({
            name,
            address,
            contactEmail,
            contactPhone
        });

        await school.save();
        res.status(201).json({ message: 'School created successfully', school });
    } catch (error) {
        res.status(500).json({ message: 'Error creating school', error: error.message });
    }
});

// Get all schools
router.get('/schools', isSuperAdmin, async (req, res) => {
    try {
        const schools = await School.find();
        res.status(200).json(schools);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schools', error: error.message });
    }
});

// Delete school
router.delete('/schools/:id', isSuperAdmin, async (req, res) => {
    try {
        const school = await School.findByIdAndDelete(req.params.id);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.status(200).json({ message: 'School deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting school', error: error.message });
    }
});

// Create admin for a school
router.post('/users/admin', isSuperAdmin, async (req, res) => {
    try {
        const { email, password, name, schoolId } = req.body;

        // Check if school exists
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const admin = new User({
            email,
            password,
            name,
            role: 'admin',
            school: schoolId
        });

        await admin.save();
        res.status(201).json({ message: 'Admin created successfully', admin });
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin', error: error.message });
    }
});

// Get statistics
router.get('/stats', isSuperAdmin, async (req, res) => {
    try {
        const totalSchools = await School.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalStudents = await User.countDocuments({ role: 'student' });

        res.status(200).json({
            totalSchools,
            totalUsers,
            userBreakdown: {
                admins: totalAdmins,
                teachers: totalTeachers,
                students: totalStudents
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
});

export default router;
