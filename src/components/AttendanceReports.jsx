import React from 'react';

function AttendanceReports() {
  const [attendances, setAttendances] = React.useState([]);
  const [filterDate, setFilterDate] = React.useState('');
  const [filterServiceType, setFilterServiceType] = React.useState('');

  React.useEffect(() => {
    const saved = localStorage.getItem('churchAttendance');
    if (saved) {
      setAttendances(JSON.parse(saved));
    }
  }, []);

  const filtered = attendances.filter(a => {
    const matchDate = !filterDate || a.serviceDate === filterDate;
    const matchType = !filterServiceType || a.serviceType === filterServiceType;
    return matchDate && matchType;
  });

  const serviceTypes = [...new Set(attendances.map(a => a.serviceType).filter(Boolean))];
  const groups = [...new Set(attendances.map(a => a.group).filter(Boolean))];
  const depts = [...new Set(attendances.map(a => a.department).filter(Boolean))];

  // Summary by service type
  const summaryByService = serviceTypes.map(service => {
    const records = filtered.filter(a => a.serviceType === service);
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
    const records = filtered.filter(a => a.group === group);
    return {
      group,
      total: records.length,
      present: records.filter(a => a.status === 'Present').length,
      attendanceRate: records.length ? Math.round((records.filter(a => a.status === 'Present').length / records.length) * 100) : 0
    };
  });

  // Summary by department
  const summaryByDept = depts.map(dept => {
    const records = filtered.filter(a => a.department === dept);
    return {
      dept,
      total: records.length,
      present: records.filter(a => a.status === 'Present').length,
      attendanceRate: records.length ? Math.round((records.filter(a => a.status === 'Present').length / records.length) * 100) : 0
    };
  });

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Attendance Reports & Summaries</h2>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="filterDate">Filter by Service Date:</label>
          <input 
            type="date" 
            id="filterDate"
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filterService">Filter by Service Type:</label>
          <select 
            id="filterService"
            className="form-control" 
            value={filterServiceType}
            onChange={(e) => setFilterServiceType(e.target.value)}
          >
            <option value="">All Services</option>
            {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

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
              {summaryByService.map((s, idx) => (
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
              ))}
            </tbody>
          </table>
        </div>
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
              {summaryByGroup.map((g, idx) => (
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
              ))}
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
              {summaryByDept.map((d, idx) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AttendanceReports;
