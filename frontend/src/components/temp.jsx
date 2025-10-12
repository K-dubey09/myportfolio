import React from "react";

export default function Temp() {
  return (
    <>
    
    <div className="chat-list">
        <div className="search-row">
          <Search size={14} />
          <input placeholder="Search chats..." onChange={() => {}} />
        </div>
        <div style={{ marginTop: 12 }}>
          {loadingChats && <div className="muted">Loading chats...</div>}
          {!loadingChats && chats.length === 0 && <div className="muted">No chats yet</div>}
          <div style={{ maxHeight: 360, overflowY: 'auto', marginTop: 8 }}>
            {chats.map(c => (
              <div key={c._id || c.id} className={`chat-item ${String(activeChatId) === String(c._id || c.id) ? 'active' : ''}`} onClick={() => setActiveChatId(c._id || c.id)}>
                <div style={{ fontWeight: 700 }}>{c.subject || (c.participants && c.participants.map(p => p.name).join(', '))}</div>
                <div className="muted" style={{ fontSize: '0.85rem' }}>{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="conversation">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>Conversation</h4>
          <div>
            <button onClick={() => { loadChats(); if (activeChatId) loadChat(activeChatId); }} className="refresh-btn">Refresh</button>
          </div>
        </div>

        <div ref={messagesRef} className="messages">
          {loadingMessages && <div className="muted">Loading messages...</div>}
          {!loadingMessages && messages.length === 0 && <div className="muted">Select a chat to view messages</div>}
          {messages.map(m => {
            const isMine = m.author && ((m.author._id && String(m.author._id) === String(user && user._id)) || (m.author === (user && user._id)));
            return (
              <div key={m._id || m.id} className="message-row">
                <div className="meta"><strong>{(m.author && (m.author.name || m.author.email)) || 'User'}</strong> <span style={{ marginLeft: 8 }}>{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</span></div>
                <div className={`bubble ${isMine ? 'outgoing' : 'incoming'}`}>{m.text || m.content}</div>
              </div>
            );
          })}
        </div>

        <div className="composer">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message..." />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button onClick={handleSend} className="send-btn">Send</button>
          </div>
        </div>
      </div>

      <div className="chat-right" style={{ flex: '0 0 24%', minWidth: 220 }}>
        {/* Sidebar intentionally left empty per request */}
      </div>
    </>
  )
}

