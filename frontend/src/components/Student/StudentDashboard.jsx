import React from 'react';
import './StudentDashboard.css';

const StudentDashboard = () => {
  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
      </div>
      <div className="dashboard-content">
        {/* Main Dashboard Content - Cards */}

        {/* Happening Card */}
        <div className="dashboard-card happening-card">
          <h2 className="card-title"><i className="fas fa-bell"></i> Happening</h2>
          <div className="card-body">
            <ul>
              <li><strong>LPU Hosted Career Skills</strong><br/>Conference to Bridge Education and Industry for Future-Ready Professionals</li>
              <li><strong>Broadridge India signs MOU with Lovely Professional University</strong><br/>for Industry-Academia Collaboration</li>
              <li>LPU's campus came alive with...</li>
            </ul>
            <div className="card-footer">
              <span className="event-note">* Happening Events in LPU</span>
              <button className="view-more-button">View More</button>
            </div>
          </div>
        </div>

        {/* My Messages Card */}
        <div className="dashboard-card messages-card">
          <h2 className="card-title"><i className="fas fa-envelope"></i> My Messages</h2>
          <div className="card-body">
            <ul>
              <li>
                <p><strong>OJT/Internship Attendance</strong> - By Administrator (Jun 17, 2025)</p>
                <p>Dear Student, Please mark your attendance for the OJT/Internship for the date 17-06-2025. <a href="#" className="click-here-link">Click Here to mark Attendance</a></p>
              </li>
              <li>
                <p><strong>ON CAMPUS Drive - ALPHA INNOVATIONPVT LTD</strong> - By Office of Director DCS (Jun 16, 2025)</p>
                <p>Dear Student, you are eligible for ON CAMPUS Drive of ALPHA INNOVATIONPVT LTD. Date will be notified later. Check venue through UMS. Register by Jun 18 2025 1:00PM. BEST Wishes, LPU</p>
              </li>
              <li>
                <p><strong>ON CAMPUS Drive - ALPHA INNOVATIONPVT LTD</strong> - By Office of Director DCS (Jun 16, 2025)</p>
              </li>
            </ul>
            <div className="card-footer">
              <span className="event-note">* Messages Sent by Teachers</span>
              <button className="all-messages-button">All Messages</button>
            </div>
          </div>
        </div>

        {/* My Courses Card */}
        <div className="dashboard-card courses-card">
          <h2 className="card-title"><i className="fas fa-book"></i> My Courses</h2>
          <div className="card-body">
            <p>CSE441: INDUSTRY</p>
            <p>HIP PROJECT</p>
            {/* Add more courses as needed */}
          </div>
        </div>

        {/* Fee Card */}
        <div className="dashboard-card fee-card">
          <h2 className="card-title"><i className="fas fa-money-bill-wave"></i> Fee</h2>
          <div className="card-body">
            <p>Your fee details and payment status.</p>
            {/* Add fee details here */}
          </div>
        </div>

        {/* Pending Assignments Card */}
        <div className="dashboard-card assignments-card">
          <h2 className="card-title"><i className="fas fa-tasks"></i> Pending Assignments</h2>
          <div className="card-body">
            <p>No Assignments Available</p>
            {/* List assignments here */}
          </div>
        </div>

        {/* Events Card */}
        <div className="dashboard-card events-card">
          <h2 className="card-title"><i className="fas fa-calendar-alt"></i> Events</h2>
          <div className="card-body">
            <p>Upcoming events will be listed here.</p>
            {/* List events here */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard; 