import React, { useState, useEffect } from 'react';
import './Timetable.css';

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(() => {
    return localStorage.getItem('selectedClass') || '';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCell, setEditingCell] = useState({ day: null, period: null });
  const [cellData, setCellData] = useState({ subject: '', teacher: '', startTime: '', endTime: '' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchClasses(),
          fetchTeachers()
        ]);

        // If there's a selected class in localStorage, fetch its timetable
        const savedClass = localStorage.getItem('selectedClass');
        if (savedClass) {
          await fetchTimetable(savedClass);
        }
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to load initial data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Fetch timetable when selected class changes
  useEffect(() => {
    if (selectedClass) {
      localStorage.setItem('selectedClass', selectedClass);
      fetchTimetable(selectedClass);
    } else {
      setTimetable([]); // Clear timetable if no class is selected
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
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      setClasses(data);
      return data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes. Please try again later.');
      throw error;
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
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      const data = await response.json();
      setTeachers(data);
      return data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to fetch teachers. Please try again later.');
      throw error;
    }
  };

  const fetchTimetable = async (classId = selectedClass) => {
    if (!classId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/timetable/${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch timetable');
      }
      const data = await response.json();
      console.log('Fetched timetable data:', data);
      setTimetable(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError('Failed to fetch timetable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (day, period) => {
    console.log('Handling cell click:', { day, period, selectedClass });
    const cell = timetable.find(
      entry =>
        entry.day === day &&
        entry.period === period &&
        entry.classId?._id?.toString() === selectedClass?.toString()
    );
    console.log('Found cell:', cell);
    setEditingCell({ day, period });
    setCellData({
      subject: cell?.subject || '',
      teacher: cell?.teacherId?._id || '',
      startTime: cell?.startTime || '',
      endTime: cell?.endTime || ''
    });
  };

  const handleSave = async (day, period) => {
    try {
      const token = localStorage.getItem('token');
      const cell = timetable.find(
        entry =>
          entry.day === day &&
          entry.period === period &&
          entry.classId?._id?.toString() === selectedClass?.toString()
      );

      const isNew = !cell;

      const payload = {
        classId: selectedClass,
        day,
        period,
        subject: cellData.subject,
        teacherId: cellData.teacher,
        startTime: cellData.startTime,
        endTime: cellData.endTime
      };

      console.log('Saving timetable entry:', payload);

      let response;
      if (isNew) {
        response = await fetch('http://localhost:5000/api/admin/timetable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`http://localhost:5000/api/admin/timetable/${cell._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save timetable entry');
      }

      const savedData = await response.json();
      
      // Update the local state with the saved data
      if (isNew) {
        setTimetable(prev => [...prev, savedData]);
      } else {
        setTimetable(prev => prev.map(entry => 
          entry._id === cell._id ? savedData : entry
        ));
      }

      setEditingCell({ day: null, period: null });
      setError('');

      // Add a small delay before refreshing to ensure the server has processed the save
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error('Save error:', error);
      setError(error.message || 'Failed to save timetable entry. Please try again later.');
    }
  };

  if (loading && !timetable.length) {
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
                const cell = timetable.find(
                  entry =>
                    entry.day === day &&
                    entry.period === period &&
                    entry.classId?._id?.toString() === selectedClass?.toString()
                );
                return (
                  <div key={`${day}-${period}`} className="schedule-cell">
                    {cell ? (
                      <div className="cell-content" data-subject={cell.subject.toLowerCase()}>
                        <div className="subject">{cell.subject}</div>
                        <div className="teacher">
                          {cell.teacherId?.firstName} {cell.teacherId?.lastName}
                        </div>
                        <div className="time">{cell.startTime} - {cell.endTime}</div>
                      </div>
                    ) : (
                      <div className="empty-cell">No class scheduled</div>
                    )}
                    <button className="edit-button" onClick={() => handleCellClick(day, period)}>
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {editingCell.day && editingCell.period && (
        <div className="edit-form">
          <h3>Edit Schedule</h3>
          <input
            type="text"
            placeholder="Subject"
            value={cellData.subject}
            onChange={(e) => setCellData({ ...cellData, subject: e.target.value })}
          />
          <select
            value={cellData.teacher}
            onChange={(e) => setCellData({ ...cellData, teacher: e.target.value })}
          >
            <option value="">Select Teacher</option>
            {teachers.map(teacher => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={cellData.startTime}
            onChange={(e) => setCellData({ ...cellData, startTime: e.target.value })}
          />
          <input
            type="time"
            value={cellData.endTime}
            onChange={(e) => setCellData({ ...cellData, endTime: e.target.value })}
          />
          <div className="button-group">
            <button className="save" onClick={() => handleSave(editingCell.day, editingCell.period)}>
              Save
            </button>
            <button className="cancel" onClick={() => setEditingCell({ day: null, period: null })}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable; 