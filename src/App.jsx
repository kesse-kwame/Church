import React, { useState } from 'react';
import AdminDashboard from './Components/AdminDashboard';
import Login from './Components/Login';
import MemberHome from './Components/MemberHome';

const App = () => {
  const [session, setSession] = useState(null);

  const handleAuth = (authResult) => {
    setSession(authResult);
  };

  const handleLogout = () => {
    setSession(null);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Login onAuth={handleAuth} />
      </div>
    );
  }

  if (session.role === 'admin') {
    return (
      <div className="min-h-screen">
        <div className="bg-white shadow px-4 py-2 flex justify-between items-center">
          <div className="font-semibold text-blue-600">Admin Session</div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
          >
            Log out
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <MemberHome onLogout={handleLogout} user={session} />
  );
};

export default App;
