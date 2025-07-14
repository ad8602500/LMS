import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  address1: { type: String, trim: true },
  address2: { type: String, trim: true },
  city: { type: String, trim: true },
  district: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true }
}, { _id: false });

const payingGuestAddressSchema = new mongoose.Schema({
  hno: { type: String, trim: true },
  colony: { type: String, trim: true },
  city: { type: String, trim: true },
  district: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true }
}, { _id: false });

const studentInfoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  permanentAddress: addressSchema,
  correspondingAddress: addressSchema,
  payingGuestAddress: payingGuestAddressSchema,
  // Extra personal info fields
  dob: { type: String },
  gender: { type: String },
  category: { type: String },
  emergencyContact: { type: String },
  motherName: { type: String },
  motherMobile: { type: String },
  fatherMobile: { type: String },
  landline: { type: String },
  fatherEmail: { type: String },
  lpuEmail: { type: String },
  photo: { type: String },
  finalized: { type: Boolean, default: false }
}, { timestamps: true });

const StudentInfo = mongoose.model('StudentInfo', studentInfoSchema);
export default StudentInfo;
