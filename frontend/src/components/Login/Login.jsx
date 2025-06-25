import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('school'); // 'super' or 'school'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolId: '',
    userId: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form data
    if (loginType === 'school' && !formData.schoolId.trim()) {
      setError('School ID is required');
      setLoading(false);
      return;
    }
    if (!formData.userId.trim()) {
      setError('User ID or Email is required');
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      let loginData;
      if (loginType === 'super') {
        loginData = {
          userId: formData.userId.trim(),
          password: formData.password
        };
      } else {
        loginData = {
          schoolId: formData.schoolId.trim(),
          userId: formData.userId.trim(),
          password: formData.password
        };
      }

      console.log('Attempting login with:', { ...loginData, password: '***' });

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      
      if (response.ok) {
        const userData = {
          ...data.user,
          role: data.user.role
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect based on role
        const role = userData.role?.toLowerCase();
        console.log('Login successful, redirecting to:', role);
        
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'teacher':
            navigate('/teacher/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'super_admin':
            navigate('/super-admin/dashboard');
            break;
          default:
            setError('Unknown user role.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
      } else {
        console.error('Login failed:', data);
        setError(data.details || data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <button
            type="button"
            className={loginType === 'super' ? 'active' : ''}
            onClick={() => {
              setLoginType('super');
              setFormData(prev => ({ ...prev, schoolId: '' }));
              setError('');
            }}
            style={{ flex: 1, padding: 8, background: loginType === 'super' ? '#1976d2' : '#eee', color: loginType === 'super' ? '#fff' : '#333', border: 'none', borderRadius: '4px 0 0 4px' }}
          >
            Super Admin
          </button>
          <button
            type="button"
            className={loginType === 'school' ? 'active' : ''}
            onClick={() => {
              setLoginType('school');
              setError('');
            }}
            style={{ flex: 1, padding: 8, background: loginType === 'school' ? '#1976d2' : '#eee', color: loginType === 'school' ? '#fff' : '#333', border: 'none', borderRadius: '0 4px 4px 0' }}
          >
            School User
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          {loginType === 'school' && (
            <div className="form-group">
              <label htmlFor="schoolId">School ID</label>
              <input
                type="text"
                id="schoolId"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleInputChange}
                required={loginType === 'school'}
                placeholder="Enter School ID"
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="userId">User ID or Email</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              required
              placeholder="Enter User ID or Email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter Password"
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 