import React, { useState } from 'react';
import AddMemberModal from '../components/Modals/AddMemberModal';

export default function OnlineRegistrationPage() {
  const [showModal, setShowModal] = useState(true);

  const handleRegistrationSubmit = async (newMember) => {
    try {
      const svc = (await import('../services/memberService')).default;
      
      const payload = {
        member_code: newMember.member_code,
        first_name: newMember.firstName,
        last_name: newMember.lastName,
        email: newMember.email,
        phone: newMember.phone,
        department: newMember.group,
        group_name: newMember.group,
        status: 'Visitor',
        source: 'online'
      };
      
      Object.keys(payload).forEach(key => 
        (payload[key] === '' || payload[key] === null || payload[key] === undefined) && delete payload[key]
      );
      
      await svc.create(payload);
      setShowModal(false);
    } catch (err) {
      console.error('Registration failed', err);
      alert('Registration failed. Please try again.');
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div className="page-shell">
      {!showModal ? (
        <div style={{textAlign: 'center', padding: '60px 20px'}}>
          <div style={{maxWidth: '500px', margin: '0 auto'}}>
            <i className="fas fa-check-circle" style={{fontSize: '64px', color: '#22c55e', marginBottom: '20px'}}></i>
            <h2 style={{color: '#1f2937', marginBottom: '10px'}}>Registration Successful!</h2>
            <p style={{color: '#6b7280', marginBottom: '30px', fontSize: '16px'}}>
              Thank you for registering. Your information has been submitted and will be reviewed by our team.
            </p>
            <p style={{color: '#6b7280', marginBottom: '30px', fontSize: '14px'}}>
              You will receive a confirmation email at the address provided.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/members'}
            >
              Return to Home
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{textAlign: 'center', marginBottom: '40px'}}>
            <h1 style={{color: '#1f2937', marginBottom: '10px'}}>Online Member Registration</h1>
            <p style={{color: '#6b7280'}}>Welcome! Please fill out the form below to register as a member.</p>
          </div>
          {showModal && (
            <AddMemberModal 
              onClose={handleClose}
              onSave={handleRegistrationSubmit}
              source="online"
              member={null}
              members={[]}
              isEditing={false}
            />
          )}
        </>
      )}
    </div>
  );
}
