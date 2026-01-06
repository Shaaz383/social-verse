import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const Search = () => {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch current user for Navbar
    const fetchUser = async () => {
      try {
        const response = await api.get('/search'); // Or just /profile
        setUser(response.data.user);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 0) {
      try {
        const response = await api.get(`/username/${val}`);
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setUsers([]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-900 px-4 py-5 mb-20">
      <div className="border-2 border-zinc-800 flex items-center justify-between px-2 py-1 rounded-md">
        <i className="text-white ri-search-line"></i>
        <input
          className="ml-1 w-full bg-zinc-900 outline-none text-zinc-400"
          type="text"
          placeholder="Search username"
          value={query}
          onChange={handleSearch}
        />
      </div>
      <div className="users mt-5">
        {users.map((elem) => (
          <Link key={elem._id} to={`/userprofile/${elem.username}`} className="outline-none">
            <div className="text-white flex items-center gap-2 mt-5">
              <div className="image w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={`http://localhost:3000/images/uploads/${elem.profileImage}`}
                  alt=""
                />
              </div>
              <div className="text">
                <h3 className="text-base font-semibold">{elem.username}</h3>
                <h4 className="text-xs opacity-30 leading-none">{elem.name}</h4>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Navbar user={user} />
    </div>
  );
};

export default Search;
