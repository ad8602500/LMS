import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create uploads directories if they don't exist
const uploadDirs = ['uploads', 'uploads/teachers', 'uploads/students'];
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 