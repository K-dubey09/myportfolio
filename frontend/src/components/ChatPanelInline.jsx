import React, { useState, useEffect, useRef } from 'react';
import './ChatPanel.css';

// WhatsApp-like center chat panel: header, messages, composer
export default function ChatPanelInline({ apiFetch, openChatId, user }) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const messagesRef = useRef(null);

  // Load chat when openChatId changes
  useEffect(() => {
    if (!openChatId) {
      setChat(null);
      setMessages([]);
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (!apiFetch) {
          console.debug('ChatPanelInline: apiFetch not provided');
          return;
        }
        const { res, json } = await apiFetch(`/api/chats/${openChatId}`);
        if (res && res.ok) {
          const payload = json && (json.data || json) || json || {};
          if (mounted) {
            setChat(payload);
            setMessages((payload.messages || []).map(m => ({ ...m })));
          }
        } else {
          console.error('Failed to load chat', json);
          if (mounted) {
            setChat(null);
            setMessages([]);
          }
        }
      } catch (err) {
        console.error('load chat error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [openChatId, apiFetch]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!text.trim() || !openChatId) return;
    setSending(true);
    try {
      if (!apiFetch) throw new Error('apiFetch missing');
      const body = JSON.stringify({ text });
      const { res, json } = await apiFetch(`/api/chats/${openChatId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (res && (res.ok || res.status === 201)) {
        const payload = json && (json.data || json) || json;
        // append the returned message
        setMessages(prev => [...prev, payload]);
        setText('');
      } else {
        console.error('Failed to send message', json);
      }
    } catch (err) {
      console.error('sendMessage error', err);
    } finally {
      setSending(false);
    }
  };

  const otherParticipants = (chat && chat.participants) ? (chat.participants.filter(p => String(p._id || p.id) !== String(user && user._id))) : [];

  return (
    <div className="chat-panel">
      <div className="conversation">
        {!openChatId && (
          <div className="muted" style={{ padding: 24 }}>Select a chat or start a new conversation from the right sidebar.</div>
        )}

        {openChatId && (
          <>
            <div className="chat-top" >
              <div className="conversation-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong>{chat && (chat.subject || (otherParticipants.map(p => p.name || p.email).join(', ') || 'Chat'))}</strong>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>{otherParticipants.map(p => p.role ? `${p.name || p.email} • ${p.role}` : (p.name || p.email)).join(', ')}</div>
                </div>
              </div>
            </div>

            <div className="chat-middle messages" ref={messagesRef}>
              {loading && <div className="muted">Loading messages…</div>}
              {!loading && messages.length === 0 && <div className="muted">No messages yet. Say hello 👋</div>}

              {!loading && messages.map((m, idx) => {
                const author = m.author || {};
                const authorId = author._id || author.id || (typeof author === 'string' ? author : undefined);
                const isOutgoing = user && authorId && String(authorId) === String(user._id);
                // prefer server-provided timestamps; fall back to createdAt
                const ts = m.verifiedAt || m.createdAt;
                const time = ts ? new Date(ts) : null;
                const timeStr = time ? time.toLocaleString() : '';
                const verified = !!m.verified;

                return (
                  <div className={`message-row detached ${isOutgoing ? 'outgoing-row' : 'incoming-row'}`} key={m._id || m.id || idx}>
                    <div className="card">
                      <div className="card-author muted" style={{ fontSize: '0.85rem' }}>{author && (author.name || author.email) ? (author.name || author.email) : ''}</div>
                      <div className={`bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}>{m.text}</div>
                      <div className="card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <div className="time muted" style={{ fontSize: '0.75rem' }}>{timeStr}</div>
                        {verified && <div className="verified" title="Verified by server" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>✔</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="chat-footer">
              <div className="composer">
                <textarea className="composer-input" placeholder="Type a message" value={text} onChange={(e) => setText(e.target.value)} />
                <button className="send-btn" onClick={sendMessage} disabled={sending || !text.trim()} aria-label="Send message">{sending ? 'Sending...' : 'Send'}</button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
