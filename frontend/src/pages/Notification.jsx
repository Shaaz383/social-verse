import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { formatTimeAgo } from '../utils/formatTime';

const Notification = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notification');
        setUser(response.data.user);
        setNotifications(response.data.notifications || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

  if (!user) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-900 px-4 py-5 mb-16">
      <h1 className="text-white mt-5 text-xl font-semibold">Notifications</h1>
      <div className="notifications flex flex-col gap-2 mt-4">
        {notifications.length === 0 ? (
          <p className="text-zinc-500 text-center mt-10">No notifications yet.</p>
        ) : (
          notifications.map((notif) => (
            <Link 
              key={notif._id} 
              to={notif.type === 'follow' ? `/userprofile/${notif.sender.username}` : `/post/${notif.post?._id}`} 
              className="outline-none"
            >
              <div className="text-white flex items-center justify-between gap-2 py-2 border-b border-zinc-800">
                <div className="text-white items-center flex gap-3">
                  <div className="image w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
                    {notif.sender && (
                      <img
                        className="w-full h-full object-cover"
                        src={notif.sender.profileImage}
                        alt=""
                      />
                    )}
                  </div>
                  <div className="text text-sm">
                    <span className="font-semibold mr-1">{notif.sender.username}</span>
                    {notif.type === 'like' && 'liked your post.'}
                    {notif.type === 'comment' && `commented: "${notif.commentText || 'Nice!'}"`}
                    {notif.type === 'follow' && 'started following you.'}
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {formatTimeAgo(notif.createdAt)}
                    </div>
                  </div>
                </div>
                {notif.post && notif.post.picture && (
                  <div className="image w-10 h-10 bg-zinc-700 overflow-hidden flex-shrink-0 rounded">
                    <img
                      className="w-full h-full object-cover"
                      src={notif.post.picture}
                      alt=""
                    />
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
      <Navbar user={user} />
    </div>
  );
};

export default Notification;
