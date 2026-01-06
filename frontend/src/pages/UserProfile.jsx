import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null); // Current logged in user
  const [userProfile, setUserProfile] = useState(null); // Profile being viewed
  const [userPosts, setUserPosts] = useState([]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/userprofile/${username}`);
      setUser(response.data.user);
      setUserProfile(response.data.userProfile);
      setUserPosts(response.data.userPosts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const handleFollow = async () => {
    try {
      await api.post(`/follow/${userProfile.username}`);
      fetchUserProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await api.post(`/unfollow/${userProfile.username}`);
      fetchUserProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || !userProfile) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  const isFollowing = user.following.includes(userProfile._id);

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5">
      <div className="nav flex justify-between items-center px-4">
        <h3 className="text-lg">{userProfile.username}</h3>
        <div className="icons flex gap-5"></div>
      </div>
      <div className="flex justify-between items-center pl-6 pr-[12vw] mt-8">
        <div className="w-[19vw] h-[19vw] bg-sky-100 rounded-full overflow-hidden">
          <img
            src={`http://localhost:3000/images/uploads/${userProfile.profileImage}`}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="stats flex gap-5 items-center justify-between">
          <div className="flex flex-col items-center justify-center">
            <h3>{userPosts.length}</h3>
            <h4>Posts</h4>
          </div>
          <div className="flex flex-col items-center justify-center">
            <h3>{userProfile.followers.length}</h3>
            <h4>Followers</h4>
          </div>
          <div className="flex flex-col items-center justify-center">
            <h3>{userProfile.following.length}</h3>
            <h4>Following</h4>
          </div>
        </div>
      </div>
      <div className="dets px-6 mt-5">
        <h3 className="text-lg mb-1">{userProfile.name}</h3>
        <p className="text-xs tracking-tight opacity-50">{userProfile.bio}</p>
      </div>
      <div className="px-6 mt-5">
        {!isFollowing ? (
          <button onClick={handleFollow} className="px-12 py-1 bg-blue-700 rounded">
            Follow
          </button>
        ) : (
          <div className="flex gap-4">
            <button onClick={handleUnfollow} className="px-12 py-1 bg-white text-zinc-900 rounded">
              Following
            </button>
            <button className="px-12 py-1 bg-white text-zinc-900 rounded">
              Message
            </button>
          </div>
        )}
      </div>
      <div className="posts w-full flex gap-1 py-2 mt-5 flex-wrap">
        {userPosts.map((post) => (
          <div key={post._id} className="post w-[32.5%] h-32 bg-sky-100 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={`http://localhost:3000/images/uploads/${post.picture}`}
              alt=""
            />
          </div>
        ))}
      </div>
      <Navbar user={user} />
    </div>
  );
};

export default UserProfile;
