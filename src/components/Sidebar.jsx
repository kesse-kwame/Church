import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <i className="fas fa-church"></i>
          {!isCollapsed && <span>Church Management</span>}
        </div>
        <button className="toggle-btn" onClick={toggleSidebar} title="Toggle sidebar">
          <i className={`fas fa-${isCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <i className="fas fa-home"></i>
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        <Link to="/members" title="Members" className={`nav-item ${isActive('/members') ? 'active' : ''}`}>
          <i className="fas fa-user-friends"></i>
          {!isCollapsed && <span>Members</span>}
        </Link>

        <Link to="/attendance" title="Attendance" className={`nav-item ${isActive('/attendance') ? 'active' : ''}`}>
          <i className="fas fa-calendar-check"></i>
          {!isCollapsed && <span>Attendance</span>}
        </Link>

        <Link to="/finances" title="Finances" className={`nav-item ${isActive('/finances') ? 'active' : ''}`}>
          <i className="fas fa-wallet"></i>
          {!isCollapsed && <span>Finances</span>}
        </Link>

        <Link to="/programs" title="Programs & Events" className={`nav-item ${isActive('/programs') ? 'active' : ''}`}>
          <i className="fas fa-calendar-alt"></i>
          {!isCollapsed && <span>Programs & Events</span>}
        </Link>

        <Link to="/staff" title="Staff & Payroll" className={`nav-item ${isActive('/staff') ? 'active' : ''}`}>
          <i className="fas fa-briefcase"></i>
          {!isCollapsed && <span>Staff & Payroll</span>}
        </Link>
      </nav>

      <div className="sidebar-footer">
        <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
          <i className="fas fa-cog"></i>
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <button className="logout-btn" title="Logout">
          <i className="fas fa-sign-out-alt"></i>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
