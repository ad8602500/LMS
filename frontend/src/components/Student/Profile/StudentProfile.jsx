import React, { useEffect, useState } from 'react';
import './StudentProfile.css';
import axios from 'axios';

const StudentProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalized, setFinalized] = useState(false);
  const [addresses, setAddresses] = useState({
    permanentAddress: { address1: '', address2: '', city: '', district: '', state: '', country: '' },
    correspondingAddress: { address1: '', address2: '', city: '', district: '', state: '', country: '' },
    payingGuestAddress: { hno: '', colony: '', city: '', district: '', state: '', country: '' }
  });
  const [extraInfo, setExtraInfo] = useState({
    dob: '',
    gender: '',
    category: '',
    emergencyContact: '',
    motherName: '',
    motherMobile: '',
    fatherMobile: '',
    landline: '',
    fatherEmail: '',
    lpuEmail: '',
    photo: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/students/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(res.data);
        setFinalized(res.data.studentProfileFinalized);
        setAddresses({
          permanentAddress: { ...addresses.permanentAddress, ...res.data.permanentAddress },
          correspondingAddress: { ...addresses.correspondingAddress, ...res.data.correspondingAddress },
          payingGuestAddress: { ...addresses.payingGuestAddress, ...res.data.payingGuestAddress }
        });
      } catch (err) {
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!profileData) return <div>Profile not found.</div>;

  // Personal info from User model (read-only)
  const p = profileData || {};

  // Address input handlers
  const handleAddressChange = (type, field, value) => {
    setAddresses(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  // Extra info input handler
  const handleExtraInfoChange = (field, value) => {
    setExtraInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/students/update-addresses', {
        ...addresses,
        ...extraInfo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmitMsg('Details updated successfully!');
    } catch (err) {
      setSubmitMsg('Failed to update details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-profile-card">
      <h2>Personal Information</h2>
      <div className="profile-section">
        <div className="profile-table-ums">
          <div className="profile-table-left-ums">
            <div className="profile-row-ums">
              <div className="profile-label-ums">First Name :</div>
              <div className="profile-value-ums">{p.firstName}</div>
              <div className="profile-label-ums">Last Name :</div>
              <div className="profile-value-ums">{p.lastName}</div>
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Email :</div>
              <div className="profile-value-ums">{p.email}</div>
              <div className="profile-label-ums">Phone :</div>
              <div className="profile-value-ums">{p.phone}</div>
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Class :</div>
              <div className="profile-value-ums">{p.classId?.name || p.classId}</div>
              <div className="profile-label-ums">Section :</div>
              <div className="profile-value-ums">{p.section}</div>
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Roll No :</div>
              <div className="profile-value-ums">{p.rollNo}</div>
              <div className="profile-label-ums">Admission No :</div>
              <div className="profile-value-ums">{p.admissionNo}</div>
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Parent Name :</div>
              <div className="profile-value-ums">{p.parentName}</div>
              <div className="profile-label-ums">Parent Phone :</div>
              <div className="profile-value-ums">{p.parentPhone}</div>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <h2>Other Personal Details</h2>
        <div className="profile-section">
          <div className="profile-table-ums">
            <div className="profile-row-ums">
              <div className="profile-label-ums">Date of Birth :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.dob}</div>
              ) : (
                <input className="profile-value-ums" type="date" value={extraInfo.dob} onChange={e => handleExtraInfoChange('dob', e.target.value)} />
              )}
              <div className="profile-label-ums">Gender :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.gender}</div>
              ) : (
                <input className="profile-value-ums" value={extraInfo.gender} onChange={e => handleExtraInfoChange('gender', e.target.value)} />
              )}
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Category :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.category}</div>
              ) : (
                <input className="profile-value-ums" value={extraInfo.category} onChange={e => handleExtraInfoChange('category', e.target.value)} />
              )}
              <div className="profile-label-ums">Emergency Contact :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.emergencyContact}</div>
              ) : (
                <input className="profile-value-ums" value={extraInfo.emergencyContact} onChange={e => handleExtraInfoChange('emergencyContact', e.target.value)} />
              )}
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Mother Name :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.motherName}</div>
              ) : (
                <input className="profile-value-ums" value={extraInfo.motherName} onChange={e => handleExtraInfoChange('motherName', e.target.value)} />
              )}
              <div className="profile-label-ums">Mother Mobile :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.motherMobile}</div>
              ) : (
                <input className="profile-value-ums" value={extraInfo.motherMobile} onChange={e => handleExtraInfoChange('motherMobile', e.target.value)} />
              )}
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Father Mobile :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.fatherMobile}</div>
              ) : (
                <input className="profile-value-ums" value={extraInfo.fatherMobile} onChange={e => handleExtraInfoChange('fatherMobile', e.target.value)} />
              )}
              <div className="profile-label-ums">Landline :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.landline}</div>
              ) : (
                <input className="profile-value-ums" value={extraInfo.landline} onChange={e => handleExtraInfoChange('landline', e.target.value)} />
              )}
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Father Email :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.fatherEmail}</div>
              ) : (
                <input className="profile-value-ums" value={extraInfo.fatherEmail} onChange={e => handleExtraInfoChange('fatherEmail', e.target.value)} />
              )}
              <div className="profile-label-ums">LPU Email :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.lpuEmail}</div>
              ) : (
                <input className="profile-value-ums" value={extraInfo.lpuEmail} onChange={e => handleExtraInfoChange('lpuEmail', e.target.value)} />
              )}
            </div>
            <div className="profile-row-ums">
              <div className="profile-label-ums">Photo URL :</div>
              {finalized ? (
                <div className="profile-value-ums">{extraInfo.photo}</div>
              ) : (
                <input className="profile-value-ums" value={extraInfo.photo} onChange={e => handleExtraInfoChange('photo', e.target.value)} />
              )}
            </div>
          </div>
        </div>
        {finalized ? (
          <>
            <h2>Permanent Address</h2>
            <div className="profile-section">
              <div className="address-table-ums">
                <div className="address-row-ums">
                  <div className="address-label-ums">Address Line 1 :</div>
                  <div className="address-value-ums">{addresses.permanentAddress.address1}</div>
                  <div className="address-label-ums">Address Line 2 :</div>
                  <div className="address-value-ums">{addresses.permanentAddress.address2}</div>
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">Town/City :</div>
                  <div className="address-value-ums">{addresses.permanentAddress.city}</div>
                  <div className="address-label-ums">District :</div>
                  <div className="address-value-ums">{addresses.permanentAddress.district}</div>
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">State/UT :</div>
                  <div className="address-value-ums">{addresses.permanentAddress.state}</div>
                  <div className="address-label-ums">Country :</div>
                  <div className="address-value-ums">{addresses.permanentAddress.country}</div>
                </div>
              </div>
            </div>
            <h2>Corresponding Address</h2>
            <div className="profile-section">
              <div className="address-table-ums">
                <div className="address-row-ums">
                  <div className="address-label-ums">Address Line 1 :</div>
                  <div className="address-value-ums">{addresses.correspondingAddress.address1}</div>
                  <div className="address-label-ums">Address Line 2 :</div>
                  <div className="address-value-ums">{addresses.correspondingAddress.address2}</div>
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">Town/City :</div>
                  <div className="address-value-ums">{addresses.correspondingAddress.city}</div>
                  <div className="address-label-ums">District :</div>
                  <div className="address-value-ums">{addresses.correspondingAddress.district}</div>
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">State/UT :</div>
                  <div className="address-value-ums">{addresses.correspondingAddress.state}</div>
                  <div className="address-label-ums">Country :</div>
                  <div className="address-value-ums">{addresses.correspondingAddress.country}</div>
                </div>
              </div>
            </div>
            <h2>Paying Guest Address</h2>
            <div className="profile-section">
              <div className="address-table-ums">
                <div className="address-row-ums">
                  <div className="address-label-ums">HNo-Building :</div>
                  <div className="address-value-ums">{addresses.payingGuestAddress.hno}</div>
                  <div className="address-label-ums">Colony :</div>
                  <div className="address-value-ums">{addresses.payingGuestAddress.colony}</div>
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">Town/City :</div>
                  <div className="address-value-ums">{addresses.payingGuestAddress.city}</div>
                  <div className="address-label-ums">District :</div>
                  <div className="address-value-ums">{addresses.payingGuestAddress.district}</div>
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">State/UT :</div>
                  <div className="address-value-ums">{addresses.payingGuestAddress.state}</div>
                  <div className="address-label-ums">Country :</div>
                  <div className="address-value-ums">{addresses.payingGuestAddress.country}</div>
                </div>
              </div>
            </div>
            <div className="success-message">Information submitted successfully. Contact admin for updates.</div>
          </>
        ) : (
          <>
            {/* ...existing code for address input fields and submit button... */}
            <h2>Permanent Address</h2>
            <div className="profile-section">
              <div className="address-table-ums">
                <div className="address-row-ums">
                  <div className="address-label-ums">Address Line 1 :</div>
                  <input className="address-value-ums" value={addresses.permanentAddress.address1 || ''} onChange={e => handleAddressChange('permanentAddress', 'address1', e.target.value)} required />
                  <div className="address-label-ums">Address Line 2 :</div>
                  <input className="address-value-ums" value={addresses.permanentAddress.address2 || ''} onChange={e => handleAddressChange('permanentAddress', 'address2', e.target.value)} />
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">Town/City :</div>
                  <input className="address-value-ums" value={addresses.permanentAddress.city || ''} onChange={e => handleAddressChange('permanentAddress', 'city', e.target.value)} required />
                  <div className="address-label-ums">District :</div>
                  <input className="address-value-ums" value={addresses.permanentAddress.district || ''} onChange={e => handleAddressChange('permanentAddress', 'district', e.target.value)} required />
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">State/UT :</div>
                  <input className="address-value-ums" value={addresses.permanentAddress.state || ''} onChange={e => handleAddressChange('permanentAddress', 'state', e.target.value)} required />
                  <div className="address-label-ums">Country :</div>
                  <input className="address-value-ums" value={addresses.permanentAddress.country || ''} onChange={e => handleAddressChange('permanentAddress', 'country', e.target.value)} required />
                </div>
              </div>
            </div>
            <h2>Corresponding Address</h2>
            <div className="profile-section">
              <div className="address-table-ums">
                <div className="address-row-ums">
                  <div className="address-label-ums">Address Line 1 :</div>
                  <input className="address-value-ums" value={addresses.correspondingAddress.address1 || ''} onChange={e => handleAddressChange('correspondingAddress', 'address1', e.target.value)} required />
                  <div className="address-label-ums">Address Line 2 :</div>
                  <input className="address-value-ums" value={addresses.correspondingAddress.address2 || ''} onChange={e => handleAddressChange('correspondingAddress', 'address2', e.target.value)} />
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">Town/City :</div>
                  <input className="address-value-ums" value={addresses.correspondingAddress.city || ''} onChange={e => handleAddressChange('correspondingAddress', 'city', e.target.value)} required />
                  <div className="address-label-ums">District :</div>
                  <input className="address-value-ums" value={addresses.correspondingAddress.district || ''} onChange={e => handleAddressChange('correspondingAddress', 'district', e.target.value)} required />
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">State/UT :</div>
                  <input className="address-value-ums" value={addresses.correspondingAddress.state || ''} onChange={e => handleAddressChange('correspondingAddress', 'state', e.target.value)} required />
                  <div className="address-label-ums">Country :</div>
                  <input className="address-value-ums" value={addresses.correspondingAddress.country || ''} onChange={e => handleAddressChange('correspondingAddress', 'country', e.target.value)} required />
                </div>
              </div>
            </div>
            <h2>Paying Guest Address</h2>
            <div className="profile-section">
              <div className="address-table-ums">
                <div className="address-row-ums">
                  <div className="address-label-ums">HNo-Building :</div>
                  <input className="address-value-ums" value={addresses.payingGuestAddress.hno || ''} onChange={e => handleAddressChange('payingGuestAddress', 'hno', e.target.value)} required />
                  <div className="address-label-ums">Colony :</div>
                  <input className="address-value-ums" value={addresses.payingGuestAddress.colony || ''} onChange={e => handleAddressChange('payingGuestAddress', 'colony', e.target.value)} required />
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">Town/City :</div>
                  <input className="address-value-ums" value={addresses.payingGuestAddress.city || ''} onChange={e => handleAddressChange('payingGuestAddress', 'city', e.target.value)} required />
                  <div className="address-label-ums">District :</div>
                  <input className="address-value-ums" value={addresses.payingGuestAddress.district || ''} onChange={e => handleAddressChange('payingGuestAddress', 'district', e.target.value)} required />
                </div>
                <div className="address-row-ums">
                  <div className="address-label-ums">State/UT :</div>
                  <input className="address-value-ums" value={addresses.payingGuestAddress.state || ''} onChange={e => handleAddressChange('payingGuestAddress', 'state', e.target.value)} required />
                  <div className="address-label-ums">Country :</div>
                  <input className="address-value-ums" value={addresses.payingGuestAddress.country || ''} onChange={e => handleAddressChange('payingGuestAddress', 'country', e.target.value)} required />
                </div>
              </div>
            </div>
            <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
            {submitMsg && <div>{submitMsg}</div>}
          </>
        )}
      </form>
    </div>
  );
};

export default StudentProfile;