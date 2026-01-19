import React, { useMemo, useState } from 'react';

const Login = ({ onAuth }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('member');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    [],
  );
  const inviteCode = import.meta.env.VITE_ADMIN_INVITE_CODE;

  const resetStatus = () => {
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetStatus();

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!isLoginMode && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!isLoginMode && role === 'admin' && inviteCode && adminCode !== inviteCode) {
      setError('Invalid admin invite code.');
      return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        const res = await fetch(`${apiBase}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to login');
        }
        setMessage('Login successful.');
        onAuth?.({
          email: data.email,
          user_id: data.user_id,
          role: data.role,
          access_token: data.access_token,
        });
      } else {
        const res = await fetch(`${apiBase}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            role,
            admin_code: adminCode || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to sign up');
        }
        setMessage('Account created. You can now log in.');
        setIsLoginMode(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[430px] p-8 rounded-2xl shadow-lg border border-gray-300 bg-white">
      <div className="flex justify-center mb-4">
        <h1 className="text-3xl font-bold">Welcome to ChurchSuite</h1>
      </div>
      <div className="flex justify-center mb-4">
        <h2 className="text-3xl font-semibold text-center">
          {isLoginMode ? 'Login' : 'Sign Up'}
        </h2>
      </div>
      <div className="relative flex h-12 mb-6 border border-gray-300 rounded-full overflow-hidden">
        <button
          onClick={() => { setIsLoginMode(true); resetStatus(); }}
          className={`w-1/2 text-lg font-medium transition-all z-10 ${isLoginMode ? 'text-white' : 'text-black'}`}
        >
          Login
        </button>
        <button
          onClick={() => { setIsLoginMode(false); resetStatus(); }}
          className={`w-1/2 text-lg font-medium transition-all z-10 ${!isLoginMode ? 'text-white' : 'text-black'}`}
        >
          Sign Up
        </button>
        <div
          className={`absolute top-0 h-full w-1/2 rounded-full bg-blue-500 transition-all duration-300 ease-in-out ${
            isLoginMode ? 'left-0' : 'left-1/2'
          }`}
        />
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLoginMode && (
          <input
            type="text"
            placeholder="Full name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-blue-200 placeholder-gray-400"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-blue-200 placeholder-gray-400"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-blue-200 placeholder-gray-400"
        />
        {!isLoginMode && (
          <>
            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-blue-200 placeholder-gray-400"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-blue-200"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {role === 'admin' && inviteCode && (
              <input
                type="text"
                placeholder="Admin invite code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-blue-200 placeholder-gray-400"
              />
            )}
          </>
        )}

        {isLoginMode && (
          <div className="text-left">
            <p className="text-blue-500 hover:underline">Forgot Password?</p>
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-blue-500 text-white rounded-full text-lg font-medium hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? 'Please wait...' : isLoginMode ? 'Login' : 'Sign Up'}
        </button>
        {isLoginMode && (
          <div>
            <p className="text-gray-400 text-sm">
              Login as Admin or Member to access different features
            </p>
          </div>
        )}
        <p className="text-center text-gray-600">
          {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
          <button
            type="button"
            onClick={() => { setIsLoginMode(!isLoginMode); resetStatus(); }}
            className="text-blue-500 hover:underline ml-1"
          >
            {isLoginMode ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
