import React, { useState, useEffect, useRef } from 'react';
import * as attendanceService from '../services/attendanceService';

function Attendance() {
  const [attendances, setAttendances] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [activeTab, setActiveTab] = useState('tracking');
  const [formData, setFormData] = useState({
    memberName: '',
    memberId: '',
    serviceDate: new Date().toISOString().split('T')[0],
    serviceType: '',
    group: '',
    department: '',
    status: 'Present'
  });

  const formRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    attendanceService.getAll().then(data => {
      if (mounted) setAttendances(data || []);
    }).catch(err => console.error('Load attendance error', err));
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newRecord = {
      attendance_code: `ATT-${Date.now()}`,
      ...formData,
      created_at: new Date().toISOString()
    };

    try {
      const created = await attendanceService.create(newRecord);
      // supabase returns created row with id; local fallback returns provided record
      setAttendances(prev => [created, ...prev]);
      setFormData({
        memberName: '',
        memberId: '',
        serviceDate: new Date().toISOString().split('T')[0],
        serviceType: '',
        group: '',
        department: '',
        status: 'Present'
      });
      setShowForm(false);
    } catch (err) {
      console.error('Save attendance failed', err);
      alert('Failed to save attendance (check console)');
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await attendanceService.remove(id);
      setAttendances(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Delete attendance failed', err);
      alert('Failed to delete attendance (check console)');
    }
  };

  const clearAttendance = async () => {
    if (!attendances || attendances.length === 0) {
      alert('There are no attendance records to clear.');
      return;
    }

    if (!window.confirm('Clear all attendance records? This cannot be undone.')) return;

    try {
      await attendanceService.clearAll();
      setAttendances([]);
      alert('All attendance records have been cleared.');
    } catch (err) {
      console.error('Clear attendance failed', err);
      alert('Failed to clear attendance (check console)');
    }
  };

  const filteredAttendances = attendances.filter(a => {
    const matchSearch = a.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        a.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = !filterGroup || a.group === filterGroup;
    const matchDept = !filterDept || a.department === filterDept;
    return matchSearch && matchGroup && matchDept;
  });

  const groups = [...new Set(attendances.map(a => a.group).filter(Boolean))];
  const depts = [...new Set(attendances.map(a => a.department).filter(Boolean))];
  const serviceTypes = [...new Set(attendances.map(a => a.serviceType).filter(Boolean))];

  const stats = {
    total: filteredAttendances.length,
    present: filteredAttendances.filter(a => a.status === 'Present').length,
    absent: filteredAttendances.filter(a => a.status === 'Absent').length,
    late: filteredAttendances.filter(a => a.status === 'Late').length
  };

  // Summary by service type
  const summaryByService = serviceTypes.map(service => {
    const records = filteredAttendances.filter(a => a.serviceType === service);
    return {
      service,
      total: records.length,
      present: records.filter(a => a.status === 'Present').length,
      absent: records.filter(a => a.status === 'Absent').length,
      late: records.filter(a => a.status === 'Late').length,
      attendanceRate: records.length ? Math.round((records.filter(a => a.status === 'Present').length / records.length) * 100) : 0
    };
  });

  // Summary by group
  const summaryByGroup = groups.map(group => {
    const records = filteredAttendances.filter(a => a.group === group);
    return {
      group,
      total: records.length,
      present: records.filter(a => a.status === 'Present').length,
      attendanceRate: records.length ? Math.round((records.filter(a => a.status === 'Present').length / records.length) * 100) : 0
    };
  });

  // Summary by department
  const summaryByDept = depts.map(dept => {
    const records = filteredAttendances.filter(a => a.department === dept);
    return {
      dept,
      total: records.length,
      present: records.filter(a => a.status === 'Present').length,
      attendanceRate: records.length ? Math.round((records.filter(a => a.status === 'Present').length / records.length) * 100) : 0
    };
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const populateSampleData = async () => {
    const sample = [
      { attendance_code: `ATT-${Date.now()-300000}`, memberName: 'John Doe', member_member_code: 'CH-2025-0001', serviceDate: '2026-01-04', serviceType: 'Sunday Service', group_name: 'Choir', department: 'Choir', status: 'Present' },
      { attendance_code: `ATT-${Date.now()-200000}`, memberName: 'Mary Smith', member_member_code: 'CH-2025-0002', serviceDate: '2026-01-04', serviceType: 'Sunday Service', group_name: 'Youth Group', department: 'Children Ministry', status: 'Late' },
      { attendance_code: `ATT-${Date.now()-100000}`, memberName: 'Peter Johnson', member_member_code: 'CH-2025-0003', serviceDate: '2026-01-04', serviceType: 'Sunday Service', group_name: 'Ushers', department: 'Ushers', status: 'Absent' }
    ];

    try {
      const created = await Promise.all(sample.map(s => attendanceService.create({ ...s, created_at: new Date().toISOString() })));
      // ensure we refresh local state
      const all = await attendanceService.getAll();
      setAttendances(all || []);
    } catch (err) {
      console.error('Populate sample data failed', err);
      alert('Failed to populate sample data (check console)');
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h2>Attendance Management</h2>
        <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
          <button className="btn btn-danger" onClick={clearAttendance} disabled={attendances.length === 0} title="Clear all attendance records">Clear Attendance</button>
          <button className="btn btn-primary" onClick={() => { setActiveTab('tracking'); setShowForm(true); setTimeout(() => { if (formRef.current) { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); const input = formRef.current.querySelector('input'); if (input) input.focus(); } }, 70); }}>
            <i className="fas fa-plus"></i> Record Attendance
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          <i className="fas fa-clipboard-list"></i> Attendance Tracking
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <i className="fas fa-chart-bar"></i> Reports & Summaries
        </button>
      </div>

      {/* Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="tab-content active">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <i className="fas fa-chart-line"></i>
              <div>
                <h4>Total Attendance</h4>
                <p>{stats.total}</p>
              </div>
            </div>
            <div className="stat-card present">
              <i className="fas fa-check-circle"></i>
              <div>
                <h4>Present</h4>
                <p>{stats.present}</p>
              </div>
            </div>
            <div className="stat-card absent">
              <i className="fas fa-times-circle"></i>
              <div>
                <h4>Absent</h4>
                <p>{stats.absent}</p>
              </div>
            </div>
            <div className="stat-card late">
              <i className="fas fa-clock"></i>
              <div>
                <h4>Late</h4>
                <p>{stats.late}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="form-section" ref={formRef}>
              <h3>Record Attendance</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="memberName">Member Name *</label>
                    <input type="text" id="memberName" name="memberName" className="form-control" required value={formData.memberName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="memberId">Member ID</label>
                    <input type="text" id="memberId" name="memberId" className="form-control" value={formData.memberId} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="serviceDate">Service Date *</label>
                    <input type="date" id="serviceDate" name="serviceDate" className="form-control" required value={formData.serviceDate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="serviceType">Service Type *</label>
                    <select id="serviceType" name="serviceType" className="form-control" required value={formData.serviceType} onChange={handleChange}>
                      <option value="">Select service</option>
                      <option value="Sunday Service">Sunday Service</option>
                      <option value="Midweek Service">Midweek Service</option>
                      <option value="Prayer Meeting">Prayer Meeting</option>
                      <option value="Bible Study">Bible Study</option>
                      <option value="Youth Service">Youth Service</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="group">Group</label>
                    <select id="group" name="group" className="form-control" value={formData.group} onChange={handleChange}>
                      <option value="">Select group</option>
                      <option value="Youth Group">Youth Group</option>
                      <option value="Women's Fellowship">Women's Fellowship</option>
                      <option value="Men's Prayer">Men's Prayer</option>
                      <option value="Sunday School">Sunday School</option>
                      <option value="Choir">Choir</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <select id="department" name="department" className="form-control" value={formData.department} onChange={handleChange}>
                      <option value="">Select department</option>
                      <option value="Ushers">Ushers</option>
                      <option value="Choir">Choir</option>
                      <option value="Audio/Visual">Audio/Visual</option>
                      <option value="Children Ministry">Children Ministry</option>
                      <option value="Hospitality">Hospitality</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Attendance Status *</label>
                  <select id="status" name="status" className="form-control" required value={formData.status} onChange={handleChange}>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </div>

                <div style={{textAlign: 'right', marginTop: '15px'}}>
                  <button type="button" className="btn" style={{marginRight: '10px'}} onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Attendance</button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="filter-section">
            <div className="filter-group">
              <input 
                type="text" 
                placeholder="Search by member name or ID..." 
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <select className="form-control" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
                <option value="">All Groups</option>
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <select className="form-control" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="">All Departments</option>
                {depts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member Name</th>
                  <th>Service Date</th>
                  <th>Service Type</th>
                  <th>Group</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendances.map(record => (
                  <tr key={record.id}>
                    <td><small>{record.id}</small></td>
                    <td>{record.memberName}</td>
                    <td>{formatDate(record.serviceDate)}</td>
                    <td>{record.serviceType}</td>
                    <td>{record.group || 'N/A'}</td>
                    <td>{record.department || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-sm btn-delete" title="Delete" onClick={() => deleteRecord(record.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAttendances.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-inbox fa-3x"></i>
                <h4>No Records Found</h4>
                <p>Start recording attendance to see records here</p>
                <div style={{marginTop: 12}}>
                  <button className="btn btn-primary" onClick={() => { setShowForm(true); setActiveTab('tracking'); setTimeout(() => { if (formRef.current) { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); const input = formRef.current.querySelector('input'); if (input) input.focus(); } }, 70); }}>Record Attendance</button>
                  <button className="btn" style={{marginLeft: 10}} onClick={populateSampleData}>Populate sample data</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="tab-content active">
          {/* Service Type Summary */}
          <div className="report-section">
            <h3><i className="fas fa-church"></i> Service Type Summary</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Service Type</th>
                    <th>Total Attendance</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryByService.length > 0 ? summaryByService.map((s, idx) => (
                    <tr key={idx}>
                      <td><strong>{s.service}</strong></td>
                      <td>{s.total}</td>
                      <td className="present">{s.present}</td>
                      <td className="absent">{s.absent}</td>
                      <td className="late">{s.late}</td>
                      <td>
                        <div className="rate-bar">
                          <div className="rate-fill" style={{width: `${s.attendanceRate}%`}}></div>
                          <span>{s.attendanceRate}%</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', color: '#999'}}>No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {summaryByService.length === 0 && (
              <div style={{padding: 16, textAlign: 'center'}}>
                <button className="btn btn-primary" onClick={populateSampleData}>Populate sample data</button>
              </div>
            )}
          </div>

          {/* Group Summary */}
          <div className="report-section">
            <h3><i className="fas fa-users"></i> Attendance by Group</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Total Attendance</th>
                    <th>Present</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryByGroup.length > 0 ? summaryByGroup.map((g, idx) => (
                    <tr key={idx}>
                      <td><strong>{g.group}</strong></td>
                      <td>{g.total}</td>
                      <td className="present">{g.present}</td>
                      <td>
                        <div className="rate-bar">
                          <div className="rate-fill" style={{width: `${g.attendanceRate}%`}}></div>
                          <span>{g.attendanceRate}%</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', color: '#999'}}>No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Summary */}
          <div className="report-section">
            <h3><i className="fas fa-briefcase"></i> Attendance by Department</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Attendance</th>
                    <th>Present</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryByDept.length > 0 ? summaryByDept.map((d, idx) => (
                    <tr key={idx}>
                      <td><strong>{d.dept}</strong></td>
                      <td>{d.total}</td>
                      <td className="present">{d.present}</td>
                      <td>
                        <div className="rate-bar">
                          <div className="rate-fill" style={{width: `${d.attendanceRate}%`}}></div>
                          <span>{d.attendanceRate}%</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', color: '#999'}}>No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;
