import express from 'express';
import Timetable from '../models/Timetable.js';
import School from '../models/School.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get timetable for a specific class
router.get('/:classId', auth, async (req, res) => {
  try {
    // For super admin, don't filter by schoolId
    const query = { classId: req.params.classId };
    if (req.user.role !== 'SUPER_ADMIN') {
      query.schoolId = req.user.schoolId;
    }

    const timetable = await Timetable.find(query).sort({ day: 1, period: 1 });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new timetable entry
router.post('/', auth, async (req, res) => {
  try {
    let schoolId;
    
    if (req.user.role === 'SUPER_ADMIN') {
      // For super admin, use the schoolId from the request body
      if (!req.body.schoolId) {
        return res.status(400).json({ message: 'School ID is required for super admin' });
      }
      const school = await School.findById(req.body.schoolId);
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }
      schoolId = req.body.schoolId;
    } else {
      // For other roles, use their assigned schoolId
      const school = await School.findById(req.user.schoolId);
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }
      schoolId = req.user.schoolId;
    }

    // Check for schedule conflicts
    const existingEntry = await Timetable.findOne({
      schoolId: schoolId,
      classId: req.body.classId,
      day: req.body.day,
      period: req.body.period
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'Schedule conflict: This time slot is already occupied' });
    }

    const newEntry = new Timetable({
      ...req.body,
      schoolId: schoolId
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update timetable entry
router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    // Allow super admin to update any entry, others only their school's entries
    if (req.user.role !== 'SUPER_ADMIN' && entry.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this entry' });
    }

    // Check for schedule conflicts when updating
    if (req.body.day && req.body.period) {
      const existingEntry = await Timetable.findOne({
        schoolId: entry.schoolId,
        classId: entry.classId,
        day: req.body.day,
        period: req.body.period,
        _id: { $ne: req.params.id }
      });

      if (existingEntry) {
        return res.status(400).json({ message: 'Schedule conflict: This time slot is already occupied' });
      }
    }

    const updatedEntry = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete timetable entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    // Allow super admin to delete any entry, others only their school's entries
    if (req.user.role !== 'SUPER_ADMIN' && entry.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    await entry.remove();
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 