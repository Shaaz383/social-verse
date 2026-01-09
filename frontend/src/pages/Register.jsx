import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/register', formData);
      if (response.data.success) {
        navigate('/profile'); // Redirect to profile after register (auto login)
      }
    } catch (error) {
      console.error(error);
      alert('Registration failed');
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-5 px-4">
        <img className="w-1/2" src="/images/logo.png" alt="logo" />
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
            type="email"
            placeholder="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            className="px-3 mt-2 py-2 border-2 border-zinc-800 rounded-md block w-full bg-zinc-900 text-white"
            type="text"
            placeholder="name"
            name="name"
            value={formData.name}
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
            value={loading ? "Creating Account..." : "Make New Account"}
            disabled={loading}
          />
        </form>
        <span>
          Already have an account ?{' '}
          <Link to="/login" className="text-blue-500">
            Log In
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Register;
