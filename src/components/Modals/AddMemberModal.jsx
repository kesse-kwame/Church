import React, { useState, useEffect } from 'react';
import idGenerator from '../../utils/idGenerator';

function AddMemberModal({ onClose, onSave, member, members = [], isEditing = false, source = 'manual' }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    baptismDate: '',
    address: '',
    group: '',
    status: source === 'online' ? 'Visitor' : 'Active',
    familyId: '',
    familyRole: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phone: member.phone || '',
        birthDate: member.birthDate || '',
        baptismDate: member.baptismDate || '',
        address: member.address || '',
        group: member.group || '',
        status: member.status || 'Active',
        familyId: member.familyId || '',
        familyRole: member.familyRole || ''
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createFamilyId = () => {
    return `FAM-${Date.now()}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      source,
      joinDate: formData.joinDate || new Date().toISOString().split('T')[0]
    };

    if (isEditing && member && member.id) {
      onSave({ ...member, ...payload });
    } else {
      // create flow — generate unique member_code and send payload
      const member_code = idGenerator.generate();
      onSave({ member_code, ...payload });
    }
  };

  // list of existing family IDs for quick selection
  const familyIds = Array.from(new Set(members.map(m => m.familyId).filter(Boolean)));

  return (
    <div className="modal" style={{display: 'flex'}}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isEditing ? 'Member Details' : (source === 'online' ? 'Online Registration' : 'Add New Member')}</h3>
          <button className="close-modal" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input type="text" id="firstName" name="firstName" className="form-control" required value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input type="text" id="lastName" name="lastName" className="form-control" required value={formData.lastName} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input type="email" id="email" name="email" className="form-control" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="birthDate">Birth Date</label>
                <input type="date" id="birthDate" name="birthDate" className="form-control" value={formData.birthDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="baptismDate">Joining Date</label>
                <input type="date" id="baptismDate" name="baptismDate" className="form-control" value={formData.baptismDate} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input type="text" id="address" name="address" className="form-control" value={formData.address} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="group">Department</label>
                <select id="group" name="group" className="form-control" value={formData.group} onChange={handleChange}>
                  <option value="">Select a department</option>
                  <option value="Youth Group">Youth Group</option>
                  <option value="Women's Fellowship">Women's Fellowship</option>
                  <option value="Men's Prayer">Men's Prayer</option>
                  <option value="Sunday School">Sunday School</option>
                  <option value="Choir">Choir</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" className="form-control" value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Visitor">Visitor</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="familyId">Family</label>
                <div style={{display: 'flex', gap: '8px'}}>
                  <select id="familyId" name="familyId" className="form-control" value={formData.familyId} onChange={handleChange}>
                    <option value="">No family / select existing</option>
                    {familyIds.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <button type="button" className="btn" onClick={() => setFormData(prev => ({ ...prev, familyId: createFamilyId() }))}>Create Family</button>
                </div>
                {formData.familyId && (
                  <div style={{marginTop: '8px'}}>
                    <strong>Family members:</strong>
                    <div style={{marginTop: '6px'}}>
                      {members.filter(m => m.familyId === formData.familyId && (!member || m.id !== member.id)).map(m => (
                        <div key={m.id} style={{padding: '4px 0'}}>{m.firstName} {m.lastName} <small style={{color:'#666'}}>({m.id})</small></div>
                      ))}
                      {members.filter(m => m.familyId === formData.familyId && (!member || m.id !== member.id)).length === 0 && (
                        <div style={{color:'#666'}}>No other members assigned to this family yet.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="familyRole">Family Role</label>
                <select id="familyRole" name="familyRole" className="form-control" value={formData.familyRole} onChange={handleChange}>
                  <option value="">Select role</option>
                  <option value="Head">Head</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{textAlign: 'right', marginTop: '20px'}}>
              <button type="button" className="btn" style={{marginRight: '10px'}} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">{isEditing ? 'Save' : (source === 'online' ? 'Register' : 'Add Member')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddMemberModal;