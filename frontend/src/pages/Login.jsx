import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/login', {
        username: formData.username.trim(),
        password: formData.password
      });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        navigate('/profile');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-5 px-4">
        <img className="w-1/2" src="/images/logo.png" alt="logo" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <form className="w-full" onSubmit={handleSubmit}>
          <input
            className="px-3 mt-2 py-2 border-2 border-zinc-800 rounded-md block w-full bg-zinc-900 text-white"
            type="text"
            placeholder="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            className="px-3 mt-2 py-2 border-2 border-zinc-800 rounded-md block w-full bg-zinc-900 text-white"
            type="password"
            placeholder="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            className={`w-full bg-blue-500 px-3 py-3 rounded-md mt-2 cursor-pointer text-white font-semibold ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            type="submit"
            value={loading ? "Logging in..." : "Log In"}
            disabled={loading}
          />
        </form>
        <Link to="/forgot" className="text-sm text-gray-400 mt-2">
          Forgot Password?
        </Link>
        <span>
          Don't have an account ?{' '}
          <Link to="/" className="text-blue-500">
            Sign Up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Login;
