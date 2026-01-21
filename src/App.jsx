import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MembersPage from './pages/MembersPage';
import AttendancePage from './pages/AttendancePage';
import DashboardPage from './pages/DashboardPage';
import OnlineRegistrationPage from './pages/OnlineRegistrationPage';
import './App.css';

const PlaceholderPage = ({ title }) => (
  <div className="page-shell">
    <h1>{title}</h1>
    <p className="muted">Content coming soon.</p>
  </div>
);

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="brand">
            <div className="brand-icon">
              <i className="fas fa-church"></i>
            </div>
            <div className="brand-copy">
              <span className="brand-name">ChurchSuite</span>
              <small>Membership Portal</small>
            </div>
          </div>

          <div className="top-actions">
            <button className="icon-btn" aria-label="Notifications">
              <i className="far fa-bell"></i>
            </button>
            <div className="avatar-pill">
              <div className="avatar-dot" />
              <span className="avatar-name">Hi, Admin</span>
              <div className="avatar-circle">
                <i className="far fa-user"></i>
              </div>
            </div>
          </div>
        </header>

        <main className="content-area">
          <Routes>
            <Route path="/members" element={<MembersPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/register" element={<OnlineRegistrationPage />} />
            <Route path="/finances" element={<PlaceholderPage title="Finances" />} />
            <Route path="/programs" element={<PlaceholderPage title="Programs & Events" />} />
            <Route path="/staff" element={<PlaceholderPage title="Staff & Payroll" />} />
            <Route path="/settings" element={<div className="page-content"><h1>Settings</h1><p>Settings page coming soon</p></div>} />
            <Route path="*" element={<Navigate to="/members" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}