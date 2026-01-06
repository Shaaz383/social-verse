import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const MyPost = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const fetchMyPosts = async () => {
    try {
      const response = await api.get('/mypost');
      setUser(response.data.user);
      setPosts(response.data.posts);
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [navigate]);

  const handleLike = async (postId) => {
    try {
      await api.get(`/like/post/${postId}`);
      fetchMyPosts(); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await api.post(`/deletepost/${postId}`);
      fetchMyPosts();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5">
      <div className="w-full px-4 flex items-center justify-between">
         <Link className="text-sm text-blue-500" to="/profile">
          <i className="ri-arrow-left-s-line"></i> profile
        </Link>
        <h1>Posts</h1>
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </div>

      <div className="posts mb-20">
        {[...posts].reverse().map((elem) => (
          <div key={elem._id} className="post mt-10 w-full min-h-[50vh]">
            <div className="title px-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-[8vw] h-[8vw] bg-sky-100 rounded-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={`http://localhost:3000/images/uploads/${user.profileImage}`}
                    alt=""
                  />
                </div>
                <h4 className="text-sm">{user.username}</h4>
              </div>

              <div>
                <div className="dropdown relative group">
                  <i className="text-[1.4rem] ri-pencil-line"></i>
                   <button onClick={() => handleDelete(elem._id)} className="text-red-500 ml-4">
                      <i className="ri-delete-bin-line"></i>
                   </button>
                </div>
              </div>
            </div>
            <div className="w-full h-96 mt-4 bg-sky-100 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={`http://localhost:3000/images/uploads/${elem.picture}`}
                alt=""
              />
            </div>
            <div className="options w-full px-4 flex justify-between items-center text-[1.4rem]">
              <div className="flex gap-3 mt-2">
                <button onClick={() => handleLike(elem._id)}>
                  {elem.likes.includes(user._id) ? (
                    <i className="ri-heart-3-fill text-red-600"></i>
                  ) : (
                    <i className="ri-heart-line"></i>
                  )}
                </button>
                <i className="ri-chat-3-line"></i>
                <i className="ri-share-circle-line"></i>
              </div>
              <i className="ri-bookmark-line"></i>
            </div>
            <h3 className="px-4 mt-2 text-sm leading-none tracking-tight">
              {elem.likes.length} likes
            </h3>
            <h2 className="text-white font-light text-sm mt-2 px-4">
              <span className="font-semibold pr-2">{user.username}</span>
              {elem.caption}
            </h2>
          </div>
        ))}
      </div>

      <Navbar user={user} />
    </div>
  );
};

export default MyPost;
