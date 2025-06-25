import React from 'react';
import './StudentProfile.css';

const profileData = {
  personal: {
    vid: '12106635',
    name: 'Aditya Pratap Singh Dangi',
    fatherName: 'Gajendra Singh',
    motherName: 'Seema Devi',
    gender: 'M',
    dob: '2003-02-17',
    category: 'OBC',
    studentMobile: '8817016591',
    fatherMobile: '9617746739',
    email: 'ad8602500@gmail.com',
    lpuEmail: 'aditya.12106635@lpu.in',
    fatherEmail: 'ad8602500@gmail.com',
    emergencyContact: '',
    landline: '',
    motherMobile: '',
    photo: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  permanentAddress: {
    address1: 'Village Bannad',
    address2: '',
    city: 'Sagar (Madhya Pradesh)',
    district: 'Sagar',
    state: 'Madhya Pradesh',
    country: 'India',
  },
  correspondingAddress: {
    address1: 'Village- Bannad',
    address2: '',
    city: 'Bamora (Madhya Pradesh)',
    district: 'Sagar',
    state: 'Madhya Pradesh',
    country: 'India',
  },
  payingGuestAddress: {
    hno: '',
    colony: '',
    city: '',
    district: '',
    state: '',
    country: '',
  },
};

const StudentProfile = () => {
  const p = profileData.personal;
  const pa = profileData.permanentAddress;
  const ca = profileData.correspondingAddress;
  const pg = profileData.payingGuestAddress;

  return (
    <div className="student-profile-ums">
      {/* Personal Information Section */}
      <div className="profile-section-ums">
        <div className="section-header-ums">Personal Information :</div>
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

      {/* Address Sections */}
      <div className="address-sections-ums">
        <div className="address-section-ums">
          <div className="section-header-ums">Permanent Address :</div>
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
        <div className="address-section-ums">
          <div className="section-header-ums">Corresponding Address :</div>
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
        <div className="address-section-ums">
          <div className="section-header-ums">Paying Guest Address :</div>
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
      </div>
    </div>
  );
};

export default StudentProfile; 