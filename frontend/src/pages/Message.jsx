import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { API_URL } from '../api';
import Navbar from '../components/Navbar';
import { getSocket } from '../socket';

const Message = () => {
  const [user, setUser] = useState(null);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);

  const { username } = useParams();
  const navigate = useNavigate();
  const listBottomRef = useRef(null);
  const seenMessageIdsRef = useRef(new Set());
  const activeConversationIdRef = useRef(null);

  const getSafeId = (id) => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (id._id) return String(id._id);
    return String(id);
  };

  const getMessageKey = (m) => {
    const sender = getSafeId(m && m.sender);
    const clientMessageId = m && m.clientMessageId ? String(m.clientMessageId) : '';
    if (sender && clientMessageId) return `${sender}:${clientMessageId}`;
    return m && m._id ? String(m._id) : '';
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/profile');
        setUser(response.data.user);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const filteredEligibleUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return eligibleUsers;
    return eligibleUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(term) ||
        (u.name && u.name.toLowerCase().includes(term))
    );
  }, [eligibleUsers, searchTerm]);

  useEffect(() => {
    const loadInbox = async () => {
      if (username) return;
      try {
        const [convRes, eligibleRes] = await Promise.all([
          api.get('/dm/conversations'),
          api.get('/dm/eligible-users'),
        ]);
        setConversations(convRes.data.conversations || []);
        setEligibleUsers(eligibleRes.data.users || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadInbox();
  }, [username]);

  useEffect(() => {
    let socket;
    let active = true;

    const init = async () => {
      if (!username) return;
      setLoadingThread(true);
      setMessages([]);
      setOtherUser(null);
      setActiveConversationId(null);
      activeConversationIdRef.current = null;
      seenMessageIdsRef.current = new Set();

      try {
        const res = await api.post(`/dm/with/${username}`);
        if (!active) return;
        setActiveConversationId(res.data.conversationId);
        activeConversationIdRef.current = res.data.conversationId;
        setOtherUser(res.data.other);

        const msgRes = await api.get(`/dm/conversations/${res.data.conversationId}/messages`);
        if (!active) return;
        const initial = msgRes.data.messages || [];
        initial.forEach((m) => seenMessageIdsRef.current.add(getMessageKey(m)));
        setMessages(initial);

        await api.post(`/dm/conversations/${res.data.conversationId}/seen`);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingThread(false);
      }

      try {
        socket = await getSocket();
        const onMessage = (m) => {
          if (!active) return;
          if (!m || !m.conversation) return;
          if (!activeConversationIdRef.current) return;
          if (String(m.conversation) !== String(activeConversationIdRef.current)) return;
          const key = getMessageKey(m);
          if (!key) return;
          if (seenMessageIdsRef.current.has(key)) return;
          seenMessageIdsRef.current.add(key);
          setMessages((prev) => [...prev, m]);
        };
        socket.on('dm:message', onMessage);
      } catch (err) {
        console.error(err);
      }
    };

    init();

    return () => {
      active = false;
      if (socket) socket.off('dm:message');
    };
  }, [username]);

  useEffect(() => {
    if (!username) return;
    if (!listBottomRef.current) return;
    listBottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, username]);

  const handleSend = async () => {
    if (!activeConversationId || !otherUser) return;
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setSending(true);

    const clientMessageId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const optimistic = {
      _id: `local:${clientMessageId}`,
      conversation: activeConversationId,
      sender: user._id,
      recipient: otherUser._id,
      text,
      clientMessageId,
      createdAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      seenAt: null,
    };

    seenMessageIdsRef.current.add(getMessageKey(optimistic));
    setMessages((prev) => [...prev, optimistic]);

    try {
      const socket = await getSocket();
      await new Promise((resolve, reject) => {
        socket.emit(
          'dm:send',
          { conversationId: activeConversationId, text, clientMessageId },
          (ack) => {
            if (!ack || !ack.ok) return reject(new Error((ack && ack.error) || 'Send failed'));
            resolve(ack.message);
          }
        );
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateLike) => {
    try {
      return new Date(dateLike).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!user) {
    return (
      <div className="text-white w-full min-h-screen bg-zinc-900 flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (username) {
    return (
      <div className="w-full min-h-screen bg-zinc-900 px-4 py-5 mb-16 flex flex-col">
        <div className="flex items-center gap-3 text-white">
          <button onClick={() => navigate('/message')} className="text-white">
            <i className="ri-arrow-left-line text-2xl"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-100 overflow-hidden">
              {otherUser?.profileImage ? (
                <img
                  className="w-full h-full object-cover"
                  src={
                    otherUser.profileImage?.startsWith('http')
                      ? otherUser.profileImage
                      : `${API_URL}/images/uploads/${otherUser.profileImage}`
                  }
                  alt=""
                />
              ) : (
                <div className="w-full h-full bg-gray-500"></div>
              )}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{otherUser?.username || username}</span>
              {sending ? <span className="text-xs text-zinc-400">Sending…</span> : <span className="text-xs text-zinc-400"> </span>}
            </div>
          </div>
        </div>

        <div className="flex-1 mt-4 overflow-y-auto">
          {loadingThread ? (
            <div className="text-zinc-300">Loading chat…</div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((m) => {
                const isMine = String(m.sender) === String(user._id);
                return (
                  <div key={m._id} className={`w-full flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${isMine ? 'bg-blue-600' : 'bg-zinc-800'} text-white max-w-[78%] px-3 py-2 rounded-2xl`}>
                      <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                      <div className="text-[10px] text-zinc-200 opacity-80 mt-1 text-right">
                        {formatTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={listBottomRef} />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded-full outline-none"
            placeholder="Message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            onClick={handleSend}
            className="text-white px-3 py-2 rounded-full bg-blue-600 disabled:opacity-50"
            disabled={!draft.trim() || sending}
          >
            Send
          </button>
        </div>

        <Navbar user={user} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-zinc-900 px-4 py-5 mb-16">
      <div className="border-2 border-zinc-800 flex items-center justify-between px-2 py-1 rounded-md">
        <i className="text-white ri-search-line"></i>
        <input
          id="inputusername"
          className="ml-1 w-full bg-zinc-900 outline-none text-zinc-400"
          type="text"
          placeholder="search username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h1 className="text-white mt-5">Conversations</h1>
      <div className="flex flex-col gap-3 mt-2">
        {(conversations || []).map((c) => (
          <Link key={c._id} to={`/message/${c.other?.username}`} className="outline-none">
            <div className="text-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                  {c.other?.profileImage ? (
                    <img
                      className="w-full h-full object-cover"
                      src={
                        c.other.profileImage?.startsWith('http')
                          ? c.other.profileImage
                          : `${API_URL}/images/uploads/${c.other.profileImage}`
                      }
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-500"></div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="leading-none">{c.other?.username}</h3>
                  <h4 className="text-sm opacity-60 leading-none mt-1">{c.lastMessageText || ' '}</h4>
                </div>
              </div>
              {c.unreadCount > 0 && (
                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {c.unreadCount > 99 ? '99+' : c.unreadCount}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <h1 className="text-white mt-6">Start a new chat</h1>
      <div className="flex flex-col gap-3 mt-2">
        {filteredEligibleUsers.map((u) => (
          <Link key={u._id} to={`/message/${u.username}`} className="outline-none">
            <div className="text-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-[11vw] h-[11vw] rounded-full bg-sky-100 overflow-hidden">
                  {u.profileImage ? (
                    <img
                      className="w-full h-full object-cover"
                      src={
                        u.profileImage?.startsWith('http')
                          ? u.profileImage
                          : `${API_URL}/images/uploads/${u.profileImage}`
                      }
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-500"></div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="leading-none">{u.username}</h3>
                  <h4 className="text-sm opacity-60 leading-none mt-1">{u.name || ' '}</h4>
                </div>
              </div>
              <i className="ri-chat-3-line text-xl opacity-80"></i>
            </div>
          </Link>
        ))}
      </div>

      <Navbar user={user} />
    </div>
  );
};

export default Message;
