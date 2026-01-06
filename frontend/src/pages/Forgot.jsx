import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/forgot', { email });
      setMessage('Check your console for the token (Dev mode) or email.');
      setError('');
      console.log('Reset Token:', response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setMessage('');
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-5 px-4">
        <img className="w-1/2" src="/images/logo.png" alt="logo" />
        
        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}

        <form className="w-full" onSubmit={handleSubmit}>
          <input
            className="px-3 mt-2 py-2 border-2 border-zinc-800 rounded-md block w-full bg-zinc-900 outline-none text-white"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full bg-blue-500 px-3 py-3 rounded-md mt-2 cursor-pointer"
            type="submit"
            value="Reset Password"
          />
        </form>

        <span>
          Remember your password?{' '}
          <Link to="/login" className="text-blue-500">
            Log In
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Forgot;
