import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const SavedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get('/saved-posts');
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white">
      <div className="w-full px-4 py-3 flex items-center gap-4 sticky top-0 bg-zinc-900 z-10 border-b border-zinc-800">
        <Link to="/profile">
          <i className="ri-arrow-left-line text-xl"></i>
        </Link>
        <h1 className="text-lg font-semibold">Saved</h1>
      </div>

      <div className="p-1">
        {loading ? (
          <div className="flex justify-center mt-10">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center mt-20 text-zinc-500">
            <div className="w-20 h-20 border-2 border-zinc-700 rounded-full flex items-center justify-center mb-4">
              <i className="ri-bookmark-line text-4xl"></i>
            </div>
            <p>No saved posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <div key={post._id} className="aspect-square bg-zinc-800 relative overflow-hidden group">
                 <img src={post.picture} alt="" className="w-full h-full object-cover" />
                 <Link to={`/feed`} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"></Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPosts;
