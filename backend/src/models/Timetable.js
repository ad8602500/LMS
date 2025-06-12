import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  period: {
    type: Number,
    required: true,
    min: 1
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
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
timetableSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index to prevent schedule conflicts
timetableSchema.index(
  { schoolId: 1, classId: 1, day: 1, period: 1 },
  { unique: true }
);

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable; 