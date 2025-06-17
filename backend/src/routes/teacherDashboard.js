import express from 'express';
import { auth, checkRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
// Import other models as needed for dashboard data (e.g., Assignment, Attendance)

const router = express.Router();

// Get Teacher Dashboard Statistics
router.get('/stats', auth, checkRole(['TEACHER']), async (req, res) => {
  try {
    const teacherId = req.user._id;
    const schoolId = req.user.schoolId;

    // Find classes assigned to this teacher
    const classesAssigned = await Class.find({ teacherId, schoolId, isActive: true });
    const totalClassesAssigned = classesAssigned.length;

    // Get total students taught by this teacher (across all their classes)
    // This assumes students are linked to classes, and classes are linked to teachers.
    // For simplicity, we'll count students in classes directly assigned to this teacher.
    let totalStudents = 0;
    if (classesAssigned.length > 0) {
      const classIds = classesAssigned.map(cls => cls._id);
      // Assuming students have a reference to their class ID
      totalStudents = await User.countDocuments({ role: 'STUDENT', 'classId': { $in: classIds }, schoolId, isActive: true });
    }

    // Placeholder for upcoming classes/sessions (will require a Timetable/Schedule model)
    const upcomingClasses = []; // Example: [{ name: 'Math - Grade 7', time: '10:00 AM', date: '2024-07-20' }];

    // Placeholder for notifications/announcements
    const notifications = []; // Example: [{ message: 'New assignment due', type: 'info' }];

    res.status(200).json({
      totalClasses: totalClassesAssigned,
      totalStudents: totalStudents,
      upcomingClasses,
      notifications,
      // Add more stats as implemented
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching teacher dashboard statistics' });
  }
});

export default router; 