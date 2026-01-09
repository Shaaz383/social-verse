import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import ShareModal from '../components/ShareModal';

const PostDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [replyInput, setReplyInput] = useState({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchPost = async () => {
    try {
      const res = await api.get(`/post/${id}`);
      setUser(res.data.user);
      setPost(res.data.post);
    } catch (err) {
      console.error(err);
      // navigate('/feed'); 
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await api.get(`/like/post/${post._id}`);
      const updated = res.data && res.data.post ? res.data.post : null;
      if (updated) {
        // Fix likes structure if needed (similar to Feed)
        const normalizedLikes = (updated.likes || []).map((l) => (typeof l === 'string' ? l : l._id));
        setPost(prev => ({ ...prev, likes: normalizedLikes }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    try {
      const res = await api.post(`/comment/${post._id}`, { comment: commentInput });
      setCommentInput("");
      setPost(res.data.post);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (commentId) => {
    const text = replyInput[commentId];
    if (!text || !text.trim()) return;
    try {
      const res = await api.post(`/comment/reply/${post._id}/${commentId}`, { comment: text });
      setReplyInput({ ...replyInput, [commentId]: "" });
      setActiveReplyCommentId(null);
      setPost(res.data.post);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const isSaved = user.saved && user.saved.includes(post._id);
      if (isSaved) {
        await api.post(`/unsave/${post._id}`);
        setUser(prev => ({ ...prev, saved: prev.saved.filter(pid => pid !== post._id) }));
      } else {
        await api.post(`/save/${post._id}`);
        setUser(prev => ({ ...prev, saved: [...(prev.saved || []), post._id] }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || !post) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white pb-20">
      <div className="w-full px-4 py-3 flex items-center gap-4 sticky top-0 bg-zinc-900 z-10 border-b border-zinc-800">
        <Link to="/feed">
          <i className="ri-arrow-left-line text-xl"></i>
        </Link>
        <h1 className="text-lg font-semibold">Post</h1>
      </div>

      <div className="post w-full min-h-[50vh]">
        <div className="title px-4 flex items-center gap-2 mt-4">
          <div className="w-[8vw] h-[8vw] bg-sky-100 rounded-full overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={post.user.profileImage}
              alt=""
            />
          </div>
          <Link to={`/userprofile/${post.user.username}`} className="text-sm">
            {post.user.username}
          </Link>
        </div>
        <div className="w-full h-96 mt-4 bg-sky-100 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={post.picture}
            alt=""
          />
        </div>
        <div className="options w-full px-4 flex justify-between items-center text-[1.4rem]">
          <div className="flex gap-3 mt-2 items-center">
            <button onClick={handleLike} className="flex items-center gap-1">
              {post.likes.includes(user._id) ? (
                <i className="ri-heart-3-fill text-red-600"></i>
              ) : (
                <i className="ri-heart-line"></i>
              )}
              <span className="text-sm">{post.likes.length}</span>
            </button>
            <div className="flex items-center gap-1">
                <i className="ri-chat-3-line"></i>
                <span className="text-sm">{post.comments ? post.comments.length : 0}</span>
            </div>
            <button onClick={() => setShareModalOpen(true)}>
              <i className="ri-share-circle-line"></i>
            </button>
          </div>
          <button onClick={handleSave}>
            {user.saved && user.saved.includes(post._id) ? (
              <i className="ri-bookmark-fill text-white"></i>
            ) : (
              <i className="ri-bookmark-line"></i>
            )}
          </button>
        </div>
        
        <h2 className="text-white font-light text-sm mt-2 px-4">
          <span className="font-semibold pr-2">{post.user.username}</span>
          {post.caption}
        </h2>

        {/* Comments Section - Always Visible */}
        <div className="px-4 mt-4 mb-10">
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
                  onClick={handleAddComment}
                  className="text-blue-500 text-sm font-semibold"
                >
                  Post
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {post.comments && post.comments.map(comment => (
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
                        onClick={() => handleReply(comment._id)}
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
      </div>

      <Navbar user={user} />
      
      {shareModalOpen && (
        <ShareModal 
          isOpen={shareModalOpen} 
          onClose={() => setShareModalOpen(false)} 
          postId={post._id} 
        />
      )}
    </div>
  );
};

export default PostDetail;
