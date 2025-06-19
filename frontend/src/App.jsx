import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import Teachers from './components/Admin/Teachers';
import Students from './components/Admin/Students';
import Classes from './components/Admin/Classes';
import Attendance from './components/Admin/Attendance';
import Fees from './components/Admin/Fees';
import SuperAdminDashboard from './components/SuperAdmin/Dashboard';
import TeacherLayout from './components/Teacher/TeacherLayout';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import StudentLayout from './components/Student/StudentLayout';
import Courses from './components/Teacher/Courses';
import Assignments from './components/Teacher/Assignments';
import Schedule from './components/Teacher/Schedule';
import Communication from './components/Teacher/Communication';
import Reports from './components/Teacher/Reports';
import Profile from './components/Teacher/Profile';
import Timetable from './components/Admin/Timetable';
import './App.css';
import { useState } from 'react';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.map(role => role.toUpperCase()).includes(user.role?.toUpperCase())) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const theme = createTheme({
  // You can customize your theme here
  palette: {
    primary: {
      main: '#ff9800', // Orange to match your current design
    },
    secondary: {
      main: '#007bff', // Blue for buttons
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const App = () => {
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const handleClassClick = async (classId) => {
    setSelectedClassId(classId);
    setLoadingStudents(true);
    setStudents([]);
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/classes/${classId}/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setStudents(data);
    setLoadingStudents(false);
  };

  return (
    <SnackbarProvider maxSnack={3}>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="students" element={<Students />} />
              <Route path="classes" element={<Classes />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="fees" element={<Fees />} />
              <Route path="timetable" element={<Timetable />} />
            </Route>

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <TeacherLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="students" element={<Students />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="communication" element={<Communication />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="dashboard" element={<StudentDashboard />} />
            </Route>

            {/* Super Admin Routes */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </SnackbarProvider>
  );
};

export default App;
