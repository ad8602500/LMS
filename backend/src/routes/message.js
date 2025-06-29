import express from 'express';
import Message from '../models/Message.js';
import { auth, checkRole } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

//student send message to teacher
router.post('/student-to-teacher', auth,checkRole('STUDENT'), async (req, res) => {
    try {
        const { content } = req.body;
        const student  = await User.findById(req.user._id);
        
         const teacher = await User.findOne({ classId: student.classId, role: 'TEACHER' });

        if (!teacher) {
            return res.status(404).json({ message: 'Class Teacher not found' });
        }

        const message = await Message.create({
            sender: student._id,
            receiver: teacher._id,
            content
        });

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
});

// Teacher sends message to a specific student
router.post('/teacher-to-student', auth, checkRole('TEACHER'), async (req, res) => {
    const { content, studentId } = req.body;
  
    const student = await User.findOne({ _id: studentId, role: 'STUDENT' });
    if (!student) return res.status(404).json({ message: 'Student not found' });
  
    const message = await Message.create({
      sender: req.user._id,
      receiver: student._id,
      content
    });
  
    res.status(201).json({ message: 'Message sent to student', data: message });
  });
  
  // Teacher sends message to all students in their class
  router.post('/teacher-to-class', auth, checkRole('TEACHER'), async (req, res) => {
    const { content } = req.body;
  
    const students = await User.find({ classId: req.user.classId, role: 'STUDENT' });
  
    const messages = await Promise.all(
      students.map(student =>
        Message.create({
          sender: req.user._id,
          receiver: student._id,
          content
        })
      )
    );
    res.status(201).json({ message: 'Broadcast sent to class', count: messages.length });
});

// Get all messages received by the teacher
router.get('/received', auth, checkRole('TEACHER'), async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user._id })
      .populate('sender', 'firstName lastName role')
      .sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

// Teacher sends message to admin
router.post('/teacher-to-admin', auth, checkRole('TEACHER'), async (req, res) => {
  try {
    const { content } = req.body;
    const admin = await User.findOne({ schoolId: req.user.schoolId, role: 'ADMIN' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    await Message.create({
      sender: req.user._id,
      receiver: admin._id,
      content
    });
    res.status(201).json({ message: 'Message sent to admin' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message to admin', error: error.message });
  }
});

// Get all messages received by the student
router.get('/received', auth, checkRole('STUDENT'), async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user._id })
      .populate('sender', 'firstName lastName role')
      .sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

router.post('/admin-to-all-teachers', auth, checkRole('ADMIN'), async (req, res) => {
  const { content } = req.body;
  const teachers = await User.find({ role: 'TEACHER' });
  const messages = await Promise.all(
    teachers.map(teacher =>
      Message.create({
        sender: req.user._id,
        receiver: teacher._id,
        content
      })
    )
  );
  res.status(201).json({ message: 'Message sent to all teachers', count: messages.length });
});

router.post('/admin-to-teacher', auth, checkRole('ADMIN'), async (req, res) => {
  const { content, teacherId } = req.body;
  const teacher = await User.findOne({ _id: teacherId, role: 'TEACHER' });
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
  const message = await Message.create({
    sender: req.user._id,
    receiver: teacher._id,
    content
  });
  res.status(201).json({ message: 'Message sent to teacher', data: message });
});

router.post('/admin-to-all-students', auth, checkRole('ADMIN'), async (req, res) => {
  const { content } = req.body;
  const students = await User.find({ role: 'STUDENT' });
  const messages = await Promise.all(
    students.map(student =>
      Message.create({
        sender: req.user._id,
        receiver: student._id,
        content
      })
    )
  );
  res.status(201).json({ message: 'Message sent to all students', count: messages.length });
});

router.post('/admin-to-class', auth, checkRole('ADMIN'), async (req, res) => {
  const { content, classId } = req.body;
  const students = await User.find({ classId, role: 'STUDENT' });
  const messages = await Promise.all(
    students.map(student =>
      Message.create({
        sender: req.user._id,
        receiver: student._id,
        content
      })
    )
  );
  res.status(201).json({ message: 'Message sent to class', count: messages.length });
});

router.post('/admin-to-student', auth, checkRole('ADMIN'), async (req, res) => {
  const { content, studentId } = req.body;
  const student = await User.findOne({ _id: studentId, role: 'STUDENT' });
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const message = await Message.create({
    sender: req.user._id,
    receiver: student._id,
    content
  });
  res.status(201).json({ message: 'Message sent to student', data: message });
});

router.get('/received', auth, checkRole('ADMIN'), async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user._id })
      .populate('sender', 'firstName lastName role')
      .sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

export default router;