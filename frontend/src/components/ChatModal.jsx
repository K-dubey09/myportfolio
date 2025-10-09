import React, { useEffect, useState, useRef } from 'react';
import './ChatModal.css';
import { useAuth } from '../context/AuthContext';

const ChatModal = ({ isOpen, onClose, adminView = false }) => {
  const { token, user } = useAuth();
  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000';
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);
  const listRef = useRef(null);

  const apiFetch = async (path, opts = {}) => {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const headers = opts.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(url, { ...opts, headers });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return { res, json: await res.json() };
      return { res, text: await res.text() };
    } catch (err) {
      console.error('apiFetch error', err);
      return { res: null, err };
    }
  };

  const fetchChats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const base = adminView ? '/api/admin/chats' : '/api/chats';
      const { res, json } = await apiFetch(base);
      if (res && res.ok) {
        setChats(Array.isArray(json) ? json : (json.data || json.chats || []));
        // set active chat if none
        if (!activeChat && Array.isArray(json) && json[0]) {
          setActiveChat(json[0]._id || json[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    if (!token || !chatId) return;
    try {
      const base = adminView ? `/api/admin/chats/${chatId}` : `/api/chats/${chatId}`;
      const { res, json } = await apiFetch(base);
      if (res && res.ok) {
        const payload = json.data || json.chat || json;
        setMessages(payload.messages || payload || []);
      }
    } catch (err) { console.error(err); }
  };

  const startPolling = (chatId) => {
    stopPolling();
    pollRef.current = setInterval(() => {
      fetchMessages(chatId);
    }, 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) fetchChats();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      startPolling(activeChat);
    } else {
      setMessages([]);
      stopPolling();
    }
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat]);

  // Scroll to bottom when messages change; log if scroll fails
  useEffect(() => {
    try {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    } catch (err) {
      // harmless in many environments; keep debug to aid development
      console.debug('ChatModal scroll error', err);
    }
  }, [messages]);

  const handleCreateChat = async (subject = 'Support') => {
    if (!token) return;
    try {
      const { res, json } = await apiFetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject }) });
      if (res && res.ok) {
        const newChat = json.data || json.chat || json;
        await fetchChats();
        setActiveChat(newChat._id || newChat.id);
      }
    } catch (err) { console.error(err); }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChat) return;
    try {
      const path = adminView ? `/api/admin/chats/${activeChat}/messages` : `/api/chats/${activeChat}/messages`;
  const { res } = await apiFetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newMessage }) });
      if (res && res.ok) {
        setNewMessage('');
        await fetchMessages(activeChat);
      } else {
        // If chat not found, try creating a chat then send
        if (res && res.status === 404) {
          await handleCreateChat();
        }
      }
    } catch (err) { console.error(err); }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" role="dialog" aria-modal="true">
      <div className="chat-modal">
        <div className="chat-header">
          <h3>{adminView ? 'Admin Chat Panel' : 'Chat & Collaboration'}</h3>
          <button className="close-btn" onClick={() => { stopPolling(); onClose(); }} aria-label="Close">×</button>
        </div>

        <div className="chat-body">
          <div className="chat-list">
            <div className="chat-list-actions">
              <button onClick={() => fetchChats()} className="refresh-btn">Refresh</button>
              {!adminView && <button onClick={() => handleCreateChat('Support')} className="new-chat-btn">New Chat</button>}
            </div>
            <div className="chat-items">
              {loading && <div className="muted">Loading chats...</div>}
              {!loading && chats.length === 0 && <div className="muted">No chats yet</div>}
              {chats.map((c) => (
                <div key={c._id || c.id} className={`chat-item ${String(activeChat) === String(c._id || c.id) ? 'active' : ''}`} onClick={() => setActiveChat(c._id || c.id)}>
                  <div className="chat-subject">{c.subject || (c.participants && c.participants.map(p => p.name).join(', ')) || 'Chat'}</div>
                  <div className="chat-meta">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-window">
            {!activeChat ? (
              <div className="empty-state">Select a chat to view messages</div>
            ) : (
              <>
                <div className="messages-list" ref={listRef}>
                  {messages && messages.length === 0 && <div className="muted">No messages yet</div>}
                  {messages && messages.map((m) => (
                    <div key={m._id || m.id || Math.random()} className={`message ${m.author === (user && user._id) ? 'mine' : 'other'}`}>
                      <div className="message-meta">
                        <div className="message-author">{m.authorName || (m.author === (user && user._id) ? 'You' : 'User')}</div>
                        <div className="message-time">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</div>
                      </div>
                      <div className="message-body">{m.text || m.content || ''}</div>
                    </div>
                  ))}
                </div>

                <div className="chat-input-row">
                  <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
                  <div className="chat-input-actions">
                    <button onClick={handleSend} className="send-btn">Send</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
