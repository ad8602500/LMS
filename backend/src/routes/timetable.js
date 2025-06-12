import express from 'express';
import Timetable from '../models/Timetable.js';
import School from '../models/School.js';

const router = express.Router();

// Get timetable for a specific class
router.get('/:classId', async (req, res) => {
  try {
    const timetable = await Timetable.find({
      schoolId: req.user.schoolId,
      classId: req.params.classId
    }).sort({ day: 1, period: 1 });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new timetable entry
router.post('/', async (req, res) => {
  try {
    const school = await School.findById(req.user.schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check for schedule conflicts
    const existingEntry = await Timetable.findOne({
      schoolId: req.user.schoolId,
      classId: req.body.classId,
      day: req.body.day,
      period: req.body.period
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'Schedule conflict: This time slot is already occupied' });
    }

    const newEntry = new Timetable({
      ...req.body,
      schoolId: req.user.schoolId
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update timetable entry
router.put('/:id', async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    if (entry.schoolId.toString() !== req.user.schoolId) {
      return res.status(403).json({ message: 'Not authorized to update this entry' });
    }

    // Check for schedule conflicts when updating
    if (req.body.day && req.body.period) {
      const existingEntry = await Timetable.findOne({
        schoolId: req.user.schoolId,
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
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    if (entry.schoolId.toString() !== req.user.schoolId) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    await entry.remove();
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 