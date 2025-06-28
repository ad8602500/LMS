import React, { useEffect, useState } from 'react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        setError('');
        const user = JSON.parse(localStorage.getItem('user'));
        const classId = user?.classId;
        const token = localStorage.getItem('token');
        if (!classId) {
          setError('Class information not found.');
          setLoading(false);
          return;
        }
        const response = await fetch(`http://localhost:5000/api/admin/timetable/${classId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch timetable');
        }
        const data = await response.json();
        setTimetable(data);
      } catch (err) {
        setError(err.message || 'Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  // Helper to get cell data
  const getCell = (day, period) =>
    timetable.find(entry => entry.day === day && entry.period === period);

  if (loading) return <div>Loading timetable...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="student-timetable-section" style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: 20 }}>My Timetable</h2>
      <div className="student-timetable-grid" style={{ border: '1px solid #e1e4e8', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
        <div className="student-timetable-header" style={{ display: 'grid', gridTemplateColumns: '80px repeat(6, 1fr)', background: '#4a90e2', color: 'white', fontWeight: 'bold' }}>
          <div className="header-cell" style={{ padding: 15, textAlign: 'center' }}>Period</div>
          {days.map(day => (
            <div key={day} className="header-cell" style={{ padding: 15, textAlign: 'center' }}>{day}</div>
          ))}
        </div>
        {periods.map(period => (
          <div key={period} className="student-timetable-row" style={{ display: 'grid', gridTemplateColumns: '80px repeat(6, 1fr)' }}>
            <div className="period-cell" style={{ padding: 15, textAlign: 'center', background: '#2c3e50', color: 'white', fontWeight: 'bold' }}>{period}</div>
            {days.map(day => {
              const cell = getCell(day, period);
              return (
                <div key={`${day}-${period}`} className="schedule-cell" style={{ padding: 15, borderRight: '1px solid #e1e4e8', borderBottom: '1px solid #e1e4e8', minHeight: 80 }}>
                  {cell ? (
                    <div className="cell-content">
                      <div className="subject" style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: 16 }}>{cell.subject}</div>
                      <div className="teacher" style={{ color: '#5a6776', fontSize: 14 }}>{cell.teacherId?.firstName} {cell.teacherId?.lastName}</div>
                      <div className="time" style={{ color: '#7f8c9d', fontSize: 12 }}>{cell.startTime} - {cell.endTime}</div>
                    </div>
                  ) : (
                    <div className="empty-cell" style={{ color: '#bdc3c7', textAlign: 'center', fontStyle: 'italic' }}>No class scheduled</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentTimetable; 