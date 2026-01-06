import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const Feed = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const fetchFeed = async () => {
    try {
      const response = await api.get('/feed');
      setUser(response.data.user);
      setPosts(response.data.posts);
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [navigate]);

  const handleLike = async (postId) => {
    try {
      await api.get(`/like/post/${postId}`);
      fetchFeed(); // Refresh posts to show new like count/status
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5">
      <div className="w-full px-4 flex items-center justify-between">
        <img className="w-1/4" src="/images/logo.png" alt="" />
        <div className="icons -mt-2 flex gap-5 items-center">
          <Link to="/notification">
            <i className="text-[1.4rem] ri-heart-3-line"></i>
          </Link>
          <Link to="/message">
            <i className="text-[1.4rem] ri-messenger-line"></i>
          </Link>
        </div>
      </div>
      
      {/* Stories Section */}
      <div className="story px-3 flex gap-3 overflow-auto mt-5">
        <div className="circle flex-shrink-0">
          <div className="w-[18vw] h-[18vw] bg-sky-100 rounded-full flex items-center justify-center">
            <div className="inner w-[92%] h-[92%] rounded-full overflow-hidden">
              <img
                src={`http://localhost:3000/images/uploads/${user.profileImage}`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {[
          { name: "sixer_king", img: "https://ss-i.thgim.com/public/cricket/t7tdzn/article54603981.ece/alternates/FREE_1200/Yuvraj-Singh" },
          { name: "mr_360", img: "https://images.news18.com/ibnlive/uploads/2021/07/1627310607_ab-de-villiers.jpg" },
          { name: "king_kohli", img: "https://imgnew.outlookindia.com/public/uploads/articles/2021/10/12/Kohli-IPL-RCB-Celeb.jpg" },
          { name: "mahi", img: "https://images.indianexpress.com/2019/04/dhoni-759-10.jpg" }
        ].map((story, index) => (
            <div key={index} className="circle flex-shrink-0 flex flex-col items-center gap-1">
            <div className="gradient w-[18vw] h-[18vw] bg-sky-100 rounded-full bg-gradient-to-r from-purple-700 to-orange-500 flex items-center justify-center">
                <div className="inner w-[92%] h-[92%] rounded-full overflow-hidden">
                <img
                    className="w-full h-full object-cover"
                    src={story.img}
                    alt=""
                />
                </div>
            </div>
            <p className="name text-xs">{story.name}</p>
            </div>
        ))}
      </div>

      <div className="posts mb-20">
        {[...posts].reverse().map((elem) => (
          <div key={elem._id} className="post mt-10 w-full min-h-[50vh]">
            <div className="title px-4 flex items-center gap-2">
              <div className="w-[8vw] h-[8vw] bg-sky-100 rounded-full overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={`http://localhost:3000/images/uploads/${elem.user.profileImage}`}
                  alt=""
                />
              </div>
              <h4 className="text-sm">{elem.user.username}</h4>
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
              <span className="font-semibold pr-2">{elem.user.username}</span>
              {elem.caption}
            </h2>
          </div>
        ))}
      </div>

      <Navbar user={user} />
    </div>
  );
};

export default Feed;
