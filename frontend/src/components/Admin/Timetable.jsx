  import React, { useState, useEffect } from 'react';
  import './Timetable.css';

  const Timetable = () => {
    const [timetable, setTimetable] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingCell, setEditingCell] = useState({ day: null, period: null });
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [cellData, setCellData] = useState({ subject: '', teacher: '', startTime: '', endTime: '' });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = ['1', '2', '3', '4', '5', '6', '7', '8'];

    useEffect(() => {
      fetchClasses();
      fetchTeachers();
    }, []);

    useEffect(() => {
      if (selectedClass) {
        setLoading(true);
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

    const handleCellClick = (day, period) => {
      const cell = timetable.find(
        entry =>
          entry.day === day &&
          entry.period === period &&
          entry.classId?.toString() === selectedClass?.toString()
      );
      setEditingCell({ day, period });
      setCellData({
        subject: cell?.subject || '',
        teacher: cell?.teacherId || '',
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
            entry.classId?.toString() === selectedClass?.toString()
        );

        const isNew = !cell || !cell._id;

        const payload = {
          classId: selectedClass,
          day,
          period,
          subject: cellData.subject,
          teacherId: cellData.teacher,
          startTime: cellData.startTime,
          endTime: cellData.endTime
        };

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

        const data = await response.json();
        if (response.ok) {
          setEditingCell({ day: null, period: null });
          fetchTimetable(); // This should reload the latest data
          setError('');
        } else {
          setError(data.message || 'Failed to save timetable entry');
        }
      } catch (error) {
        setError('Failed to save timetable entry. Please try again later.');
      }
    };

    console.log('Timetable:', timetable);
    console.log('Selected class:', selectedClass);

    if (loading && selectedClass) {
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
                      entry.classId?.toString() === selectedClass?.toString()
                  );
                  let teacherName = '';
                  if (cell && cell.teacherId) {
                    const teacher = teachers.find(t => t._id === cell.teacherId);
                    teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : cell.teacherId;
                  }
                  return (
                    <div key={`${day}-${period}`} className="schedule-cell">
                      {editingCell.day === day && editingCell.period === period ? (
                        <>
                          <input
                            type="text"
                            placeholder="Enter Subject"
                            value={cellData.subject}
                            onChange={e => setCellData({ ...cellData, subject: e.target.value })}
                          />
                          <select
                            value={cellData.teacher}
                            onChange={e => setCellData({ ...cellData, teacher: e.target.value })}
                          >
                            <option value="">Select Teacher</option>
                            {teachers.map(t => (
                              <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                            ))}
                          </select>
                          <input
                            type="time"
                            value={cellData.startTime || ''}
                            onChange={e => setCellData({ ...cellData, startTime: e.target.value })}
                            placeholder="Start Time"
                          />
                          <input
                            type="time"
                            value={cellData.endTime || ''}
                            onChange={e => setCellData({ ...cellData, endTime: e.target.value })}
                            placeholder="End Time"
                          />
                          <button onClick={() => handleSave(day, period)}>Save</button>
                          <button onClick={() => setEditingCell({ day: null, period: null })}>Cancel</button>
                        </>
                      ) : (
                        <>
                          {cell ? (
                            <div>
                              <div>{cell.subject}</div>
                              <div>{teacherName}</div>
                              <div>{cell.startTime} - {cell.endTime}</div>
                            </div>
                          ) : (
                            <div className="empty-cell">-</div>
                          )}
                          <button onClick={() => handleCellClick(day, period)}>Edit</button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <pre>{JSON.stringify(timetable, null, 2)}</pre>
      </div>
    );
  };

  export default Timetable; 