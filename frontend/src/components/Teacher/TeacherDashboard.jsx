import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/admin/classes';
      if (user?.role === 'TEACHER') {
        url = '/api/teacher/classes';
      }
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setClasses(response.data);
    } catch (error) {
      // handle error
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-content">
        {/* Dashboard Overview Card */}
        <div className="dashboard-card overview-card">
          <h2 className="card-title"><i className="fas fa-info-circle"></i> Dashboard Overview</h2>
          <div className="card-body">
            <p>Welcome, Teacher! Here's a summary of your activities.</p>
            <ul>
              <li>Total Classes: <strong>5</strong></li>
              <li>Total Students: <strong>150</strong></li>
              <li>Pending Assignments to Review: <strong>12</strong></li>
              <li>Upcoming Classes Today: <strong>2</strong></li>
            </ul>
          </div>
        </div>

        {/* My Classes Card */}
        <div className="dashboard-card classes-card">
          <h2 className="card-title"><i className="fas fa-chalkboard"></i> My Classes</h2>
          <div className="card-body">
            <ul>
              <li>Class 10A - Mathematics</li>
              <li>Class 11B - Physics</li>
              <li>Class 9C - Science</li>
            </ul>
            <div className="card-footer">
              <button className="view-more-button">View All Classes</button>
            </div>
          </div>
        </div>

        {/* Pending Assignments Card */}
        <div className="dashboard-card assignments-card">
          <h2 className="card-title"><i className="fas fa-tasks"></i> Pending Assignments</h2>
          <div className="card-body">
            <p>Assignments needing your attention:</p>
            <ul>
              <li>Math Homework - Class 10A (Due: 2024-07-15)</li>
              <li>Physics Lab Report - Class 11B (Due: 2024-07-18)</li>
            </ul>
            <div className="card-footer">
              <button className="view-more-button">Review Assignments</button>
            </div>
          </div>
        </div>

        {/* Recent Messages Card */}
        <div className="dashboard-card messages-card">
          <h2 className="card-title"><i className="fas fa-envelope"></i> Recent Messages</h2>
          <div className="card-body">
            <ul>
              <li>Student query from Jane Doe regarding Calculus.</li>
              <li>Admin announcement: Faculty meeting tomorrow at 10 AM.</li>
            </ul>
            <div className="card-footer">
              <button className="all-messages-button">View All Messages</button>
            </div>
          </div>
        </div>

        {/* Attendance Summary Card */}
        <div className="dashboard-card attendance-card">
          <h2 className="card-title"><i className="fas fa-clipboard-check"></i> Attendance Summary</h2>
          <div className="card-body">
            <p>Today's attendance marked for 3/5 classes.</p>
            <p>Upcoming attendance to be marked for Class 9C.</p>
            <div className="card-footer">
              <button className="view-more-button">Mark Attendance</button>
            </div>
          </div>
        </div>

        {/* School Announcements Card */}
        <div className="dashboard-card announcements-card">
          <h2 className="card-title"><i className="fas fa-bullhorn"></i> School Announcements</h2>
          <div className="card-body">
            <ul>
              <li>Parent-Teacher Meeting scheduled for Aug 5th.</li>
              <li>Professional development workshop on July 25th.</li>
            </ul>
            <div className="card-footer">
              <button className="view-more-button">View All Announcements</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard; 