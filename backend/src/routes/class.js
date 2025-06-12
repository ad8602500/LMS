import express from 'express';
import Class from '../models/Class.js';
import School from '../models/School.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all classes for a school
router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.user.schoolId });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new class
router.post('/', auth, async (req, res) => {
  try {
    const school = await School.findById(req.user.schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const newClass = new Class({
      ...req.body,
      schoolId: req.user.schoolId
    });

    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update class
router.put('/:id', async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classDoc.schoolId.toString() !== req.user.schoolId) {
      return res.status(403).json({ message: 'Not authorized to update this class' });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classDoc.schoolId.toString() !== req.user.schoolId) {
      return res.status(403).json({ message: 'Not authorized to delete this class' });
    }

    await classDoc.remove();
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 