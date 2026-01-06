import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const Message = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get('/message');
        setUser(response.data.user);
        setUsers(response.data.users);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, []);

  if (!user) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full min-h-screen bg-zinc-900 px-4 py-5 mb-16">
      <div className="border-2 border-zinc-800 flex items-center justify-between px-2 py-1 rounded-md">
        <i className="text-white ri-search-line"></i>
        <input
          id="inputusername"
          className="ml-1 w-full bg-zinc-900 outline-none text-zinc-400"
          type="text"
          placeholder="search username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <h1 className="text-white mt-5">Messages</h1>

      <div className="users">
        {filteredUsers.map((u) => (
          <Link key={u._id} to={`/userprofile/${u.username}`} className="outline-none">
            <div className="text-white flex items-center justify-between gap-2">
              <div className="text-white flex gap-4 mt-5">
                <div className="image w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={u.profileImage?.startsWith('http') ? u.profileImage : `http://localhost:3000/images/uploads/${u.profileImage}`}
                    alt=""
                  />
                </div>
                <div className="text">
                  <h3>{u.name}</h3>
                  <h4 className="text-sm opacity-60 leading-none mt-.5">Hey, how are you?</h4>
                </div>
              </div>
              <div>
                <i className="ri-camera-line text-3xl"></i>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Navbar user={user} />
    </div>
  );
};

export default Message;
