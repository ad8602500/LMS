import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaPalette, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';

const sections = [
  { key: 'profile', label: 'Profile', icon: <FaUser /> },
  { key: 'security', label: 'Security', icon: <FaLock /> },
  { key: 'appearance', label: 'Appearance', icon: <FaPalette /> },
  { key: 'logout', label: 'Logout', icon: <FaSignOutAlt /> },
];

const Setting = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    name: 'Aditya Admin',
    email: 'aditya@admin.com',
    darkMode: false,
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="superadmin-setting-layout">
      <aside className="setting-sidebar">
        <button className="back-btn" onClick={() => navigate('/super-admin')}>
          <FaArrowLeft style={{marginRight: 8}} /> Back
        </button>
        <h2 className="sidebar-title">Settings</h2>
        <nav>
          {sections.map(section => (
            <button
              key={section.key}
              className={`sidebar-link${activeSection === section.key ? ' active' : ''}`}
              onClick={() => {
                if (section.key === 'logout') handleLogout();
                else setActiveSection(section.key);
              }}
            >
              <span className="sidebar-icon">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="setting-main">
        {activeSection === 'profile' && (
          <div className="setting-card">
            <h2 className="setting-title">Profile Info</h2>
            <div className="setting-section">
              <div className="setting-group">
                <label>Name</label>
                <input
                  value={settings.name}
                  onChange={e => setSettings(s => ({...s, name: e.target.value}))}
                  placeholder="Full Name"
                />
              </div>
              <div className="setting-group">
                <label>Email</label>
                <input
                  value={settings.email}
                  onChange={e => setSettings(s => ({...s, email: e.target.value}))}
                  placeholder="Email"
                  type="email"
                />
              </div>
              <button className="setting-btn primary">Update Profile</button>
            </div>
          </div>
        )}
        {activeSection === 'security' && (
          <div className="setting-card">
            <h2 className="setting-title">Change Password</h2>
            <div className="setting-section">
              <div className="setting-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={settings.password}
                  onChange={e => setSettings(s => ({...s, password: e.target.value}))}
                  placeholder="Current Password"
                />
              </div>
              <div className="setting-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={settings.newPassword}
                  onChange={e => setSettings(s => ({...s, newPassword: e.target.value}))}
                  placeholder="New Password"
                />
              </div>
              <div className="setting-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={settings.confirmNewPassword}
                  onChange={e => setSettings(s => ({...s, confirmNewPassword: e.target.value}))}
                  placeholder="Confirm New Password"
                />
              </div>
              <button className="setting-btn primary">Change Password</button>
            </div>
          </div>
        )}
        {activeSection === 'appearance' && (
          <div className="setting-card">
            <h2 className="setting-title">Appearance</h2>
            <div className="setting-section appearance-section">
              <label className="appearance-label">
                <span>Dark Mode</span>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={e => setSettings(s => ({...s, darkMode: e.target.checked}))}
                  style={{width: 22, height: 22, marginLeft: 16}}
                />
                <span style={{fontWeight: 600, marginLeft: 8}}>{settings.darkMode ? 'On' : 'Off'}</span>
              </label>
            </div>
          </div>
        )}
      </main>
      {/* Fancy CSS for this page only */}
      <style>{`
        .superadmin-setting-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8ffae 0%, #43c6ac 50%, #191654 100%);
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .setting-sidebar {
          min-width: 260px;
          max-width: 300px;
          background: rgba(255,255,255,0.97);
          border-radius: 22px 0 0 22px;
          box-shadow: 0 8px 32px rgba(127, 83, 172, 0.13);
          padding: 2.5rem 1.5rem 2.2rem 1.5rem;
          border: 1.5px solid rgba(67, 198, 172, 0.10);
          backdrop-filter: blur(8px);
          margin-top: 2.5rem;
          margin-bottom: 2.5rem;
          display: flex;
          flex-direction: column;
        }
        .back-btn {
          background: none;
          border: none;
          color: #7f53ac;
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .back-btn:hover {
          color: #43c6ac;
        }
        .sidebar-title {
          color: #7f53ac;
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 2rem;
          background: linear-gradient(90deg, #43c6ac, #7f53ac, #f8ffae);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .setting-sidebar nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sidebar-link {
          background: none;
          border: none;
          color: #191654;
          font-size: 1.1rem;
          font-weight: 600;
          text-align: left;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          transition: background 0.2s, color 0.2s;
        }
        .sidebar-link.active, .sidebar-link:hover {
          background: linear-gradient(90deg, #43c6ac 0%, #7f53ac 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(127, 83, 172, 0.10);
        }
        .sidebar-icon {
          font-size: 1.2em;
          display: flex;
          align-items: center;
        }
        .setting-main {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          margin-top: 2.5rem;
          margin-bottom: 2.5rem;
        }
        .setting-card {
          background: rgba(255,255,255,0.97);
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(127, 83, 172, 0.13);
          padding: 2.5rem 2.2rem 2.2rem 2.2rem;
          max-width: 540px;
          width: 100%;
          border: 1.5px solid rgba(67, 198, 172, 0.10);
          backdrop-filter: blur(8px);
        }
        .setting-title {
          color: #7f53ac;
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 2rem;
          text-align: left;
          background: linear-gradient(90deg, #43c6ac, #7f53ac, #f8ffae);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 1px;
        }
        .setting-section {
          background: rgba(248, 249, 250, 0.85);
          padding: 1.7rem;
          border-radius: 10px;
          border: 1.5px solid #a1c4fd;
          margin-bottom: 1.5rem;
        }
        .appearance-section {
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }
        .appearance-label {
          font-size: 1.2rem;
          color: #7f53ac;
          font-weight: 700;
          display: flex;
          align-items: center;
        }
        .setting-section h4 {
          margin: 0 0 1.1rem 0;
          color: #7f53ac;
          font-size: 1.13rem;
        }
        .setting-group {
          margin-bottom: 1.1rem;
        }
        .setting-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #191654;
          font-weight: 600;
        }
        .setting-group input {
          width: 100%;
          padding: 0.85rem;
          border: 1.5px solid #a1c4fd;
          border-radius: 7px;
          font-size: 1.05rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: rgba(255,255,255,0.85);
          color: #191654;
          box-shadow: 0 1px 4px 0 rgba(161, 196, 253, 0.08);
        }
        .setting-group input:focus {
          outline: none;
          border-color: #7f53ac;
          box-shadow: 0 0 0 4px rgba(127, 83, 172, 0.10);
          background: #fff;
        }
        .setting-btn {
          padding: 0.8rem 1.7rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1.08rem;
          cursor: pointer;
          margin-top: 8px;
          margin-bottom: 8px;
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .setting-btn.primary {
          background: linear-gradient(90deg, #7f53ac 70%, #43c6ac 100%);
          color: #fff;
          border: none;
          box-shadow: 0 2px 8px rgba(127, 83, 172, 0.10);
        }
        .setting-btn.primary:hover {
          background: linear-gradient(90deg, #43c6ac 70%, #7f53ac 100%);
          box-shadow: 0 4px 16px rgba(67, 198, 172, 0.13);
          transform: translateY(-2px) scale(1.03);
        }
        @media (max-width: 900px) {
          .superadmin-setting-layout {
            flex-direction: column;
            align-items: stretch;
          }
          .setting-sidebar, .setting-card {
            border-radius: 22px;
            max-width: 100%;
          }
          .setting-main {
            margin-top: 0;
            margin-bottom: 2.5rem;
            justify-content: center;
          }
        }
        @media (max-width: 600px) {
          .setting-sidebar, .setting-card {
            padding: 1.2rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Setting;
 