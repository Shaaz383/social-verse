import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const Notification = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notification');
        setUser(response.data.user);
        setPosts(response.data.posts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

  if (!user) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-900 px-4 py-5 mb-16">
      <h1 className="text-white mt-5">Notifications</h1>
      <div className="notifications">
        {posts.map((post) => (
          post.likes.map((like) => {
            if (like._id !== user._id) {
              return (
                <Link key={`${post._id}-${like._id}`} to={`/userprofile/${like.username}`} className="outline-none">
                  <div className="text-white flex items-center justify-between gap-2 mt-5">
                    <div className="text-white items-center flex gap-4">
                      <div className="image w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                        <img
                          className="w-full h-full object-cover"
                          src={`http://localhost:3000/images/uploads/${like.profileImage}`}
                          alt=""
                        />
                      </div>
                      <div className="text">
                        <h3>{like.username}, liked your post</h3>
                      </div>
                    </div>
                    <div className="image w-[11vw] h-[11vw] bg-sky-100 overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        src={`http://localhost:3000/images/uploads/${post.picture}`}
                        alt=""
                      />
                    </div>
                  </div>
                </Link>
              );
            }
            return null;
          })
        ))}
      </div>
      <Navbar user={user} />
    </div>
  );
};

export default Notification;
