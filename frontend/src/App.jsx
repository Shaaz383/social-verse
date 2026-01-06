import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
// import Profile from './pages/Profile';
// import Feed from './pages/Feed';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<div className="text-white">Profile Page (Coming Soon)</div>} />
        <Route path="/feed" element={<div className="text-white">Feed Page (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
