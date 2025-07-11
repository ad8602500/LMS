import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import schoolRoutes from './routes/school.js';
import userRoutes from './routes/user.js';
import superAdminRoutes from './routes/superAdmin.js';
import teacherRoutes from './routes/teacher.js';
import studentRoutes from './routes/student.js';
import classRoutes from './routes/class.js';
import timetableRoutes from './routes/timetable.js';
import adminRoutes from './routes/admin.js';
import teacherDashboardRoutes from './routes/teacherDashboard.js';
import attendanceRoutes from './routes/attendance.js';
import feesRoutes from './routes/fees.js';
import jwt from 'jsonwebtoken';
import Timetable from './models/Timetable.js';
import { auth, checkRole } from './middleware/auth.js';
import messageRoutes from './routes/message.js';
import assignmentRoutes from './routes/assignment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,               // allow cookies/auth headers
}));

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // or your local frontend port
  'https://lms-of1h.vercel.app'
];

// Add cookie parser BEFORE cors middleware
app.use(cookieParser());


// Configure CORS with specific options



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create uploads directories if they don't exist
const uploadDirs = ['uploads', 'uploads/teachers', 'uploads/students', 'uploads/assignments', 'uploads/submissions'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/admin/teachers', teacherRoutes);
app.use('/api/admin/students', studentRoutes);
app.use('/api/admin/classes', classRoutes);
app.use('/api/admin/timetable', timetableRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacherDashboard', teacherDashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/assignment', assignmentRoutes);


// Add this to your index.js for testing
app.get('/api/test-auth', (req, res) => {
  console.log('Cookies received:', req.cookies);
  res.json({ 
    cookies: req.cookies,
    token: req.cookies.token ? 'present' : 'missing'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 