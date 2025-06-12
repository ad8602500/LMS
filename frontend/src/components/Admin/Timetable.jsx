import React, { useState, useEffect } from 'react';
import './Timetable.css';

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    day: '',
    period: '',
    subject: '',
    teacher: '',
    startTime: '',
    endTime: '',
    room: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = ['1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    if (selectedClass) {
      fetchTimetable();
    }
  }, [selectedClass]);

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

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/timetable/${selectedClass}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTimetable(data);
      } else {
        setError(data.message || 'Failed to fetch timetable');
      }
    } catch (error) {
      setError('Failed to fetch timetable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          classId: selectedClass
        })
      });

      const data = await response.json();
      if (response.ok) {
        setTimetable(prev => [...prev, data]);
        setIsModalOpen(false);
        setFormData({
          day: '',
          period: '',
          subject: '',
          teacher: '',
          startTime: '',
          endTime: '',
          room: ''
        });
      } else {
        setError(data.message || 'Failed to add timetable entry');
      }
    } catch (error) {
      setError('Failed to add timetable entry. Please try again later.');
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
    return <div className="loading">Loading timetable...</div>;
  }

  return (
    <div className="timetable-section">
      <div className="section-header">
        <h2>Timetable</h2>
        <div className="header-actions">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="class-select"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>
                {cls.name} - {cls.section}
              </option>
            ))}
          </select>
          <button 
            className="add-button" 
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedClass}
          >
            + Add Schedule
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {selectedClass && (
        <div className="timetable-grid">
          <div className="timetable-header">
            <div className="header-cell">Period</div>
            {days.map(day => (
              <div key={day} className="header-cell">{day}</div>
            ))}
          </div>
          {periods.map(period => (
            <div key={period} className="timetable-row">
              <div className="period-cell">{period}</div>
              {days.map(day => {
                const entry = timetable.find(
                  t => t.day === day && t.period === period
                );
                return (
                  <div key={`${day}-${period}`} className="schedule-cell">
                    {entry ? (
                      <div className="schedule-entry">
                        <div className="subject">{entry.subject}</div>
                        <div className="teacher">{entry.teacher}</div>
                        <div className="time">{entry.startTime} - {entry.endTime}</div>
                        <div className="room">Room: {entry.room}</div>
                      </div>
                    ) : (
                      <div className="empty-cell">-</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Schedule</h2>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="add-schedule-form">
              <div className="form-group">
                <label htmlFor="day">Day</label>
                <select
                  id="day"
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Day</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="period">Period</label>
                <select
                  id="period"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Period</option>
                  {periods.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="teacher">Teacher</label>
                <select
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="room">Room</label>
                <input
                  type="text"
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable; 