import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddMemberModal from './Modals/AddMemberModal';

function Members() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

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
      // Only send fields that exist in the members table
      const payload = {
        member_code: newMember.member_code,
        first_name: newMember.firstName,
        last_name: newMember.lastName,
        email: newMember.email,
        phone: newMember.phone,
        department: newMember.department || newMember.group,
        group_name: newMember.group,
        status: newMember.status
      };
      
      // Remove undefined/empty fields
      Object.keys(payload).forEach(key => 
        (payload[key] === '' || payload[key] === null || payload[key] === undefined) && delete payload[key]
      );
      
      const created = await svc.create(payload);
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

  const departments = Array.from(new Set(members
    .map(m => m.department || m.group || m.group_name)
    .filter(Boolean)
    .map(dep => dep.trim().toLowerCase())
  ));

  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName || member.first_name || ''} ${member.lastName || member.last_name || ''}`.trim();
    const id = member.id || member.member_code || '';
    const department = (member.department || member.group || member.group_name || '').toLowerCase();
    const status = (member.status || 'active').toLowerCase();

    const matchesSearch = [fullName, id, member.email, member.phone]
      .filter(Boolean)
      .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusClass = (status) => {
    const normalized = (status || 'active').toLowerCase();
    if (normalized.includes('inactive')) return 'inactive';
    if (normalized.includes('pending')) return 'pending';
    return 'active';
  };

  const getAvatar = (member) => {
    if (member.avatar) return member.avatar;
    const seed = member.email || member.id || member.firstName || Math.random();
    return `https://i.pravatar.cc/80?u=${encodeURIComponent(seed)}`;
  };

  return (
    <div className="members-screen">
      <div className="page-header-row">
        <div>
          <h1>Membership Management</h1>
          <p className="muted">Search, filter and review all members</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-user-plus"></i>
            Register New Member
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/register')}
          >
            <i className="fas fa-link"></i>
            Online Registration Link
          </button>
        </div>
      </div>

      <div className="filters-row">
        <div className="search-field">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-select">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <i className="fas fa-chevron-down" />
        </div>
        <div className="filter-select">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value.toLowerCase())}
          >
            <option value="all">All Departments</option>
            {departments.map(dep => (
              <option key={dep} value={dep.toLowerCase()}>{dep.charAt(0).toUpperCase() + dep.slice(1)}</option>
            ))}
          </select>
          <i className="fas fa-chevron-down" />
        </div>
      </div>

      <div className="members-layout">
        <div className="table-card">
          <table className="members-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>ID</th>
                <th>Department</th>
                <th>Status</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => {
                const fullName = `${member.firstName || member.first_name || ''} ${member.lastName || member.last_name || ''}`.trim() || member.name || 'Unnamed';
                const department = member.department || member.group || member.group_name || '—';
                const status = member.status || 'Active';

                return (
                  <tr key={member.id || fullName}>
                    <td>
                      <div className="member-cell">
                        <img src={getAvatar(member)} alt={fullName} className="member-avatar" />
                        <div className="member-meta">
                          <span className="member-name">{fullName}</span>
                          <span className="member-join">Joined: {formatDate(member.joinDate)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{member.id || member.member_code || '—'}</td>
                    <td>{department}</td>
                    <td>
                      <span className={`status-chip ${getStatusClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="actions-col">
                      <button className="view-btn">
                        View Profile
                      </button>
                      <button
                        className="icon-action danger"
                        onClick={() => deleteMember(member.id)}
                        title="Delete member"
                      >
                        <i className="fas fa-trash-alt" />
                      </button>
                    </td>
                  </tr>
                );
              })}
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

        <div className="details-card">
          <p className="muted centered">Select a member from the list to view details.</p>
        </div>
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