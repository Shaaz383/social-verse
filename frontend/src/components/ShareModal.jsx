import React, { useState, useEffect } from 'react';
import api from '../api';

const ShareModal = ({ postId, onClose }) => {
  const [followers, setFollowers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await api.get('/dm/eligible-users');
        setFollowers(res.data.users || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFollowers();
  }, []);

  const toggleSelect = (userId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelected(newSelected);
  };

  const handleSend = async () => {
    if (selected.size === 0) return;
    setSending(true);
    try {
      const promises = Array.from(selected).map(async (userId) => {
        // 1. Get/Create conversation
        const user = followers.find(u => u._id === userId);
        if (!user) return;
        
        const convRes = await api.post(`/dm/with/${user.username}`);
        const conversationId = convRes.data.conversationId;
        
        // 2. Send message
        // We'll send a link to the post
        const postLink = `${window.location.origin}/post/${postId}`; // Assuming we have a single post view
        // Or just a text indicating shared post
        const text = `Check out this post: ${postLink}`;
        
        await api.post(`/dm/conversations/${conversationId}/messages`, {
          text,
          clientMessageId: `share-${Date.now()}-${Math.random()}`
        });
      });
      
      await Promise.all(promises);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-800 w-full max-w-sm rounded-xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
          <h3 className="text-white font-semibold">Share</h3>
          <button onClick={onClose} className="text-white"><i className="ri-close-line text-xl"></i></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {followers.length === 0 ? (
             <p className="text-zinc-400 text-center">No followers to share with.</p>
          ) : (
            followers.map(user => (
              <div key={user._id} className="flex items-center justify-between cursor-pointer" onClick={() => toggleSelect(user._id)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden">
                    {user.profileImage ? (
                       <img src={user.profileImage} className="w-full h-full object-cover" alt="" />
                    ) : (
                       <div className="w-full h-full bg-gray-500"></div>
                    )}
                  </div>
                  <span className="text-white">{user.username}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${selected.has(user._id) ? 'bg-blue-500 border-blue-500' : 'border-zinc-500'}`}>
                  {selected.has(user._id) && <i className="ri-check-line text-white text-sm"></i>}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-zinc-700">
          <button 
            disabled={selected.size === 0 || sending}
            onClick={handleSend}
            className={`w-full py-3 rounded-lg font-semibold ${selected.size > 0 ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-zinc-500'}`}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
