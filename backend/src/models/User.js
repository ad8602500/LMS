import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'],
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: function() {
      return this.role !== 'SUPER_ADMIN';
    }
  },
  // Teacher-specific fields (optional, required if role is TEACHER)
  subject: {
    type: String,
    trim: true,
    required: function() { return this.role === 'TEACHER'; }
  },
  qualification: {
    type: String,
    trim: true,
    required: function() { return this.role === 'TEACHER'; }
  },
  joiningDate: {
    type: Date,
    required: function() { return this.role === 'TEACHER'; }
  },
  image: {
    type: String,
    default: null
  },
  // Student-specific fields (optional, required if role is STUDENT)
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: function() { return this.role === 'STUDENT'; }
  },
  section: {
    type: String,
    trim: true,
    required: function() { return this.role === 'STUDENT'; }
  },
  rollNo: {
    type: String,
    trim: true,
    unique: function() { return this.role === 'STUDENT'; },
    sparse: true, // Allows null values if not unique for other roles
    required: function() { return this.role === 'STUDENT'; }
  },
  admissionNo: {
    type: String,
    trim: true,
    unique: function() { return this.role === 'STUDENT'; },
    sparse: true, // Allows null values if not unique for other roles
    required: function() { return this.role === 'STUDENT'; }
  },
  parentName: {
    type: String,
    trim: true,
    required: function() { return this.role === 'STUDENT'; }
  },
  parentPhone: {
    type: String,
    trim: true,
    required: function() { return this.role === 'STUDENT'; }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Teacher profile fields (editable only once)
  permanentAddress: {
    type: String,
    trim: true
  },
  currentAddress: {
    type: String,
    trim: true
  },
  aadharNumber: {
    type: String,
    trim: true
  },
  panNumber: {
    type: String,
    trim: true
  },
  motherName: {
    type: String,
    trim: true
  },
  fatherName: {
    type: String,
    trim: true
  },
  bankAccountNumber: {
    type: String,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true
  },
  // Optional extra fields
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed']
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  emergencyContactNumber: {
    type: String,
    trim: true
  },
  emailId: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    trim: true
  },
  // Lock profile after submission
  profileFinalized: {
    type: Boolean,
    default: false
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 