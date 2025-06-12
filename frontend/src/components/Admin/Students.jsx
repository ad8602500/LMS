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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    grade: '',
    rollNumber: '',
    admissionDate: ''
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
      }
    } catch (error) {
      setError('Failed to fetch students. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (formData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.schoolId) {
        enqueueSnackbar('School ID not found. Please log in again.', { variant: 'error' });
        return;
      }

      const response = await axios.post('http://localhost:5000/api/admin/students', {
        ...formData,
        schoolId: user.schoolId
      });

      if (response.data) {
        enqueueSnackbar('Student added successfully', { variant: 'success' });
        fetchStudents();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error adding student', { variant: 'error' });
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/students/${selectedStudent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setStudents(students.map(student => 
          student._id === selectedStudent._id ? data : student
        ));
        setShowEditModal(false);
        setSelectedStudent(null);
      } else {
        setError(data.message || 'Failed to update student');
      }
    } catch (error) {
      setError('Failed to update student. Please try again later.');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setStudents(students.filter(student => student._id !== studentId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete student');
      }
    } catch (error) {
      setError('Failed to delete student. Please try again later.');
    }
  };

  const filteredStudents = students.filter(student => {
    if (selectedClass && student.class !== selectedClass) return false;
    if (selectedSection && student.section !== selectedSection) return false;
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
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
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
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">All Sections</option>
            {sections.map(section => (
              <option key={section._id} value={section.name}>{section.name}</option>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student._id}>
                <td>{`${student.firstName} ${student.lastName}`}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.class}</td>
                <td>{student.section}</td>
                <td>{student.rollNo}</td>
                <td>
                  <button
                    className="action-button edit-button"
                    onClick={() => {
                      setSelectedStudent(student);
                      setFormData(student);
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
      />

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditStudent}>
              {/* Same form fields as Add Student Modal */}
              <div className="form-row">
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
              </div>

              <div className="form-row">
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Class</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    required
                  >
                    <option value="">Select Section</option>
                    {sections.map(section => (
                      <option key={section._id} value={section.name}>{section.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Admission Number</label>
                  <input
                    type="text"
                    value={formData.admissionNumber}
                    onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>

              <h3>Parent Information</h3>
              <div className="form-row">
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
              </div>

              <div className="form-group">
                <label>Parent Email</label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                  required
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
    </div>
  );
};

export default Students; 