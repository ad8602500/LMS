import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const requiredFields = [
  'permanentAddress', 'currentAddress', 'aadharNumber', 'panNumber',
  'motherName', 'fatherName', 'bankAccountNumber', 'ifscCode'
];

const optionalFields = [
  'dateOfBirth', 'gender', 'maritalStatus', 'mobileNumber',
  'emergencyContactNumber', 'emailId', 'bloodGroup'
];

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  qualification: '',
  joiningDate: '',
  permanentAddress: '',
  currentAddress: '',
  aadharNumber: '',
  panNumber: '',
  motherName: '',
  fatherName: '',
  bankAccountNumber: '',
  ifscCode: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  mobileNumber: '',
  emergencyContactNumber: '',
  emailId: '',
  bloodGroup: ''
};

const Profile = () => {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '', lastName: '', email: '', subject: '', qualification: '', joiningDate: ''
  });
  const [profile, setProfile] = useState(initialState);
  const [finalized, setFinalized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        // Fetch personal info from User model
        const resPersonal = await axios.get('/api/teacher/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPersonalInfo({
          firstName: resPersonal.data.firstName || '',
          lastName: resPersonal.data.lastName || '',
          email: resPersonal.data.email || '',
          subject: resPersonal.data.subject || '',
          qualification: resPersonal.data.qualification || '',
          joiningDate: resPersonal.data.joiningDate || ''
        });
        // Fetch required/optional info from TeacherInfo
        try {
          const resInfo = await axios.get('/api/teacher/info/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfile({ ...initialState, ...resInfo.data });
          setFinalized(resInfo.data.finalized);
        } catch (err) {
          setProfile(initialState);
          setFinalized(false);
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const validate = () => {
    for (const field of requiredFields) {
      if (!profile[field]) return `Please fill ${field.replace(/([A-Z])/g, ' $1')}`;
    }
    if (!/^\d{12}$/.test(profile.aadharNumber)) return 'Aadhar must be 12 digits';
    if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(profile.panNumber)) return 'PAN format invalid (e.g. ABCDE1234F)';
    if (!/^[A-Z]{4}0\d{6}$/.test(profile.ifscCode)) return 'IFSC format invalid (e.g. SBIN0123456)';
    return '';
  };

  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationMsg = validate();
    if (validationMsg) {
      setError(validationMsg);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/teacher/info/me', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFinalized(true);
      setSuccess('Profile submitted and finalized.');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="teacher-profile-card">
      <h2 className="profile-title">Teacher Profile</h2>
      {finalized && (
        <div className="profile-finalized">
          <FaCheckCircle className="profile-finalized-icon" />
          Final after submission – No further edits.
        </div>
      )}
      {error && <div className="profile-error"><FaExclamationCircle /> {error}</div>}
      {success && <div className="profile-success"><FaCheckCircle /> {success}</div>}
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="profile-fields-grid">
            <div className="profile-field">
              <label>First Name
                <input name="firstName" value={personalInfo.firstName} readOnly />
              </label>
            </div>
            <div className="profile-field">
              <label>Last Name
                <input name="lastName" value={personalInfo.lastName} readOnly />
              </label>
            </div>
            <div className="profile-field">
              <label>Email
                <input name="email" value={personalInfo.email} readOnly />
              </label>
            </div>
            <div className="profile-field">
              <label>Subject
                <input name="subject" value={personalInfo.subject} readOnly />
              </label>
            </div>
            <div className="profile-field">
              <label>Qualification
                <input name="qualification" value={personalInfo.qualification} readOnly />
              </label>
            </div>
            <div className="profile-field">
              <label>Joining Date
                <input name="joiningDate" value={personalInfo.joiningDate ? personalInfo.joiningDate.slice(0,10) : ''} readOnly />
              </label>
            </div>
          </div>
        </div>
        <div className="profile-section">
          <h3>Required Information</h3>
          <div className="profile-fields-grid">
            <div className="profile-field">
              <label>Permanent Address
                <input name="permanentAddress" value={profile.permanentAddress} onChange={handleChange} disabled={finalized} required />
              </label>
            </div>
            <div className="profile-field">
              <label>Current Address
                <input name="currentAddress" value={profile.currentAddress} onChange={handleChange} disabled={finalized} required />
              </label>
            </div>
            <div className="profile-field">
              <label>Aadhar Number
                <input name="aadharNumber" value={profile.aadharNumber} onChange={handleChange} disabled={finalized} required maxLength={12} minLength={12} />
              </label>
            </div>
            <div className="profile-field">
              <label>PAN Number
                <input name="panNumber" value={profile.panNumber} onChange={handleChange} disabled={finalized} required maxLength={10} minLength={10} />
              </label>
            </div>
            <div className="profile-field">
              <label>Mother's Name
                <input name="motherName" value={profile.motherName} onChange={handleChange} disabled={finalized} required />
              </label>
            </div>
            <div className="profile-field">
              <label>Father's Name
                <input name="fatherName" value={profile.fatherName} onChange={handleChange} disabled={finalized} required />
              </label>
            </div>
            <div className="profile-field">
              <label>Bank Account Number
                <input name="bankAccountNumber" value={profile.bankAccountNumber} onChange={handleChange} disabled={finalized} required />
              </label>
            </div>
            <div className="profile-field">
              <label>IFSC Code
                <input name="ifscCode" value={profile.ifscCode} onChange={handleChange} disabled={finalized} required maxLength={11} minLength={11} />
              </label>
            </div>
          </div>
        </div>
        <div className="profile-section">
          <h3>Optional Information</h3>
          <div className="profile-fields-grid">
            <div className="profile-field">
              <label>Date of Birth
                <input type="date" name="dateOfBirth" value={profile.dateOfBirth?.slice(0,10) || ''} onChange={handleChange} disabled={finalized} />
              </label>
            </div>
            <div className="profile-field">
              <label>Gender
                <select name="gender" value={profile.gender} onChange={handleChange} disabled={finalized}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            <div className="profile-field">
              <label>Marital Status
                <select name="maritalStatus" value={profile.maritalStatus} onChange={handleChange} disabled={finalized}>
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </label>
            </div>
            <div className="profile-field">
              <label>Mobile Number
                <input name="mobileNumber" value={profile.mobileNumber} onChange={handleChange} disabled={finalized} />
              </label>
            </div>
            <div className="profile-field">
              <label>Emergency Contact Number
                <input name="emergencyContactNumber" value={profile.emergencyContactNumber} onChange={handleChange} disabled={finalized} />
              </label>
            </div>
            <div className="profile-field">
              <label>Email ID
                <input name="emailId" value={profile.emailId} onChange={handleChange} disabled={finalized} />
              </label>
            </div>
            <div className="profile-field">
              <label>Blood Group
                <input name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} disabled={finalized} />
              </label>
            </div>
          </div>
        </div>
        {!finalized && <button type="submit" className="profile-submit-btn">Submit</button>}
      </form>
      {finalized && <div className="profile-note"><b>Note:</b> This information is final and cannot be edited. Contact admin for queries.</div>}
    </div>
  );
};

export default Profile; 