import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MembersPage from './pages/MembersPage';
import AttendancePage from './pages/AttendancePage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/members" element={<MembersPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<div className="page-content"><h1>Settings</h1><p>Settings page coming soon</p></div>} />
          <Route path="*" element={<Navigate to="/members" replace />} />
        </Routes>
      </main>
    </div>
  );
}