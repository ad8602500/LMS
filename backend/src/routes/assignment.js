import express from 'express';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Class from '../models/Class.js';
import upload from '../middleware/FileUpload.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Create assignment (Teacher only)
router.post('/', [auth, checkRole(['TEACHER']), upload.single('file')], async (req, res) => {
  try {
    const { subject, topic, dueDate, classId } = req.body;
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    if (classDoc.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create assignment for this class' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Assignment file is required' });
    }
    const assignment = new Assignment({
      subject,
      topic,
      filePath: `/uploads/assignments/${req.file.filename}`,
      dueDate: dueDate || null,
      classId,
      teacherId: req.user._id,
      schoolId: req.user.schoolId
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get assignments for a class (Teacher or Student)
router.get('/class/:classId', [auth, checkRole(['TEACHER', 'STUDENT'])], async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.classId);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    if (req.user.role !== 'SUPER_ADMIN' && classDoc.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this class' });
    }
    if (req.user.role === 'STUDENT' && req.user.classId.toString() !== req.params.classId) {
      return res.status(403).json({ message: 'Not authorized to access assignments for this class' });
    }
    const assignments = await Assignment.find({ classId: req.params.classId, isActive: true })
      .populate('teacherId', 'firstName lastName')
      .populate('classId', 'name section');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update assignment (Teacher only)
router.put('/:id', [auth, checkRole(['TEACHER']), upload.single('file')], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (assignment.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }
    const { subject, topic, dueDate } = req.body;
    if (subject) assignment.subject = subject;
    if (topic) assignment.topic = topic;
    if (dueDate) assignment.dueDate = dueDate;
    if (req.file) assignment.filePath = `/uploads/assignments/${req.file.filename}`;
    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete assignment (Teacher only)
router.delete('/:id', [auth, checkRole(['TEACHER'])], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (assignment.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }
    assignment.isActive = false;
    await assignment.save();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload submission (Student only)
router.post('/submission/:assignmentId', [auth, checkRole(['STUDENT']), upload.single('file')], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (req.user.classId.toString() !== assignment.classId.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit for this assignment' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Submission file is required' });
    }
    const existingSubmission = await Submission.findOne({
      assignmentId: req.params.assignmentId,
      studentId: req.user._id
    });
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }
    const submission = new Submission({
      assignmentId: req.params.assignmentId,
      studentId: req.user._id,
      filePath: `/Uploads/submissions/${req.file.filename}`,
      schoolId: req.user.schoolId
    });
    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get submissions for an assignment (Teacher only)
router.get('/submission/:assignmentId', [auth, checkRole(['TEACHER'])], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (assignment.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view submissions for this assignment' });
    }
    const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
      .populate('studentId', 'firstName lastName rollNo')
      .populate('assignmentId', 'subject topic');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get submissions for a student (Student only)
router.get('/submission/student/:studentId', [auth, checkRole(['STUDENT'])], async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.studentId) {
      return res.status(403).json({ message: 'Not authorized to view these submissions' });
    }
    const submissions = await Submission.find({ studentId: req.params.studentId })
      .populate('assignmentId', 'subject topic')
      .populate('studentId', 'firstName lastName rollNo');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Grade submission (Teacher only)
router.put('/submission/:submissionId', [auth, checkRole(['TEACHER'])], async (req, res) => {
  try {
    const { marks, remarks } = req.body;
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    const assignment = await Assignment.findById(submission.assignmentId);
    if (assignment.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to grade this submission' });
    }
    if (marks !== undefined) submission.marks = marks;
    if (remarks) submission.remarks = remarks;
    await submission.save();
    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;