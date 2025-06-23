import React, { useState, useEffect } from 'react';
import './Classes.css';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    capacity: '',
    teacherId: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
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
      } else {
        setError(data.message || 'Failed to fetch classes');
      }
    } catch (error) {
      setError('Failed to fetch classes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/teachers', {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        teacherId: formData.teacherId || null
      };

      const response = await fetch('http://localhost:5000/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      if (response.ok) {
        setClasses(prev => [...prev, data]);
        setIsModalOpen(false);
        setFormData({
          name: '',
          section: '',
          capacity: '',
          teacherId: '',
          description: ''
        });
      } else {
        setError(data.message || 'Failed to add class');
      }
    } catch (error) {
      setError('Failed to add class. Please try again later.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="loading">Loading classes...</div>;
  }

  return (
    <div className="classes-section">
      <div className="section-header">
        <h2>Classes</h2>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          + Add New Class
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="classes-grid">
        {classes.map((classItem) => (
          <div key={classItem._id} className="class-card">
            <h3>{classItem.name}</h3>
            <p className="section">Section: {classItem.section}</p>
            <p className="capacity">Capacity: {classItem.capacity}</p>
            <p className="teacher">Teacher: {classItem.teacherId ? `${classItem.teacherId.firstName} ${classItem.teacherId.lastName}` : 'Not Assigned'}</p>
            <p className="description">{classItem.description}</p>
            <div className="class-actions">
              <button className="edit-button">Edit</button>
              <button className="delete-button">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Class</h2>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="add-class-form">
              <div className="form-group">
                <label htmlFor="name">Class Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="section">Section</label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="teacherId">Class Teacher (Optional)</label>
                <select
                  id="teacherId"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                >
                  <option value="">No Teacher Assigned</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes; 