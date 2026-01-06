import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const Following = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUser = async () => {
    try {
      const response = await api.get('/profile');
      setUser(response.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleUnfollow = async (username) => {
    try {
      await api.post(`/unfollow/${username}`);
      fetchUser();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  const filteredFollowing = user.following.filter(followed => 
    followed.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-zinc-900 px-4 py-5 mb-16">
      <div className="border-2 border-zinc-800 flex items-center justify-between px-2 py-1 rounded-md">
        <i className="text-white ri-search-line"></i>
        <input
          className="ml-1 w-full bg-zinc-900 outline-none text-zinc-400"
          type="text"
          placeholder="search username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <h1 className="text-white mt-5">Following</h1>
      <div className="users">
        {filteredFollowing.map((followed) => (
          <div key={followed._id} className="flex items-center justify-between gap-2 mt-5">
            <Link to={`/userprofile/${followed.username}`} className="outline-none flex-grow">
              <div className="text-white flex items-center gap-2">
                <div className="image w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={followed.profileImage?.startsWith('http') ? followed.profileImage : `http://localhost:3000/images/uploads/${followed.profileImage}`}
                    alt=""
                  />
                </div>
                <div className="text">
                  <h3>{followed.username}</h3>
                  <h4 className="text-sm opacity-60 leading-none">{followed.name}</h4>
                </div>
              </div>
            </Link>
            <button onClick={() => handleUnfollow(followed.username)} className="px-4 py-1 bg-white text-zinc-900 rounded">Unfollow</button>
          </div>
        ))}
      </div>
      <Navbar user={user} />
    </div>
  );
};

export default Following;
