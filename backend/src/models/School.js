import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  schoolId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  adminEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  adminPassword: {
    type: String,
    required: true
  },
  adminFirstName: {
    type: String,
    required: true,
    trim: true
  },
  adminLastName: {
    type: String,
    required: true,
    trim: true
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
schoolSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const School = mongoose.model('School', schoolSchema);
export default School; 