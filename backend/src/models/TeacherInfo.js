import mongoose from 'mongoose';

const teacherInfoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Only required/optional info, no personal info
  // Required Info
  permanentAddress: { type: String, trim: true, required: true },
  currentAddress: { type: String, trim: true, required: true },
  aadharNumber: { type: String, trim: true, required: true },
  panNumber: { type: String, trim: true, required: true },
  motherName: { type: String, trim: true, required: true },
  fatherName: { type: String, trim: true, required: true },
  bankAccountNumber: { type: String, trim: true, required: true },
  ifscCode: { type: String, trim: true, required: true },
  // Optional Info
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
  mobileNumber: { type: String, trim: true },
  emergencyContactNumber: { type: String, trim: true },
  emailId: { type: String, trim: true },
  bloodGroup: { type: String, trim: true },
  finalized: { type: Boolean, default: false }
}, { timestamps: true });

const TeacherInfo = mongoose.model('TeacherInfo', teacherInfoSchema);
export default TeacherInfo;
