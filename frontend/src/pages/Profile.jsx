import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import StoryViewer from '../components/StoryViewer';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [selectedStories, setSelectedStories] = useState(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await api.get('/profile');
      setUser(response.data.user);
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [navigate]);

  const handleStoryClick = () => {
    if (user.stories && user.stories.length > 0) {
      setSelectedStories(user.stories);
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      await api.delete(`/stories/${storyId}`);
      await fetchUser();
      const remainingStories = selectedStories.filter(s => s._id !== storyId);
      if (remainingStories.length === 0) {
        setSelectedStories(null);
      } else {
        setSelectedStories(remainingStories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  // Check if all stories are viewed by the user (conceptually, for own profile, maybe just check if they exist?)
  // For own profile, usually the ring is colorful if there are stories.
  // The "seen" concept applies more to *other* users' stories.
  // However, the prompt says "if a user has already viewed someone's story...".
  // For my own stories, I am the viewer? No, I am the owner.
  // Let's assume for own profile, if I have stories, it's colorful.
  const hasStories = user.stories && user.stories.length > 0;

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
              <Link to="/saved">Saved</Link>
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
        <div className={`w-[19vw] h-[19vw] rounded-full overflow-hidden ${hasStories ? 'p-1 bg-gradient-to-r from-purple-700 to-orange-500' : ''}`}>
          <div 
            className="w-full h-full bg-sky-100 rounded-full overflow-hidden"
            onClick={hasStories ? handleStoryClick : undefined}
            style={{ cursor: hasStories ? 'pointer' : 'default' }}
          >
            {user.profileImage ? (
               <img
                  src={user.profileImage}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
            ) : (
              <div className="w-full h-full bg-gray-500"></div>
            )}
          </div>
        </div>
        <div className="stats flex gap-5 items-center justify-between">
          <div className="flex flex-col items-center justify-center">
            <Link to="/mypost">
              <h3>{user.posts ? user.posts.length : 0}</h3>
            </Link>
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
                src={post.picture}
                alt=""
              />
            </Link>
          </div>
        ))}
      </div>
      <Navbar user={user} />
      {selectedStories && <StoryViewer stories={selectedStories} onClose={() => setSelectedStories(null)} user={user} onDelete={handleDeleteStory} />}
    </div>
  );
};

export default Profile;
