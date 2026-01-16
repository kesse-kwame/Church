import React, { useState, useEffect } from 'react';
import AddMemberModal from './Modals/AddMemberModal';

function Members() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // load via member service (Supabase if configured, otherwise local storage)
  useEffect(() => {
    let mounted = true;
    import('../services/memberService').then(svc => {
      svc.default.getAll().then(data => {
        if (mounted) setMembers(data || []);
      }).catch(err => console.error('Load members error', err));
    });
    return () => { mounted = false; };
  }, []);

  const handleAddMember = async (newMember) => {
    try {
      const svc = (await import('../services/memberService')).default;
      const created = await svc.create(newMember);
      setMembers(prev => [created, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Create member failed', err);
      alert('Failed to add member (check console)');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const deleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      const svc = (await import('../services/memberService')).default;
      await svc.remove(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Delete member failed', err);
      alert('Failed to delete member (check console)');
    }
  };

  const exportToCSV = () => {
    if (members.length === 0) {
      alert('No members to export');
      return;
    }

    // Define CSV headers based on member object keys
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Birth Date', 'Baptism Date', 'Group', 'Status'];
    
    // Map member data to CSV rows
    const rows = members.map(m => [
      m.id || m.member_code || '',
      m.firstName || m.first_name || '',
      m.lastName || m.last_name || '',
      m.email || '',
      m.phone || '',
      m.birthDate || m.dob || '',
      m.baptismDate || m.baptism_date || '',
      m.group || m.group_name || '',
      m.status || 'Active'
    ]);

    // Build CSV content
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      // Escape quotes and wrap fields with commas in quotes
      const escapedRow = row.map(field => {
        const str = String(field || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',');
      csvContent += escapedRow + '\n';
    });

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `members-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMembers = members.filter(member => 
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="members-container">
      <div className="table-container">
        <div className="table-header">
          <h3>All Church Members</h3>
          <div>
            <button className="btn btn-success" onClick={exportToCSV}>
              <i className="fas fa-file-export"></i> Export CSV
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-user-plus"></i> Add Member
            </button>
          </div>
        </div>
        
        <div className="form-group" style={{marginBottom: '20px'}}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search members by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Birth Date</th>
              <th>Joining Date</th>
              <th>Group</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>
                  <div className="member-info">
                    <div className="member-name">{member.firstName} {member.lastName}</div>
                    <small className="member-join-date">Joined: {formatDate(member.joinDate)}</small>
                  </div>
                </td>
                <td>{member.email}</td>
                <td>{member.phone}</td>
                <td>{member.birthDate ? formatDate(member.birthDate) : 'N/A'}</td>
                <td>{member.baptismDate ? formatDate(member.baptismDate) : 'N/A'}</td>
                <td>{member.group || 'Not Assigned'}</td>
                <td><span className={`status ${member.status.toLowerCase()}`}>{member.status}</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-edit" title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-delete" 
                      title="Delete"
                      onClick={() => deleteMember(member.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <button className="btn btn-sm btn-view" title="View Details">
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredMembers.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-users fa-3x"></i>
            <h4>No Members Found</h4>
            <p>Try adjusting your search or add a new member</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMemberModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddMember}
        />
      )}
    </div>
  );
}

export default Members;