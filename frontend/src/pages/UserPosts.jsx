import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { API_URL } from '../api';
import Navbar from '../components/Navbar';
import ShareModal from '../components/ShareModal';

const UserPosts = () => {
  const { username } = useParams();
  const [currentUser, setCurrentUser] = useState(null); // Logged in user
  const [profileUser, setProfileUser] = useState(null); // User whose posts we are viewing
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for interactions
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [replyInput, setReplyInput] = useState({ text: '', parentCommentId: null });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Get current user for Navbar and interactions
      const profileRes = await api.get('/profile');
      setCurrentUser(profileRes.data.user);

      // Get user profile and posts
      // We use the existing /userprofile/:username endpoint which returns userPosts
      // However, check if userPosts are fully populated with comments etc.
      // Usually /userprofile/:username returns posts with basic info. 
      // If we want Feed-like interaction, we might need more data.
      // Let's check what /userprofile/:username returns in backend.
      // It returns userPosts. Let's assume for now it's enough or we might need to enhance it.
      // Actually, standard profile posts in Instagram are just the grid. Clicking one opens a "Feed View" starting from that post.
      // Here we want a "Feed View" of all their posts.
      
      const response = await api.get(`/userprofile/${username}`);
      setProfileUser(response.data.userProfile);
      
      // The endpoint returns userPosts. We need to see if they are populated enough.
      // If not, we might need a specific endpoint. 
      // But let's try to use what we have. 
      // Ideally, we should have a route like /posts/user/:username that populates like /feed.
      // For now, let's use the data we get and if needed, we can update the backend.
      setPosts(response.data.userPosts);
      setLoading(false);
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchData();
  }, [username, navigate]);

  const handleLike = async (postId) => {
    try {
      await api.get(`/like/post/${postId}`);
      // Optimistic update or refetch
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const isLiked = p.likes.includes(currentUser._id);
          return {
            ...p,
            likes: isLiked ? p.likes.filter(id => id !== currentUser._id) : [...p.likes, currentUser._id]
          };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (postId) => {
    try {
      const isSaved = currentUser.saved && currentUser.saved.includes(postId);
      if (isSaved) {
        await api.post(`/unsave/${postId}`);
        setCurrentUser(prev => ({ ...prev, saved: prev.saved.filter(id => id !== postId) }));
      } else {
        await api.post(`/save/${postId}`);
        setCurrentUser(prev => ({ ...prev, saved: [...(prev.saved || []), postId] }));
      }
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
      setReplyInput({ text: '', parentCommentId: null });
    } else {
      setActiveCommentPostId(postId);
      setReplyInput({ text: '', parentCommentId: null });
    }
  };

  if (loading || !currentUser || !profileUser) return <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white py-5">
      <div className="w-full px-4 flex items-center gap-4 sticky top-0 bg-zinc-900 z-10 border-b border-zinc-800 pb-3">
        <Link to={`/userprofile/${username}`}>
          <i className="ri-arrow-left-line text-xl"></i>
        </Link>
        <h1 className="text-lg font-semibold">{username}'s Posts</h1>
      </div>

      <div className="posts mb-20">
        {posts.length === 0 ? (
           <div className="flex flex-col items-center mt-20 text-zinc-500">
             <p>No posts yet.</p>
           </div>
        ) : (
          [...posts].reverse().map((elem) => (
            <div key={elem._id} className="post mt-10 w-full min-h-[50vh] border-b border-zinc-800 pb-5">
              <div className="title px-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-[8vw] h-[8vw] bg-sky-100 rounded-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={profileUser.profileImage?.startsWith('http') ? profileUser.profileImage : `${API_URL}/images/uploads/${profileUser.profileImage}`}
                      alt=""
                    />
                  </div>
                  <h4 className="text-sm">{profileUser.username}</h4>
                </div>
              </div>
              <div className="w-full h-96 mt-4 bg-sky-100 overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={elem.picture?.startsWith('http') ? elem.picture : `${API_URL}/images/uploads/${elem.picture}`}
                  alt=""
                />
              </div>
              <div className="options w-full px-4 flex justify-between items-center text-[1.4rem]">
                <div className="flex gap-3 mt-2">
                  <button onClick={() => handleLike(elem._id)}>
                    {elem.likes.includes(currentUser._id) ? (
                      <i className="ri-heart-3-fill text-red-600"></i>
                    ) : (
                      <i className="ri-heart-line"></i>
                    )}
                  </button>
                  <button onClick={() => toggleComments(elem._id)}>
                    <i className="ri-chat-3-line"></i>
                  </button>
                  <button onClick={() => handleShare(elem._id)}>
                    <i className="ri-share-circle-line"></i>
                  </button>
                </div>
                <button onClick={() => handleSave(elem._id)}>
                   {currentUser.saved && currentUser.saved.includes(elem._id) ? (
                    <i className="ri-bookmark-fill text-white"></i>
                  ) : (
                    <i className="ri-bookmark-line"></i>
                  )}
                </button>
              </div>
              <h3 className="px-4 mt-2 text-sm leading-none tracking-tight">
                {elem.likes.length} likes
              </h3>
              <h2 className="text-white font-light text-sm mt-2 px-4">
                <span className="font-semibold pr-2">{profileUser.username}</span>
                {elem.caption}
              </h2>
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

      <Navbar user={currentUser} />
    </div>
  );
};

export default UserPosts;