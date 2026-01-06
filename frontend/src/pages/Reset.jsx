import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Reset = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      await api.post(`/reset/${token}`, { password, confirmPassword });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-5 px-4">
        <img className="w-1/2" src="/images/logo.png" alt="logo" />

        {error && <p className="text-red-500">{error}</p>}

        <form className="w-full" onSubmit={handleSubmit}>
          <input
            className="px-3 mt-2 py-2 border-2 border-zinc-800 rounded-md block w-full bg-zinc-900 outline-none text-white"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="px-3 mt-2 py-2 border-2 border-zinc-800 rounded-md block w-full bg-zinc-900 outline-none text-white"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <input
            className="w-full bg-blue-500 px-3 py-3 rounded-md mt-2 cursor-pointer"
            type="submit"
            value="Reset Password"
          />
        </form>
      </div>
    </div>
  );
};

export default Reset;
