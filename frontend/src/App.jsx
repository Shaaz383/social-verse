import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Edit from './pages/Edit';
import UserProfile from './pages/UserProfile';
import MyPost from './pages/MyPost';
import Followers from './pages/Followers';
import Following from './pages/Following';
import Forgot from './pages/Forgot';
import Reset from './pages/Reset';
import Notification from './pages/Notification';
import Message from './pages/Message';
import UploadStory from './pages/UploadStory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/search" element={<Search />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/upload-story" element={<UploadStory />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/mypost" element={<MyPost />} />
        <Route path="/userprofile/:username" element={<UserProfile />} />
        <Route path="/followers" element={<Followers />} />
        <Route path="/following" element={<Following />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset/:token" element={<Reset />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/message" element={<Message />} />
        <Route path="/message/:username" element={<Message />} />
      </Routes>
    </Router>
  );
}

export default App;
