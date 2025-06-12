import mongoose from 'mongoose';
import dotenv from 'dotenv';
import School from '../models/School.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (existingSuperAdmin) {
      console.log('Super Admin already exists');
      return existingSuperAdmin;
    }

    // Create super admin
    const superAdmin = new User({
      userId: 'SUPER_ADMIN_001',
      schoolId: null, // Super admin is not associated with any specific school
      email: 'superadmin@lms.com',
      password: 'superadmin123', // This will be hashed by the pre-save hook
      role: 'SUPER_ADMIN',
      firstName: 'Super',
      lastName: 'Admin'
    });

    await superAdmin.save();
    console.log('Super Admin created successfully');
    return superAdmin;
  } catch (error) {
    console.error('Error creating super admin:', error);
    throw error;
  }
};

const createSchoolWithAdmin = async (schoolData) => {
  try {
    // Create school
    const school = new School({
      name: schoolData.name,
      schoolId: schoolData.schoolId,
      address: schoolData.address,
      contactEmail: schoolData.contactEmail,
      contactPhone: schoolData.contactPhone
    });
    await school.save();
    console.log(`School ${schoolData.name} created successfully`);

    // Create school admin
    const admin = new User({
      userId: `ADMIN_${schoolData.schoolId}`,
      schoolId: school._id,
      email: schoolData.adminEmail,
      password: schoolData.adminPassword,
      role: 'ADMIN',
      firstName: schoolData.adminFirstName,
      lastName: schoolData.adminLastName
    });
    await admin.save();
    console.log(`Admin for ${schoolData.name} created successfully`);

    return { school, admin };
  } catch (error) {
    console.error('Error creating school and admin:', error);
    throw error;
  }
};

const createTeacher = async (teacherData, schoolId) => {
  try {
    const teacher = new User({
      userId: `TCH_${teacherData.userId}`,
      schoolId,
      email: teacherData.email,
      password: teacherData.password,
      role: 'TEACHER',
      firstName: teacherData.firstName,
      lastName: teacherData.lastName
    });
    await teacher.save();
    console.log(`Teacher ${teacherData.firstName} ${teacherData.lastName} created successfully`);
    return teacher;
  } catch (error) {
    console.error('Error creating teacher:', error);
    throw error;
  }
};

const createStudent = async (studentData, schoolId) => {
  try {
    const student = new User({
      userId: `STU_${studentData.userId}`,
      schoolId,
      email: studentData.email,
      password: studentData.password,
      role: 'STUDENT',
      firstName: studentData.firstName,
      lastName: studentData.lastName
    });
    await student.save();
    console.log(`Student ${studentData.firstName} ${studentData.lastName} created successfully`);
    return student;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create Super Admin
    const superAdmin = await createSuperAdmin();

    // Create first school with admin
    const school1 = await createSchoolWithAdmin({
      name: 'Example High School',
      schoolId: 'SCH001',
      address: '123 Education St, City',
      contactEmail: 'contact@examplehigh.edu',
      contactPhone: '123-456-7890',
      adminEmail: 'admin@examplehigh.edu',
      adminPassword: 'admin123',
      adminFirstName: 'John',
      adminLastName: 'Smith'
    });

    // Create teachers for the school
    const teachers = await Promise.all([
      createTeacher({
        userId: 'T001',
        email: 'teacher1@examplehigh.edu',
        password: 'teacher123',
        firstName: 'Sarah',
        lastName: 'Johnson'
      }, school1.school._id),
      createTeacher({
        userId: 'T002',
        email: 'teacher2@examplehigh.edu',
        password: 'teacher123',
        firstName: 'Michael',
        lastName: 'Brown'
      }, school1.school._id)
    ]);

    // Create students for the school
    const students = await Promise.all([
      createStudent({
        userId: 'S001',
        email: 'student1@examplehigh.edu',
        password: 'student123',
        firstName: 'Emma',
        lastName: 'Wilson'
      }, school1.school._id),
      createStudent({
        userId: 'S002',
        email: 'student2@examplehigh.edu',
        password: 'student123',
        firstName: 'James',
        lastName: 'Davis'
      }, school1.school._id)
    ]);

    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 