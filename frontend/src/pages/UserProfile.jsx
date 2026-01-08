import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import StoryViewer from '../components/StoryViewer';

const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null); // Current logged in user
  const [userProfile, setUserProfile] = useState(null); // Profile being viewed
  const [userPosts, setUserPosts] = useState([]);
  const [hasStories, setHasStories] = useState(false);
  const [stories, setStories] = useState([]);
  const [selectedStories, setSelectedStories] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/userprofile/${username}`);
      setUser(response.data.user);
      setUserProfile(response.data.userProfile);
      setUserPosts(response.data.userPosts);
      
      // Check if user has stories
      const storiesResponse = await api.get('/stories/feed');
      setStories(storiesResponse.data.stories);
      const userStories = storiesResponse.data.stories.filter(s => s.user._id === response.data.userProfile._id);
      setHasStories(userStories.length > 0);
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

  const handleStoryClick = async () => {
    const userStories = stories.filter(s => s.user._id === userProfile._id);
    const story = userStories[0];
    const isOwnStory = user && story.user._id === user._id;
    if (!isOwnStory) {
      try {
        for (const s of userStories) {
          await api.post(`/stories/view/${s._id}`);
        }
        await fetchUserProfile(); // Refresh stories
        const updatedStories = stories.filter(s => s.user._id === userProfile._id);
        setSelectedStories(updatedStories);
      } catch (err) {
        console.error('Failed to mark stories as viewed:', err);
        setSelectedStories(userStories);
      }
    } else {
      setSelectedStories(userStories);
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      await api.delete(`/stories/${storyId}`);
      await fetchUserProfile();
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

  if (!user || !userProfile) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  const isFollowing = user.following.includes(userProfile._id);

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5">
      <div className="nav flex justify-between items-center px-4">
        <h3 className="text-lg">{userProfile.username}</h3>
        <div className="icons flex gap-5"></div>
      </div>
      <div className="flex justify-between items-center pl-6 pr-[12vw] mt-8">
        <div className={`w-[19vw] h-[19vw] rounded-full overflow-hidden ${hasStories ? 'p-1 bg-gradient-to-r from-purple-700 to-orange-500' : ''}`}>
          <div className="w-full h-full bg-sky-100 rounded-full overflow-hidden" onClick={hasStories ? handleStoryClick : undefined} style={{ cursor: hasStories ? 'pointer' : 'default' }}>
            <img
              src={userProfile.profileImage?.startsWith('http') ? userProfile.profileImage : `http://localhost:3000/images/uploads/${userProfile.profileImage}`}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
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
              src={post.picture?.startsWith('http') ? post.picture : `http://localhost:3000/images/uploads/${post.picture}`}
              alt=""
            />
          </div>
        ))}
      </div>
      <Navbar user={user} />
      {selectedStories && <StoryViewer stories={selectedStories} onClose={() => setSelectedStories(null)} user={user} onDelete={handleDeleteStory} />}
    </div>
  );
};

export default UserProfile;
