import express from 'express';
import Attendance from '../models/Attendance.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get attendance for a class on a specific date
router.get('/class/:classId', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    
    const attendance = await Attendance.find({
      classId: req.params.classId,
      date: {
        $gte: new Date(queryDate.setHours(0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59))
      }
    }).populate('studentId', 'firstName lastName');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance for multiple students
router.post('/mark', auth, async (req, res) => {
  try {
    const { classId, date, attendanceData } = req.body;
    
    // Create attendance records for each student
    const attendanceRecords = attendanceData.map(record => ({
      studentId: record.studentId,
      classId,
      date: new Date(date),
      status: record.status,
      remarks: record.remarks,
      markedBy: req.user._id,
      schoolId: req.user.schoolId
    }));

    // Save all attendance records
    const savedAttendance = await Attendance.insertMany(attendanceRecords);
    res.status(201).json(savedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update attendance for a student
router.put('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Update attendance
    Object.assign(attendance, req.body);
    const updatedAttendance = await attendance.save();
    res.json(updatedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get attendance report for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      studentId: req.params.studentId,
      schoolId: req.user.schoolId
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('classId', 'name section')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 