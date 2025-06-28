import React, { useEffect, useState } from 'react';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError('');
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!user?._id || !token) {
          setError('Authentication failed. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/attendance/student/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        


        if (!response.ok) {
          throw new Error(`Failed to fetch attendance: ${response.statusText}`);
        }

        const data = await response.json();
        setAttendance(data);
      } catch (err) {
        setError(err.message || 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <div>Loading attendance...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="student-attendance-section" style={{ padding: 20, background: '#fff', borderRadius: 8 }}>
      <h2 style={{ marginBottom: 20 }}>My Attendance</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#4a90e2', color: 'white' }}>
            <th style={{ padding: 10, border: '1px solid #ccc' }}>Date</th>
            <th style={{ padding: 10, border: '1px solid #ccc' }}>Status</th>
            <th style={{ padding: 10, border: '1px solid #ccc' }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {attendance.length === 0 ? (
            <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20 }}>No records found.</td></tr>
          ) : (
            attendance.map(record => (
              <tr key={record._id}>
                <td style={{ padding: 10, border: '1px solid #ccc' }}>
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td style={{ padding: 10, border: '1px solid #ccc', textTransform: 'capitalize' }}>
                  {record.status}
                </td>
                <td style={{ padding: 10, border: '1px solid #ccc' }}>
                  {record.remarks || '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentAttendance;
