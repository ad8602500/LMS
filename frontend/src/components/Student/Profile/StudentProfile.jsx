import React, { useEffect, useState } from 'react';
import './StudentProfile.css';
import axios from 'axios';

const StudentProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalized, setFinalized] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/students/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(res.data);
        setFinalized(res.data.studentProfileFinalized); // or whatever your finalized flag is
      } catch (err) {
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!profileData) return <div>Profile not found.</div>;

  // Map your backend fields to the UI structure here
  const p = profileData.personal || {};
  const pa = profileData.permanentAddress || {};
  const ca = profileData.correspondingAddress || {};
  const pg = profileData.payingGuestAddress || {};

  return (
    <div className="student-profile-card">
      <h2>Personal Information</h2>
      <div className="profile-section">
        <div className="profile-table-ums">
          <div className="profile-table-left-ums">
            <div className="profile-row-ums">
              <div className="profile-label-ums">VID :</div>
              <div className="profile-value-ums">{p.vid}</div>
              <div className="profile-label-ums">Date of birth :</div>
              <div className="profile-value-ums">{p.dob}</div>
              <div className="profile-label-ums">Category :</div>
              <div className="profile-value-ums">{p.category}</div>
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Name :</div>
              <div className="profile-value-ums">{p.name}</div>
              <div className="profile-label-ums">Father Name :</div>
              <div className="profile-value-ums">{p.fatherName}</div>
              <div className="profile-label-ums">Mother Name :</div>
              <div className="profile-value-ums">{p.motherName}</div>
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Gender :</div>
              <div className="profile-value-ums">{p.gender}</div>
              <div className="profile-label-ums">Student Mobile :</div>
              <div className="profile-value-ums">{p.studentMobile}</div>
              <div className="profile-label-ums">Father's Mobile No :</div>
              <div className="profile-value-ums">{p.fatherMobile}</div>
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Emergency Contact No :</div>
              <div className="profile-value-ums">{p.emergencyContact}</div>
              <div className="profile-label-ums">Mother's Mobile No :</div>
              <div className="profile-value-ums">{p.motherMobile}</div>
              <div className="profile-label-ums">Landline No :</div>
              <div className="profile-value-ums">{p.landline}</div>
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">E-mail Id :</div>
              <div className="profile-value-ums">{p.email}</div>
              <div className="profile-label-ums">Father's E-mail Id :</div>
              <div className="profile-value-ums">{p.fatherEmail}</div>
              <div className="profile-label-ums">LPU Email Id :</div>
              <div className="profile-value-ums">{p.lpuEmail}</div>
            </div>
          </div>
          <div className="profile-table-right-ums">
            <img src={p.photo} alt="Profile" className="profile-photo-ums" />
          </div>
        </div>
      </div>
      <h2>Permanent Address</h2>
      <div className="profile-section">
        <div className="address-table-ums">
          <div className="address-row-ums">
            <div className="address-label-ums">Address Line 1 :</div>
            <div className="address-value-ums">{pa.address1}</div>
            <div className="address-label-ums">Address Line 2 :</div>
            <div className="address-value-ums">{pa.address2}</div>
          </div>
          <div className="address-row-ums">
            <div className="address-label-ums">Town/City :</div>
            <div className="address-value-ums">{pa.city}</div>
            <div className="address-label-ums">District :</div>
            <div className="address-value-ums">{pa.district}</div>
          </div>
          <div className="address-row-ums">
            <div className="address-label-ums">State/UT :</div>
            <div className="address-value-ums">{pa.state}</div>
            <div className="address-label-ums">Country :</div>
            <div className="address-value-ums">{pa.country}</div>
          </div>
        </div>
      </div>
      <h2>Corresponding Address</h2>
      <div className="profile-section">
        <div className="address-table-ums">
          <div className="address-row-ums">
            <div className="address-label-ums">Address Line 1 :</div>
            <div className="address-value-ums">{ca.address1}</div>
            <div className="address-label-ums">Address Line 2 :</div>
            <div className="address-value-ums">{ca.address2}</div>
          </div>
          <div className="address-row-ums">
            <div className="address-label-ums">Town/City :</div>
            <div className="address-value-ums">{ca.city}</div>
            <div className="address-label-ums">District :</div>
            <div className="address-value-ums">{ca.district}</div>
          </div>
          <div className="address-row-ums">
            <div className="address-label-ums">State/UT :</div>
            <div className="address-value-ums">{ca.state}</div>
            <div className="address-label-ums">Country :</div>
            <div className="address-value-ums">{ca.country}</div>
          </div>
        </div>
      </div>
      <h2>Paying Guest Address</h2>
      <div className="profile-section">
        <div className="address-table-ums">
          <div className="address-row-ums">
            <div className="address-label-ums">HNo-Building :</div>
            <div className="address-value-ums">{pg.hno}</div>
            <div className="address-label-ums">Colony :</div>
            <div className="address-value-ums">{pg.colony}</div>
          </div>
          <div className="address-row-ums">
            <div className="address-label-ums">Town/City :</div>
            <div className="address-value-ums">{pg.city}</div>
            <div className="address-label-ums">District :</div>
            <div className="address-value-ums">{pg.district}</div>
          </div>
          <div className="address-row-ums">
            <div className="address-label-ums">State/UT :</div>
            <div className="address-value-ums">{pg.state}</div>
            <div className="address-label-ums">Country :</div>
            <div className="address-value-ums">{pg.country}</div>
          </div>
        </div>
      </div>
      {!finalized && <button>Submit</button>}
      {finalized && <div>Final after submission – No further edits.</div>}
    </div>
  );
};

export default StudentProfile; 