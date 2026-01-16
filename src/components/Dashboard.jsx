import React, { useEffect, useState } from 'react';
import AddMemberModal from './Modals/AddMemberModal';
import memberService from '../services/memberService';
import * as attendanceService from '../services/attendanceService';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [members, setMembers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    memberService.getAll().then(data => { if (mounted) setMembers(data || []); }).catch(console.error);
    attendanceService.getAll().then(data => { if (mounted) setAttendances(data || []); }).catch(console.error);
    return () => { mounted = false; };
  }, []);

  const totalMembers = members.length;
  const activeMembers = members.filter(m => (m.status || 'Active') === 'Active').length;

  const today = new Date().toISOString().split('T')[0];
  const attendanceToday = attendances.filter(a => (a.service_date || a.serviceDate || '').toString().startsWith(today) || (a.serviceDate === today)).length;

  const recentAttendance = attendances.slice(0, 5);
  const recentMembers = members.slice(0, 5);

  const handleAddMember = async (payload) => {
    try {
      const created = await memberService.create(payload);
      setMembers(prev => [created, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Add member failed', err);
      alert('Failed to add member');
    }
  };

  const populateSampleAttendance = async () => {
    const sample = [
      { attendance_code: `ATT-${Date.now()-300000}`, memberName: 'John Doe', member_member_code: 'CH-2025-0001', service_date: today, serviceType: 'Sunday Service', group_name: 'Choir', department: 'Choir', status: 'Present' },
      { attendance_code: `ATT-${Date.now()-200000}`, memberName: 'Mary Smith', member_member_code: 'CH-2025-0002', service_date: today, serviceType: 'Sunday Service', group_name: 'Youth Group', department: 'Children Ministry', status: 'Late' }
    ];

    try {
      await Promise.all(sample.map(s => attendanceService.create(s)));
      const all = await attendanceService.getAll();
      setAttendances(all || []);
    } catch (err) {
      console.error('Populate failed', err);
      alert('Failed to populate sample attendance');
    }
  };

  return (
    <div className="page-content dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Overview of church operations</p>
        </div>
        <div className="connection-status">
          <span className={`status ${isSupabaseEnabled() ? 'online' : 'offline'}`}></span>
          <small>{isSupabaseEnabled() ? 'Connected to Supabase' : 'Local mode'}</small>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-users"></i>
          <div>
            <h4>Total Members</h4>
            <p>{totalMembers}</p>
          </div>
        </div>

        <div className="stat-card present">
          <i className="fas fa-user-check"></i>
          <div>
            <h4>Active Members</h4>
            <p>{activeMembers}</p>
          </div>
        </div>

        <div className="stat-card absent">
          <i className="fas fa-calendar-day"></i>
          <div>
            <h4>Attendance Today</h4>
            <p>{attendanceToday}</p>
          </div>
        </div>


      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <h3>Recent Attendance</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Service Date</th>
                  <th>Type</th>
                  <th>Group</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.length === 0 && (
                  <tr><td colSpan="5" style={{textAlign:'center', color:'#999'}}>No attendance records yet</td></tr>
                )}
                {recentAttendance.map(r => (
                  <tr key={r.id || r.attendance_code}>
                    <td>{r.memberName || r.member_name || 'N/A'}</td>
                    <td>{r.service_date || r.serviceDate || 'N/A'}</td>
                    <td>{r.service_type || r.serviceType || 'N/A'}</td>
                    <td>{r.group_name || r.group || 'N/A'}</td>
                    <td><span className={`status-badge ${r.status?.toLowerCase()}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel quick-panel">
          <h3>Quick Actions</h3>
          <div className="quick-actions" style={{ marginTop: 8 }}>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add Member</button>
            <button className="btn" onClick={() => navigate('/attendance')}>Record Attendance</button>
            <button className="btn" onClick={populateSampleAttendance}>Populate Attendance</button>
          </div>
        </div>

        <div className="panel">
          <h3>Recent Members</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Group</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.length === 0 && (
                  <tr><td colSpan="4" style={{textAlign:'center', color:'#999'}}>No members yet</td></tr>
                )}
                {recentMembers.map(m => (
                  <tr key={m.id || m.member_code}>
                    <td>{m.first_name || m.firstName || m.full_name || `${m.first_name} ${m.last_name}`}</td>
                    <td>{m.email || 'N/A'}</td>
                    <td>{m.group || m.group_name || 'N/A'}</td>
                    <td>{m.status || 'Active'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddMemberModal onClose={() => setShowAddModal(false)} onSave={handleAddMember} members={members} />
      )}
    </div>
  );
}
