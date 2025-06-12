import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'partial'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'cheque'],
    required: function() {
      return this.status === 'paid' || this.status === 'partial';
    }
  },
  receiptNumber: {
    type: String,
    required: function() {
      return this.status === 'paid' || this.status === 'partial';
    }
  },
  remarks: {
    type: String,
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
feeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Fee = mongoose.model('Fee', feeSchema);

export default Fee; 