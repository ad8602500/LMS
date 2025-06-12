import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
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
import './App.css';

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

const App = () => {
  return (
    <SnackbarProvider maxSnack={3}>
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
    </SnackbarProvider>
  );
};

export default App;
