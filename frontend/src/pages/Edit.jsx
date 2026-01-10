import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { API_URL } from '../api';
import Navbar from '../components/Navbar';

const Edit = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/profile');
        setUser(response.data.user);
        setFormData({
          username: response.data.user.username,
          name: response.data.user.name,
          bio: response.data.user.bio || ''
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('username', formData.username);
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    if (file) {
      data.append('image', file);
    }

    try {
      await api.post('/update', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/profile');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5">
      <div className="flex justify-between items-center px-4">
        <Link className="text-sm text-blue-500" to="/profile">
          <i className="ri-arrow-left-s-line"></i> profile
        </Link>
        <h2 className="leading-none text-sm">Edit Profile</h2>
        <Link className="text-sm" to="/feed">
          <i className="ri-home-line"></i> home
        </Link>
      </div>
      <div className="flex flex-col items-center gap-2 mt-20">
        <div className="image w-20 h-20 bg-sky-100 rounded-full overflow-hidden">
             <img
                className="w-full h-full object-cover"
                src={file ? URL.createObjectURL(file) : (user.profileImage?.startsWith('http') ? user.profileImage : `${API_URL}/images/uploads/${user.profileImage}`)}
                alt=""
              />
        </div>
        <button
          id="editBtn"
          className="text-blue-500 capitalize"
          onClick={() => document.getElementById('imageInput').click()}
        >
          edit picture
        </button>
      </div>
      <div className="gap-5 px-4 mt-10">
        <h3 className="text-lg leading-none">Edit Account Details</h3>
        <hr className="opacity-30 my-3" />
        <form className="w-full" onSubmit={handleSubmit}>
          <input
            type="file"
            hidden
            name="image"
            id="imageInput"
            onChange={handleFileChange}
          />
          <input
            className="px-3 mt-2 py-2 border-2 border-zinc-800 rounded-md block w-full bg-zinc-900 outline-none text-white"
            type="text"
            placeholder="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            className="px-3 mt-2 py-2 border-2 border-zinc-800 rounded-md block w-full bg-zinc-900 outline-none text-white"
            type="text"
            placeholder="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <textarea
            className="px-3 mt-2 py-2 border-2 border-zinc-800 rounded-md block w-full bg-zinc-900 resize-none outline-none text-white"
            placeholder="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          ></textarea>
          <input
            className={`w-full px-3 py-3 rounded-md mt-2 cursor-pointer ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500'}`}
            type="submit"
            disabled={loading}
            value={loading ? "Updating..." : "Update Details"}
          />
        </form>
      </div>
      <Navbar user={user} />
    </div>
  );
};

export default Edit;
