import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const Upload = () => {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/profile');
        setUser(response.data.user);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption);

    try {
      await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/feed');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5">
      <div className="flex justify-between items-center px-4">
        <Link className="text-sm text-blue-500" to="/profile">
          <i className="ri-arrow-left-s-line"></i> profile
        </Link>
        <h2 className="leading-none text-sm">Upload Post</h2>
        <Link className="text-sm" to="/feed">
          <i className="ri-home-line"></i> home
        </Link>
      </div>
      <div className="flex flex-col items-center gap-2 mt-20">
        <div className="image w-[25vw] h-[25vw] rounded-full border-2 border-zinc-800 flex items-center justify-center overflow-hidden">
          {file ? (
            <img
              className="w-full h-full object-cover"
              src={URL.createObjectURL(file)}
              alt="preview"
            />
          ) : (
            <i className="text-5xl font-light ri-image-line"></i>
          )}
        </div>
        <button
          id="selectpic"
          className="text-blue-500 capitalize"
          onClick={() => document.getElementById('fileInput').click()}
        >
          select picture
        </button>
      </div>
      <form
        id="uploadform"
        className="w-full px-6 py-3 mt-10"
        onSubmit={handleSubmit}
      >
        <input
          id="fileInput"
          hidden
          type="file"
          name="image"
          onChange={handleFileChange}
        />
        <textarea
          name="caption"
          className="px-2 py-1 w-full bg-zinc-900 border-2 h-20 border-zinc-800 resize-none rounded-md outline-none"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        ></textarea>
        <input
          className={`w-full px-2 py-2 rounded-md cursor-pointer ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500'}`}
          type="submit"
          disabled={loading}
          value={loading ? "Uploading..." : "Post"}
        />
      </form>
      <Navbar user={user} />
    </div>
  );
};

export default Upload;
