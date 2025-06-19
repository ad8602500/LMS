import express from 'express';
import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get attendance for a class on a specific date
router.get('/class/:classId', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const { classId } = req.params;
    
    // Validate classId
    if (!classId || !classId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid class ID' });
    }
    
    const queryDate = date ? new Date(date) : new Date();
    
    // Validate date
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Create new Date objects to avoid modifying the original
    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999);
    
    console.log('Fetching attendance for:', {
      classId: classId,
      date: date,
      startOfDay: startOfDay,
      endOfDay: endOfDay,
      userSchoolId: req.user.schoolId
    });
    
    // First check if the class exists and belongs to the user's school
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (classDoc.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this class' });
    }
    
    const attendance = await Attendance.find({
      classId: classId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('studentId', 'firstName lastName');

    console.log('Found attendance records:', attendance.length);

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark attendance for multiple students
router.post('/mark', auth, async (req, res) => {
  try {
    const { classId, date, attendanceData } = req.body;
    
    // Validate required fields
    if (!classId || !date || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate classId format
    if (!classId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid class ID' });
    }
    
    const queryDate = new Date(date);
    
    // Validate date
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Create new Date objects to avoid modifying the original
    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999);
    
    console.log('Marking attendance:', {
      classId: classId,
      date: date,
      attendanceData: attendanceData.length,
      userSchoolId: req.user.schoolId
    });
    
    const results = [];
    
    for (const record of attendanceData) {
      // Validate record
      if (!record.studentId || !record.status) {
        console.error('Invalid attendance record:', record);
        continue;
      }
      
      // Check if attendance record already exists for this student on this date
      const existingAttendance = await Attendance.findOne({
        studentId: record.studentId,
        classId: classId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });

      if (existingAttendance) {
        // Update existing record
        existingAttendance.status = record.status;
        existingAttendance.remarks = record.remarks || '';
        existingAttendance.markedBy = req.user._id;
        const updatedAttendance = await existingAttendance.save();
        results.push(updatedAttendance);
      } else {
        // Create new record
        const newAttendance = new Attendance({
          studentId: record.studentId,
          classId,
          date: new Date(date),
          status: record.status,
          remarks: record.remarks || '',
          markedBy: req.user._id,
          schoolId: req.user.schoolId
        });
        const savedAttendance = await newAttendance.save();
        results.push(savedAttendance);
      }
    }

    console.log('Successfully processed attendance records:', results.length);
    res.status(201).json(results);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(400).json({ 
      message: 'Error marking attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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