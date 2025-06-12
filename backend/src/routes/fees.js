import express from 'express';
import Fee from '../models/Fee.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get all fees for a class
router.get('/class/:classId', auth, async (req, res) => {
  try {
    const fees = await Fee.find({
      classId: req.params.classId,
      schoolId: req.user.schoolId
    }).populate('studentId', 'firstName lastName');

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get fees for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const fees = await Fee.find({
      studentId: req.params.studentId,
      schoolId: req.user.schoolId
    }).populate('classId', 'name section');

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new fee record
router.post('/', auth, async (req, res) => {
  try {
    const fee = new Fee({
      ...req.body,
      schoolId: req.user.schoolId
    });

    const savedFee = await fee.save();
    res.status(201).json(savedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update fee payment
router.put('/:id', auth, async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    // Update payment details
    Object.assign(fee, req.body);
    const updatedFee = await fee.save();
    res.json(updatedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get fee summary for a class
router.get('/summary/class/:classId', auth, async (req, res) => {
  try {
    const fees = await Fee.find({
      classId: req.params.classId,
      schoolId: req.user.schoolId
    });

    const summary = {
      totalAmount: fees.reduce((sum, fee) => sum + fee.amount, 0),
      totalPaid: fees.reduce((sum, fee) => sum + fee.paidAmount, 0),
      totalPending: fees.reduce((sum, fee) => sum + (fee.amount - fee.paidAmount), 0),
      statusCounts: {
        pending: fees.filter(fee => fee.status === 'pending').length,
        paid: fees.filter(fee => fee.status === 'paid').length,
        partial: fees.filter(fee => fee.status === 'partial').length
      }
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 