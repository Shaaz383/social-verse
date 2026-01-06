import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/profile');
        setUser(response.data.user);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  if (!user) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5 mb-12">
      <div className="nav flex justify-between items-center px-4">
        <h3 className="text-lg">{user.username}</h3>
        <div className="icons flex gap-5">
          <Link to="/upload">
            <i className="text-[1.4rem] ri-add-box-line"></i>
          </Link>
          <div className="dropdown">
            <i className="text-[1.4rem] ri-menu-line" id="dropdownMenu"></i>
            <div id="dropdownContent">
              <Link to="#">Saved</Link>
              <Link to="/edit">Edit Profile</Link>
              <Link to="/logout" onClick={async (e) => {
                  e.preventDefault();
                  await api.get('/logout');
                  navigate('/login');
              }}>Logout</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center pl-6 pr-[12vw] mt-8">
        <div className="w-[19vw] h-[19vw] bg-sky-100 rounded-full overflow-hidden">
          {user.profileImage ? (
             <img
                src={user.profileImage?.startsWith('http') ? user.profileImage : `http://localhost:3000/images/uploads/${user.profileImage}`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
          ) : (
            <div className="w-full h-full bg-gray-500"></div>
          )}
        </div>
        <div className="stats flex gap-5 items-center justify-between">
          <div className="flex flex-col items-center justify-center">
            <h3>{user.posts ? user.posts.length : 0}</h3>
            <h4>Posts</h4>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Link to="/followers">
              <h3>{user.followers ? user.followers.length : 0}</h3>
            </Link>
            <h4>Followers</h4>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Link to="/following">
              <h3>{user.following ? user.following.length : 0}</h3>
            </Link>
            <h4>Following</h4>
          </div>
        </div>
      </div>
      <div className="dets px-6 mt-5">
        <h3 className="text-lg mb-1">{user.name}</h3>
        <p className="text-xs tracking-tight opacity-50">{user.bio}</p>
      </div>
      <div className="px-6 mt-5">
        <Link className="px-3 py-2 bg-zinc-800 text-xs rounded-md" to="/edit">
          Edit Profile
        </Link>
      </div>
      <div className="posts w-full flex gap-1 py-2 mt-5 flex-wrap">
        {user.posts && user.posts.map((post) => (
          <div key={post._id} className="post w-[32.5%] h-32 bg-sky-100 overflow-hidden">
            <Link to="/mypost">
              <img
                className="w-full h-full object-cover"
                src={post.picture?.startsWith('http') ? post.picture : `http://localhost:3000/images/uploads/${post.picture}`}
                alt=""
              />
            </Link>
          </div>
        ))}
      </div>
      <Navbar user={user} />
    </div>
  );
};

export default Profile;
