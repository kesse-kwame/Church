import React, { useState, useEffect, useRef } from 'react';
import * as attendanceService from '../services/attendanceService';

function Attendance() {
  const [attendances, setAttendances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    memberName: '',
    memberId: '',
    serviceDate: new Date().toISOString().split('T')[0],
    serviceType: 'Morning Service',
    department: '',
    status: 'Present',
  });

  const formRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    attendanceService
      .getAll()
      .then((data) => {
        if (mounted) setAttendances(data || []);
      })
      .catch((err) => console.error('Load attendance error', err));
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newRecord = {
      attendance_code: `ATT-${Date.now()}`,
      ...formData,
      created_at: new Date().toISOString(),
    };

    try {
      const created = await attendanceService.create(newRecord);
      setAttendances((prev) => [created, ...prev]);
      setFormData({
        memberName: '',
        memberId: '',
        serviceDate: new Date().toISOString().split('T')[0],
        serviceType: 'Morning Service',
        department: '',
        status: 'Present',
      });
      setShowForm(false);
    } catch (err) {
      console.error('Save attendance failed', err);
      alert('Failed to save attendance (check console)');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredAttendances = attendances
    .filter((record) => {
      const matchesDate = !selectedDate || record.serviceDate === selectedDate;
      const matchesSession =
        selectedSession === 'all' ||
        (record.serviceType || '').toLowerCase() === selectedSession.toLowerCase();
      const matchesDept =
        selectedDept === 'all' ||
        (record.department || '').toLowerCase() === selectedDept.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (record.memberName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.memberId || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSession && matchesDept && matchesSearch;
    })
    .sort((a, b) => {
      const aDate = new Date(a.created_at || a.serviceDate || 0).getTime();
      const bDate = new Date(b.created_at || b.serviceDate || 0).getTime();
      return bDate - aDate;
    });

  const deptOptions = [
    'All Departments',
    ...new Set(attendances.map((a) => a.department).filter(Boolean)),
  ];

  const sessionOptions = [
    'All Sessions',
    'Morning Service',
    'Youth Group',
    'Evening Service',
    ...new Set(attendances.map((a) => a.serviceType).filter(Boolean)),
  ].filter((v, idx, arr) => arr.indexOf(v) === idx);

  const handleCheckInClick = () => {
    setShowForm(true);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const input = formRef.current.querySelector('input');
        if (input) input.focus();
      }
    }, 50);
  };

  return (
    <div className="attendance-screen">
      <div className="page-header-row">
        <div>
          <h1>Attendance Management</h1>
        </div>
      </div>

      <div className="attendance-card">
        <h3 className="card-title">Attendance Selection &amp; Filters</h3>
        <div className="filter-grid">
          <div className="form-group compact">
            <label>Select Date</label>
            <div className="input-with-icon">
              <i className="far fa-calendar"></i>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group compact">
            <label>Select Session</label>
            <div className="select-wrapper">
              <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
                {sessionOptions.map((opt) => (
                  <option key={opt} value={opt === 'All Sessions' ? 'all' : opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
          <div className="form-group compact">
            <label>Filter by Department</label>
            <div className="select-wrapper">
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                {deptOptions.map((opt) => (
                  <option key={opt} value={opt === 'All Departments' ? 'all' : opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary">Apply Filters</button>
          </div>
        </div>
      </div>

      <div className="attendance-card">
        <div className="card-head-row">
          <h3 className="card-title">Member Check-in</h3>
        </div>
        <div className="checkin-row">
          <div className="search-field large">
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="Search by member name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleCheckInClick}>
            Check In Member
          </button>
        </div>

        {showForm && (
          <div className="form-section soft" ref={formRef}>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="memberName">Member Name *</label>
                  <input
                    type="text"
                    id="memberName"
                    name="memberName"
                    className="form-control"
                    required
                    value={formData.memberName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="memberId">Member ID</label>
                  <input
                    type="text"
                    id="memberId"
                    name="memberId"
                    className="form-control"
                    value={formData.memberId}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="serviceDate">Service Date *</label>
                  <input
                    type="date"
                    id="serviceDate"
                    name="serviceDate"
                    className="form-control"
                    required
                    value={formData.serviceDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="serviceType">Session *</label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    className="form-control"
                    required
                    value={formData.serviceType}
                    onChange={handleChange}
                  >
                    <option value="Morning Service">Morning Service</option>
                    <option value="Youth Group">Youth Group</option>
                    <option value="Evening Service">Evening Service</option>
                    <option value="Midweek Service">Midweek Service</option>
                    <option value="Prayer Meeting">Prayer Meeting</option>
                    <option value="Bible Study">Bible Study</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select department</option>
                    <option value="Worship Team">Worship Team</option>
                    <option value="Youth Ministry">Youth Ministry</option>
                    <option value="Admin">Admin</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Children's Ministry">Children's Ministry</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Attendance Status *</label>
                  <select
                    id="status"
                    name="status"
                    className="form-control"
                    required
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginRight: '10px' }}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        )}

        <h4 className="section-title">Recently Checked-in</h4>
        <div className="recent-table">
          <table>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Session</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.length > 0 ? (
                filteredAttendances.map((record) => (
                  <tr key={record.id || record.attendance_code}>
                    <td>{record.memberName || 'Unknown Member'}</td>
                    <td>{record.serviceType || '—'}</td>
                    <td>{formatTime(record.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: '#6b7280', padding: '18px' }}>
                    No recent check-ins yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="attendance-card reports-card">
        <h3 className="card-title">Attendance Reports &amp; Export</h3>
        <p className="muted" style={{ marginBottom: 16 }}>
          Summary for selected date/session
        </p>

        <div className="reports-summary-row">
          <div className="summary-tile">
            <div className="summary-icon">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="summary-metric">
              <span className="summary-label">Total Present</span>
              <span className="summary-value">
                {
                  filteredAttendances.filter(
                    (r) => (r.status || '').toLowerCase() === 'present',
                  ).length
                }
              </span>
            </div>
          </div>

          <div className="summary-tile">
            <div className="summary-icon warning">
              <i className="fas fa-bell"></i>
            </div>
            <div className="summary-metric">
              <span className="summary-label">Expected Attendance</span>
              <span className="summary-value">
                {filteredAttendances.length || 0}
              </span>
            </div>
          </div>

          <div className="summary-tile">
            <div className="summary-icon danger">
              <i className="fas fa-clock"></i>
            </div>
            <div className="summary-metric">
              <span className="summary-label">Absence Rate</span>
              <span className="summary-value">
                {(() => {
                  const total = filteredAttendances.length || 0;
                  if (!total) return '0%';
                  const absent = filteredAttendances.filter(
                    (r) => (r.status || '').toLowerCase() === 'absent',
                  ).length;
                  return `${Math.round((absent / total) * 100)}%`;
                })()}
              </span>
            </div>
          </div>
        </div>

        <div className="export-row">
          <span className="export-label">Export Options</span>
          <div className="export-actions">
            <button className="btn btn-outline">
              <i className="fas fa-file-csv" />
              Export Summary (CSV)
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-file-pdf" />
              Export Detailed (PDF)
            </button>
            <button className="btn btn-primary">
              <i className="fas fa-chart-bar" />
              Generate Custom Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
