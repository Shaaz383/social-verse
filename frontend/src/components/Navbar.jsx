import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  return (
    <>
    <div className="footer text-white flex justify-between items-center w-full fixed bottom-0 z-[10] bg-zinc-900 px-10 py-3">
      <Link to="/feed">
        <i className="text-[1.4rem] ri-home-line"></i>
      </Link>
      <Link to="/search">
        <i className="text-[1.4rem] ri-search-line"></i>
      </Link>
      <button onClick={() => setShowAddModal(true)}>
        <i className="text-[1.4rem] ri-add-box-line"></i>
      </button>      <Link to="/profile">
        <div className="w-6 h-6 bg-zinc-300 rounded-full overflow-hidden">
          {user && user.profileImage ? (
            <img
              src={user.profileImage?.startsWith('http') ? user.profileImage : `http://localhost:3000/${user.profileImage}`}
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
