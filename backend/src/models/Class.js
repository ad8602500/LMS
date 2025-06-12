import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  description: {
    type: String,
    trim: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
classSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Class = mongoose.model('Class', classSchema);

export default Class; 