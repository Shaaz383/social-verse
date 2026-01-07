import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const Feed = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [replyInput, setReplyInput] = useState({}); // { commentId: text }
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null); // To toggle reply input
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();

  const fetchFeed = async () => {
    try {
      const response = await api.get('/feed');
      setUser(response.data.user);
      setPosts(response.data.posts);
      setSuggestions(response.data.suggestions || []);
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

  const handleFollowUser = async (username) => {
    try {
      await api.post(`/follow/${username}`);
      fetchFeed();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      setActiveCommentPostId(postId);
      setCommentInput("");
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentInput.trim()) return;
    try {
      await api.post(`/comment/${postId}`, { comment: commentInput });
      setCommentInput("");
      fetchFeed();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (postId, commentId) => {
    const text = replyInput[commentId];
    if (!text || !text.trim()) return;
    try {
      await api.post(`/comment/reply/${postId}/${commentId}`, { comment: text });
      setReplyInput({ ...replyInput, [commentId]: "" });
      setActiveReplyCommentId(null);
      fetchFeed();
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
                src={user.profileImage?.startsWith('http') ? user.profileImage : `http://localhost:3000/images/uploads/${user.profileImage}`}
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
        {([...posts]
          .reverse()
          .filter((p) => p.user && (p.user._id === user._id || (user.following || []).includes(p.user._id)))).map((elem) => (
          <div key={elem._id} className="post mt-10 w-full min-h-[50vh]">
            <div className="title px-4 flex items-center gap-2">
              <div className="w-[8vw] h-[8vw] bg-sky-100 rounded-full overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={elem.user.profileImage?.startsWith('http') ? elem.user.profileImage : `http://localhost:3000/images/uploads/${elem.user.profileImage}`}
                  alt=""
                />
              </div>
              <Link to={`/userprofile/${elem.user.username}`} className="text-sm">
                {elem.user.username}
              </Link>
            </div>
            <div className="w-full h-96 mt-4 bg-sky-100 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={elem.picture?.startsWith('http') ? elem.picture : `http://localhost:3000/images/uploads/${elem.picture}`}
                alt=""
              />
            </div>
            <div className="options w-full px-4 flex justify-between items-center text-[1.4rem]">
              <div className="flex gap-3 mt-2 items-center">
                <button onClick={() => handleLike(elem._id)} className="flex items-center gap-1">
                  {elem.likes.includes(user._id) ? (
                    <i className="ri-heart-3-fill text-red-600"></i>
                  ) : (
                    <i className="ri-heart-line"></i>
                  )}
                  <span className="text-sm">{elem.likes.length}</span>
                </button>
                <button onClick={() => toggleComments(elem._id)} className="flex items-center gap-1">
                    <i className="ri-chat-3-line"></i>
                    <span className="text-sm">{elem.comments ? elem.comments.length : 0}</span>
                </button>
                <i className="ri-share-circle-line"></i>
              </div>
              <i className="ri-bookmark-line"></i>
            </div>
            
            <h2 className="text-white font-light text-sm mt-2 px-4">
              <span className="font-semibold pr-2">{elem.user.username}</span>
              {elem.caption}
            </h2>

            {/* Comments Section */}
            {activeCommentPostId === elem._id && (
              <div className="px-4 mt-4">
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="w-full bg-zinc-800 text-white rounded px-3 py-1 text-sm outline-none"
                      placeholder="Add a comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                    <button 
                      onClick={() => handleAddComment(elem._id)}
                      className="text-blue-500 text-sm font-semibold"
                    >
                      Post
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                  {elem.comments && elem.comments.map(comment => (
                    <div key={comment._id} className="text-sm">
                      <div className="flex gap-2 mb-1">
                        <span className="font-semibold">{comment.user.username}</span>
                        <span className="font-light">{comment.comment}</span>
                      </div>
                      <div className="flex gap-3 text-xs opacity-60 pl-2 mb-1">
                         <button onClick={() => setActiveReplyCommentId(activeReplyCommentId === comment._id ? null : comment._id)}>Reply</button>
                      </div>
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-6 flex flex-col gap-2 mt-1 border-l-2 border-zinc-800 ml-2">
                            {comment.replies.map(reply => (
                                <div key={reply._id}>
                                    <span className="font-semibold mr-2">{reply.user.username}</span>
                                    <span className="font-light">{reply.comment}</span>
                                </div>
                            ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {activeReplyCommentId === comment._id && (
                        <div className="flex gap-2 mt-2 pl-4">
                            <input 
                            type="text" 
                            className="w-full bg-zinc-800 text-white rounded px-2 py-1 text-xs outline-none"
                            placeholder="Reply..."
                            value={replyInput[comment._id] || ""}
                            onChange={(e) => setReplyInput({...replyInput, [comment._id]: e.target.value})}
                            />
                            <button 
                            onClick={() => handleReply(elem._id, comment._id)}
                            className="text-blue-500 text-xs font-semibold"
                            >
                            Reply
                            </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

      {([...posts].filter((p) => p.user && (p.user._id === user._id || (user.following || []).includes(p.user._id))).length === 0) && (
        <div className="px-4 mt-10 mb-24">
          <h2 className="text-white text-base">Please follow users to see the post</h2>
          <p className="text-zinc-400 text-sm mt-1">Suggested accounts</p>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {suggestions.map((sug) => (
              <div key={sug._id} className="flex items-center justify-between">
                <Link to={`/userprofile/${sug.username}`} className="flex items-center gap-2">
                  <div className="w-[8vw] h-[8vw] bg-sky-100 rounded-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={sug.profileImage?.startsWith('http') ? sug.profileImage : `http://localhost:3000/images/uploads/${sug.profileImage}`}
                      alt=""
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-white">{sug.username}</span>
                    <span className="text-xs text-zinc-400">{sug.name}</span>
                  </div>
                </Link>
                <button
                  onClick={() => handleFollowUser(sug.username)}
                  className="px-3 py-1 bg-blue-700 text-white rounded text-xs"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Navbar user={user} />
    </div>
  );
};

export default Feed;
