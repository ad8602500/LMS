import express from 'express';
import { auth, checkRole } from '../middleware/auth.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import Fee from '../models/Fee.js';

const router = express.Router();

// Get admin dashboard statistics
router.get('/stats', auth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    // Get total teachers
    const totalTeachers = await Teacher.countDocuments({ schoolId });

    // Get total students
    const totalStudents = await Student.countDocuments({ schoolId });

    // Get total classes
    const totalClasses = await Class.countDocuments({ schoolId });

    // Get today's attendance count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalAttendance = await Attendance.countDocuments({
      schoolId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Get total pending fees
    const pendingFees = await Fee.aggregate([
      {
        $match: {
          schoolId,
          status: { $in: ['pending', 'partial'] }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $subtract: ['$amount', { $ifNull: ['$paidAmount', 0] }] }
          }
        }
      }
    ]);

    const totalFees = pendingFees.length > 0 ? pendingFees[0].total : 0;

    res.json({
      totalTeachers,
      totalStudents,
      totalClasses,
      totalAttendance,
      totalFees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 