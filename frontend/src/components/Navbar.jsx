import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { getSocket } from '../socket';

const Navbar = ({ user }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let socket;

    const init = async () => {
      if (!user) return;
      try {
        const res = await api.get('/dm/unread-count');
        if (active) setUnreadCount(res.data.unreadCount || 0);
      } catch {
        return;
      }

      try {
        socket = await getSocket();
        const handler = (data) => {
          if (!active) return;
          setUnreadCount(data && typeof data.unreadCount === 'number' ? data.unreadCount : 0);
        };
        socket.on('dm:unread-count', handler);
      } catch {
        return;
      }
    };

    init();

    return () => {
      active = false;
      if (socket) socket.off('dm:unread-count');
    };
  }, [user]);

  return (
    <>
    <div className="footer text-white flex justify-between items-center w-full fixed bottom-0 z-[10] bg-zinc-900 px-10 h-[60px] border-t border-zinc-800">
      <Link to="/feed">
        <i className="text-[1.4rem] ri-home-line"></i>
      </Link>
      <Link to="/search">
        <i className="text-[1.4rem] ri-search-line"></i>
      </Link>
      <Link to="/message" className="relative">
        <i className="text-[1.4rem] ri-send-plane-line"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
      <button onClick={() => setShowAddModal(true)}>
        <i className="text-[1.4rem] ri-add-box-line"></i>
      </button>      <Link to="/profile">
        <div className="w-6 h-6 bg-zinc-300 rounded-full overflow-hidden">
          {user && user.profileImage ? (
            <img
              src={
                user.profileImage?.startsWith('http')
                  ? user.profileImage
                  : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${user.profileImage}`
              }
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
             <div className="w-full h-full bg-gray-500"></div>
          )}
        </div>
      </Link>
    </div>

    {/* Add Modal */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50" onClick={() => setShowAddModal(false)}>
        <div className="bg-zinc-800 w-full max-w-md rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-white text-lg font-semibold mb-4 text-center">Create</h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowAddModal(false);
                navigate('/upload');
              }}
              className="w-full flex items-center gap-3 p-3 bg-zinc-700 rounded-lg text-white hover:bg-zinc-600"
            >
              <i className="ri-image-line text-xl"></i>
              <span>Post</span>
            </button>
            <button
              onClick={() => {
                setShowAddModal(false);
                navigate('/upload-story');
              }}
              className="w-full flex items-center gap-3 p-3 bg-zinc-700 rounded-lg text-white hover:bg-zinc-600"
            >
              <i className="ri-play-circle-line text-xl"></i>
              <span>Story</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;
