import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import ShareModal from '../components/ShareModal';

const SavedPosts = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [replyInput, setReplyInput] = useState({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const navigate = useNavigate();

  const fetchSaved = async () => {
    try {
      const response = await api.get('/saved-posts');
      setUser(response.data.user);
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [navigate]);

  const handleLike = async (postId) => {
    try {
      const res = await api.get(`/like/post/${postId}`);
      const updated = res.data && res.data.post ? res.data.post : null;
      if (!updated) {
        fetchSaved();
        return;
      }
      const normalizedLikes = (updated.likes || []).map((l) => (typeof l === 'string' ? l : l._id));
      setPosts((prev) =>
        (prev || []).map((p) => (p._id === postId ? { ...p, likes: normalizedLikes } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (postId) => {
    try {
      await api.post(`/unsave/${postId}`);
      // Remove from view immediately as we are in Saved Posts page
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (postId) => {
    setSelectedPostId(postId);
    setShareModalOpen(true);
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
      // Refresh to show new comment (or we could manually append it if we want to be fancy)
      fetchSaved();
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
      fetchSaved();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <div className="w-full px-4 py-3 flex items-center gap-4 sticky top-0 bg-zinc-900 z-10 border-b border-zinc-800">
        <Link to="/profile">
          <i className="ri-arrow-left-line text-xl"></i>
        </Link>
        <h1 className="text-lg font-semibold">Saved Posts</h1>
      </div>

      <div className="posts mb-20">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center mt-20 text-zinc-500">
            <div className="w-20 h-20 border-2 border-zinc-700 rounded-full flex items-center justify-center mb-4">
              <i className="ri-bookmark-line text-4xl"></i>
            </div>
            <p>No saved posts yet.</p>
          </div>
        ) : (
          posts.map((elem) => (
            <div key={elem._id} className="post mt-5 w-full min-h-[50vh] border-b border-zinc-800 pb-5">
              <div className="title px-4 flex items-center gap-2">
                <div className="w-[8vw] h-[8vw] bg-sky-100 rounded-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={elem.user.profileImage}
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
                  src={elem.picture}
                  alt=""
                />
              </div>
              <div className="options w-full px-4 flex justify-between items-center text-[1.4rem]">
                <div className="flex gap-3 mt-2 items-center">
                  <button onClick={() => handleLike(elem._id)} className="flex items-center gap-1">
                    {elem.likes.includes(user?._id) ? (
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
                  <button onClick={() => handleShare(elem._id)}>
                    <i className="ri-share-circle-line"></i>
                  </button>
                </div>
                <button onClick={() => handleSave(elem._id)}>
                  <i className="ri-bookmark-fill text-white"></i>
                </button>
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
          ))
        )}
      </div>

      {shareModalOpen && (
        <ShareModal 
          onClose={() => setShareModalOpen(false)} 
          postId={selectedPostId} 
        />
      )}

      <Navbar user={user} />
    </div>
  );
};

export default SavedPosts;
