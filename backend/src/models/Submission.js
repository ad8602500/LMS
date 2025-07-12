import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  marks: {
    type: Number,
    min: 0,
    default: null
  },
  remarks: {
    type: String,
    trim: true,
    default: null
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

submissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;