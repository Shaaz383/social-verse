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
      <div className="notifications flex flex-col gap-2">
        {posts.map((post) => (
          <React.Fragment key={post._id}>
            {/* Likes */}
            {post.likes.map((like) => {
              if (like._id !== user._id) {
                return (
                  <Link key={`${post._id}-like-${like._id}`} to={`/userprofile/${like.username}`} className="outline-none">
                    <div className="text-white flex items-center justify-between gap-2 mt-5">
                      <div className="text-white items-center flex gap-4">
                        <div className="image w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                          <img
                            className="w-full h-full object-cover"
                            src={like.profileImage?.startsWith('http') ? like.profileImage : `http://localhost:3000/images/uploads/${like.profileImage}`}
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
                          src={post.picture?.startsWith('http') ? post.picture : `http://localhost:3000/images/uploads/${post.picture}`}
                          alt=""
                        />
                      </div>
                    </div>
                  </Link>
                );
              }
              return null;
            })}

            {/* Comments */}
            {post.comments && post.comments.map((comment) => (
                <React.Fragment key={comment._id}>
                    {comment.user && comment.user._id !== user._id && (
                        <Link to={`/userprofile/${comment.user.username}`} className="outline-none">
                            <div className="text-white flex items-center justify-between gap-2 mt-5">
                            <div className="text-white items-center flex gap-4">
                                <div className="image w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                                <img
                                    className="w-full h-full object-cover"
                                    src={comment.user.profileImage?.startsWith('http') ? comment.user.profileImage : `http://localhost:3000/images/uploads/${comment.user.profileImage}`}
                                    alt=""
                                />
                                </div>
                                <div className="text">
                                <h3>{comment.user.username}, commented on your post</h3>
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
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.map(reply => (
                        reply.user && reply.user._id !== user._id && (
                            <Link key={reply._id} to={`/userprofile/${reply.user.username}`} className="outline-none">
                                <div className="text-white flex items-center justify-between gap-2 mt-5">
                                <div className="text-white items-center flex gap-4">
                                    <div className="image w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover"
                                        src={`http://localhost:3000/images/uploads/${reply.user.profileImage}`}
                                        alt=""
                                    />
                                    </div>
                                    <div className="text">
                                    <h3>{reply.user.username}, replied on a comment</h3>
                                    </div>
                                </div>
                                <div className="image w-[11vw] h-[11vw] bg-sky-100 overflow-hidden">
                                    <img
                                    className="w-full h-full object-cover"
                                    src={post.picture?.startsWith('http') ? post.picture : `http://localhost:3000/images/uploads/${post.picture}`}
                                    alt=""
                                    />
                                </div>
                                </div>
                            </Link>
                        )
                    ))}
                </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
      <Navbar user={user} />
    </div>
  );
};

export default Notification;
