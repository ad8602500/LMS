import React, { useState, useEffect } from 'react';
import './Teachers.css';
import AddUserForm from './AddUserForm';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newTeacherCredentials, setNewTeacherCredentials] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    qualification: '',
    joiningDate: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://lms-ul7x.onrender.com/api/admin/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTeachers(data);
      } else {
        setError(data.message || 'Failed to fetch teachers');
      }
    } catch (error) {
      setError('Failed to fetch teachers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://lms-ul7x.onrender.com/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (response.ok) {
        setTeachers(prevTeachers => [...prevTeachers, data.teacher]);
        setShowAddModal(false);
        // Store credentials and show credentials modal
        setNewTeacherCredentials({
          email: data.teacher.email,
          userId: data.credentials.userId,
          password: data.credentials.password
        });
        setShowCredentialsModal(true);
        // Refresh the teachers list to ensure we have the latest data
        fetchTeachers();
      } else {
        throw new Error(data.message || 'Failed to add teacher');
      }
    } catch (error) {
      setError(error.message || 'Failed to add teacher. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://lms-ul7x.onrender.com/api/admin/teachers/${selectedTeacher._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setTeachers(teachers.map(teacher => 
          teacher._id === selectedTeacher._id ? data : teacher
        ));
        setShowEditModal(false);
        setSelectedTeacher(null);
      } else {
        setError(data.message || 'Failed to update teacher');
      }
    } catch (error) {
      setError('Failed to update teacher. Please try again later.');
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://lms-ul7x.onrender.com/api/admin/teachers/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setTeachers(teachers.filter(teacher => teacher._id !== teacherId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete teacher');
      }
    } catch (error) {
      setError('Failed to delete teacher. Please try again later.');
    }
  };

  if (loading) {
    return <div className="loading">Loading teachers...</div>;
  }

  return (
    <div className="teachers-section">
      <div className="section-header">
        <h2>Teachers</h2>
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          + Add New Teacher
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="teachers-list">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Qualification</th>
              <th>Joining Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher._id}>
                <td>{`${teacher.firstName} ${teacher.lastName}`}</td>
                <td>{teacher.email}</td>
                <td>{teacher.phone}</td>
                <td>{teacher.subject}</td>
                <td>{teacher.qualification}</td>
                <td>{new Date(teacher.joiningDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className="action-button edit-button"
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setFormData(teacher);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDeleteTeacher(teacher._id)}
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
        onSubmit={handleAddTeacher}
        loading={loading}
        userType="teacher"
      />

      {/* Edit Teacher Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Teacher</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditTeacher}>
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
                <label>Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Qualification</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="edit-button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="add-button">
                  Update Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && newTeacherCredentials && (
        <div className="modal-overlay">
          <div className="modal-content credentials-modal">
            <div className="modal-header">
              <h2>Teacher Account Created Successfully</h2>
              <button className="modal-close" onClick={() => setShowCredentialsModal(false)}>&times;</button>
            </div>
            <div className="credentials-content">
              <p>Please save these credentials. They have also been sent to the teacher's email.</p>
              <div className="credentials-details">
                <div className="credential-item">
                  <strong>Email:</strong>
                  <span>{newTeacherCredentials.email}</span>
                </div>
                <div className="credential-item">
                  <strong>User ID:</strong>
                  <span>{newTeacherCredentials.userId}</span>
                </div>
                <div className="credential-item">
                  <strong>Password:</strong>
                  <span>{newTeacherCredentials.password}</span>
                </div>
              </div>
              <div className="credentials-warning">
                <p>⚠️ Please make sure to save these credentials. They cannot be retrieved later.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="add-button"
                onClick={() => {
                  // Copy credentials to clipboard
                  const text = `Email: ${newTeacherCredentials.email}\nUser ID: ${newTeacherCredentials.userId}\nPassword: ${newTeacherCredentials.password}`;
                  navigator.clipboard.writeText(text);
                  alert('Credentials copied to clipboard!');
                }}
              >
                Copy Credentials
              </button>
              <button 
                className="edit-button"
                onClick={() => setShowCredentialsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers; 