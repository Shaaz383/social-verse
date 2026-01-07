import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user }) => {
  return (
    <div className="footer text-white flex justify-between items-center w-full fixed bottom-0 z-[10] bg-zinc-900 px-10 py-3">
      <Link to="/feed">
        <i className="text-[1.4rem] ri-home-line"></i>
      </Link>
      <Link to="/search">
        <i className="text-[1.4rem] ri-search-line"></i>
      </Link>
      <Link to="/upload">
        <i className="text-[1.4rem] ri-add-box-line"></i>
      </Link>      <Link to="/profile">
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
  );
};

export default Navbar;
