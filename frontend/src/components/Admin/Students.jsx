import React, { useState, useEffect } from 'react';
import './Students.css';
import AddUserForm from './AddUserForm';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newStudentCredentials, setNewStudentCredentials] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    classId: '',
    section: '',
    rollNo: '',
    admissionNo: '',
    parentName: '',
    parentPhone: '',
    image: null
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchClasses();
    fetchSections();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setClasses(data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      enqueueSnackbar('Failed to load classes.', { variant: 'error' });
    }
  };

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/sections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSections(data);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      } else {
        setError(data.message || 'Failed to fetch students');
        enqueueSnackbar(data.message || 'Failed to fetch students', { variant: 'error' });
      }
    } catch (error) {
      setError('Failed to fetch students. Please try again later.');
      enqueueSnackbar('Failed to fetch students. Please try again later.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (formDataToSend) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/admin/students', 
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        enqueueSnackbar('Student added successfully', { variant: 'success' });
        fetchStudents();
        setShowAddModal(false);
        setNewStudentCredentials({
          email: response.data.student.email,
          userId: response.data.credentials.userId,
          password: response.data.credentials.password
        });
        setShowCredentialsModal(true);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error adding student', { variant: 'error' });
      throw error;
    }
  };

  const handleEditStudent = async (formDataToSend) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/admin/students/${selectedStudent._id}`, 
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data) {
        enqueueSnackbar('Student updated successfully', { variant: 'success' });
        fetchStudents();
        setShowEditModal(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to update student', { variant: 'error' });
      throw error;
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/admin/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        enqueueSnackbar('Student deleted successfully', { variant: 'success' });
        setStudents(students.filter(student => student._id !== studentId));
      } else {
        const data = response.data;
        enqueueSnackbar(data.message || 'Failed to delete student', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      enqueueSnackbar('Failed to delete student. Please try again later.', { variant: 'error' });
    }
  };

  const filteredStudents = students.filter(student => {
    const studentClass = classes.find(cls => cls._id === student.classId);
    const studentClassName = studentClass ? studentClass.name : '';
    const studentSectionName = studentClass ? studentClass.section : '';

    if (selectedClassFilter && studentClassName !== selectedClassFilter) return false;
    if (selectedSectionFilter && studentSectionName !== selectedSectionFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="students-section">
      <div className="section-header">
        <h2>Students</h2>
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          + Add New Student
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <div className="filter-group">
          <label>Class:</label>
          <select 
            value={selectedClassFilter} 
            onChange={(e) => setSelectedClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls.name}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Section:</label>
          <select 
            value={selectedSectionFilter} 
            onChange={(e) => setSelectedSectionFilter(e.target.value)}
          >
            <option value="">All Sections</option>
            {Array.from(new Set(classes.map(cls => cls.section))).map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="students-list">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Class</th>
              <th>Section</th>
              <th>Roll Number</th>
              <th>Admission Number</th>
              <th>Parent Name</th>
              <th>Parent Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student._id}>
                <td>{`${student.firstName} ${student.lastName}`}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{classes.find(cls => cls._id === student.classId)?.name || 'N/A'}</td>
                <td>{student.section}</td>
                <td>{student.rollNo}</td>
                <td>{student.admissionNo}</td>
                <td>{student.parentName}</td>
                <td>{student.parentPhone}</td>
                <td>
                  <button
                    className="action-button edit-button"
                    onClick={() => {
                      setSelectedStudent(student);
                      setFormData({
                        firstName: student.firstName,
                        lastName: student.lastName,
                        email: student.email,
                        phone: student.phone,
                        classId: student.classId || '',
                        section: student.section || '',
                        rollNo: student.rollNo || '',
                        admissionNo: student.admissionNo || '',
                        parentName: student.parentName || '',
                        parentPhone: student.parentPhone || '',
                        image: null
                      });
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDeleteStudent(student._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStudent}
        loading={loading}
        userType="student"
        classes={classes}
      />

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <form onSubmit={() => handleEditStudent(formData)}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="classId">Class</label>
                <select
                  id="classId"
                  name="classId"
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name} - {cls.section}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Admission Number</label>
                <input
                  type="text"
                  value={formData.admissionNo}
                  onChange={(e) => setFormData({...formData, admissionNo: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Parent Name</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Parent Phone</label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Profile Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="edit-button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="add-button">
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCredentialsModal && newStudentCredentials && (
        <div className="modal-overlay">
          <div className="modal-content credentials-modal">
            <div className="modal-header">
              <h2>Student Account Created Successfully</h2>
              <button className="modal-close" onClick={() => setShowCredentialsModal(false)}>&times;</button>
            </div>
            <div className="credentials-content">
              <p>Please save these credentials. You may wish to provide them to the student/parent.</p>
              <div className="credentials-details">
                <div className="credential-item">
                  <strong>Email:</strong>
                  <span>{newStudentCredentials.email}</span>
                </div>
                <div className="credential-item">
                  <strong>User ID:</strong>
                  <span>{newStudentCredentials.userId}</span>
                </div>
                <div className="credential-item">
                  <strong>Password:</strong>
                  <span>{newStudentCredentials.password}</span>
                </div>
              </div>
              <div className="credentials-warning">
                <p>⚠️ Please make sure to save these credentials. They cannot be retrieved later.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students; 