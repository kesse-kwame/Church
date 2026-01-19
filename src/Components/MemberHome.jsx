import React from 'react';

const MemberHome = ({ onLogout, user }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Welcome, member!</h1>
        <p className="text-gray-700 mb-4">
          You are signed in as <span className="font-semibold">{user?.email}</span>.
        </p>
        <p className="text-gray-600 mb-6">
          Member access is limited. Contact an administrator if you need elevated permissions.
        </p>
        <button
          onClick={onLogout}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default MemberHome;
