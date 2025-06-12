import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import School from '../models/School.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function createInitialData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create School
    const school = new School({
      name: 'DEV',
      schoolId: '80',
      address: 'Demo Address',
      contactEmail: 'dev@school.com',
      contactPhone: '1234567890',
      isActive: true
    });

    await school.save();
    console.log('School created successfully');

    // Create SuperAdmin
    const superAdmin = new User({
      userId: '121',
      schoolId: school._id,
      email: 'aditya@admin.com',
      password: '1138',
      role: 'SUPER_ADMIN',
      firstName: 'Aditya',
      lastName: 'Admin',
      isActive: true
    });

    await superAdmin.save();
    console.log('SuperAdmin created successfully');

    console.log('Initial data setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating initial data:', error);
    process.exit(1);
  }
}

createInitialData(); 