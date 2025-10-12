import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './ChatNewModal.css';

export default function ChatNewModal({ isOpen, onClose, apiFetch, defaultUsers = [], pinnedAdmin = null, onChatCreated }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  const { user } = useAuth();
  const [fallbackDefaults, setFallbackDefaults] = useState([]);
  const [pinnedAdminLocal, setPinnedAdminLocal] = useState(null);
  // (debug state removed)
  

  const shuffle = (arr) => {
    if (!Array.isArray(arr)) return [];
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setResults([]);

    (async () => {
      if (!apiFetch) return;
      try {
        // 1) try to build a list from recent chats
        let list = [];
        try {
          const { res, json, body } = await apiFetch('/api/chats');
            if (res && res.ok) {
            const chats = (json && (json.data || json)) || body || [];
            try {
              console.debug('ChatNewModal: chats summary', Array.isArray(chats) ? `${chats.length} items: ${chats.slice(0,3).map(c=> (c && (c._id||c.id)) || JSON.stringify(c)).join(', ')}` : JSON.stringify(chats).slice(0,200));
            } catch (e) { console.debug('ChatNewModal: summarize chats failed', e); }
            const map = new Map();
            chats.forEach(chat => {
              const parts = chat.participants || [];
              parts.forEach(p => {
                const id = p && (p._id || p.id || p);
                if (!id) return;
                if (user && String(id) === String(user._id || user.id)) return;
                if (pinnedAdmin && String(id) === String(pinnedAdmin._id || pinnedAdmin.id)) return;
                if (!map.has(String(id))) map.set(String(id), p);
              });
            });
            list = shuffle(Array.from(map.values())).slice(0, 8);
          }
  } catch (e) { console.debug('ChatNewModal: /api/chats fetch failed', e); }

        // 2) if still empty, try /api/users?limit=8
        if ((!list || list.length === 0) && apiFetch) {
          try {
            const { res: r2, json: j2, body: b2 } = await apiFetch('/api/users?limit=8');
            if (r2 && r2.ok) {
              const payload = j2 || b2 || {};
              const users = (payload.users || payload.data || payload) || [];
      list = shuffle(Array.isArray(users) ? users : []).slice(0, 8);
    try { console.debug('ChatNewModal: users?limit=8 sample', Array.isArray(users) ? `${users.length} items from /api/users?limit=8: ${users.slice(0,3).map(u=>u.name||u.email||u._id||u.id).join(', ')}` : JSON.stringify(users).slice(0,200)); } catch (e) { console.debug('ChatNewModal: summarize users?limit=8 failed', e); }
            }
      } catch (e) { console.debug('ChatNewModal: /api/users?limit=8 fetch failed', e); }
        }

        // 3) Try backend-provided recent users endpoint which returns defaults for empty-query suggestions
        let users5 = [];
        try {
          const usersEp = '/api/users/recent?limit=5';
          const { res: r4, json: j4, body: b4 } = await apiFetch(usersEp);
            if (r4 && r4.ok) {
            const payload = j4 || b4 || {};
            users5 = (payload.users || payload.data || payload) || [];
            if (Array.isArray(users5) && users5.length) {
              try { console.debug('ChatNewModal: users5 sample', `${users5.length} items from ${usersEp}: ${users5.slice(0,3).map(u=>u.name||u.email||u._id||u.id).join(', ')}`); } catch (e) { console.debug('ChatNewModal: summarize users5 failed', e); }
            }
          }
        } catch (e) { console.debug('ChatNewModal: /api/users/recent?limit=5 fetch failed', e); }

        // Decide final defaults: prefer chat/list, else users5, else try alt endpoints
        let finalDefaults = (list && list.length) ? list.slice(0,5) : [];
        if ((!finalDefaults || finalDefaults.length === 0) && Array.isArray(users5) && users5.length) {
          const admin = users5.find(u => (String(u.role || '').toLowerCase() === 'admin') || /admin/i.test(u.name || ''));
          if (admin) setPinnedAdminLocal(prev => prev || admin);
          const withoutAdmin = users5.filter(u => !(admin && String(u._id || u.id) === String(admin._id || admin.id)));
          finalDefaults = withoutAdmin.slice(0,5);
        }

        if ((!finalDefaults || finalDefaults.length === 0)) {
          const altEndpoints = ['/api/users', '/api/users?search=a&limit=5', '/api/admin/users?limit=5'];
          for (const ep of altEndpoints) {
            try {
              const { res: rAlt, json: jAlt, body: bAlt } = await apiFetch(ep);
              if (rAlt && rAlt.ok) {
                const payload = jAlt || bAlt || {};
                const usersAlt = (payload.users || payload.data || payload) || [];
                if (Array.isArray(usersAlt) && usersAlt.length) {
                  try { console.debug('ChatNewModal: alt users sample', `${usersAlt.length} items from ${ep}: ${usersAlt.slice(0,3).map(u=>u.name||u.email||u._id||u.id).join(', ')}`); } catch (e) { console.debug('ChatNewModal: summarize alt users failed', e); }
                  const adminAlt = usersAlt.find(u => (String(u.role || '').toLowerCase() === 'admin') || /admin/i.test(u.name || ''));
                  if (adminAlt) setPinnedAdminLocal(prev => prev || adminAlt);
                  const withoutAdminAlt = usersAlt.filter(u => !(adminAlt && String(u._id || u.id) === String(adminAlt._id || adminAlt.id)));
                  finalDefaults = withoutAdminAlt.slice(0,5);
                  break;
                }
              }
            } catch (e) { console.debug('ChatNewModal: alt endpoints loop failed', e); }
          }
        }

        if (mounted.current) setFallbackDefaults(finalDefaults);

        // If pinned admin still missing, best-effort lookup
        if (mounted.current && !pinnedAdmin && !pinnedAdminLocal) {
          try {
            const { res: rA, json: jA, body: bA } = await apiFetch(`/api/users?search=${encodeURIComponent('Administrator')}&limit=1`);
            if (rA && rA.ok) {
              const payload = jA || bA || {};
              const usersA = (payload.users || payload.data || payload) || [];
              if (Array.isArray(usersA) && usersA[0]) setPinnedAdminLocal(usersA[0]);
            }
          } catch (e) { console.debug('ChatNewModal: pinned admin lookup failed', e); }
        }

      } catch (err) {
        console.debug('ChatNewModal fallback defaults fetch failed', err);
      }
    })();
  }, [isOpen, apiFetch, defaultUsers, pinnedAdmin, user, pinnedAdminLocal]);

  useEffect(() => {
    const doSearch = async () => {
      const q = String(query || '').trim();
      if (!q) return setResults([]);
      setLoading(true);
      try {
        // If query looks like an ObjectId (24 hex chars), try direct lookup first
        let users = [];
        const isId = /^[0-9a-fA-F]{24}$/.test(q);
        if (isId) {
          const { res, json } = await apiFetch(`/api/users/${q}`);
          if (res && res.ok && json && (json.user || json)) {
            const u = json.user || json;
            users = u ? [u] : [];
          }
        }

        // Fallback / general search across users
        if (!users.length) {
          const { json, body } = await apiFetch(`/api/users?search=${encodeURIComponent(q)}&limit=10`);
          const payload = json || body || {};
          users = payload.users || payload.data || payload || [];
        }

        if (mounted.current) setResults(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error('search error', err);
        if (mounted.current) setResults([]);
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    const t = setTimeout(() => { if (query) doSearch(); else setResults([]); }, 250);
    return () => clearTimeout(t);
  }, [query, apiFetch]);

  const handleCreateChat = async (userId) => {
    try {
      const { res, json, body } = await apiFetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participantIds: [userId] }) });
      const payload = json || body || {};
      const chat = payload.data || payload.chat || payload;
      if (res && res.ok) {
        // ensure parent receives an id to open
        const chatId = (chat && (chat._id || chat.id)) || null;
        onChatCreated && onChatCreated(chatId || chat);
        onClose();
      }
    } catch (err) { console.error(err); }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-new-modal-overlay" role="dialog" aria-modal="true">
      <div className="chat-new-modal">
        <div className="chat-new-header">
          <h3>New Chat</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="chat-new-search">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users by name or id" aria-label="Search users" />
        </div>

        {/* debug panel removed */}

        <div className="chat-new-body">

          {/* Compute a single display list so:
               - when query is empty we show recent/default suggestions (defaultUsers or fallbackDefaults)
               - when query is non-empty we show search results
               - pinnedAdmin (if present) is always injected at the top and not duplicated */}

          {(() => {
              const src = query ? (Array.isArray(results) ? results : []) : ((Array.isArray(defaultUsers) && defaultUsers.length) ? defaultUsers : (Array.isArray(fallbackDefaults) ? fallbackDefaults : []));
              const seen = new Set();
              const normalized = [];
              (Array.isArray(src) ? src : []).forEach(item => {
                const id = item && (item._id || item.id);
                const key = id ? String(id) : JSON.stringify(item);
                if (!key) return;
                if (pinnedAdmin && String(pinnedAdmin._id || pinnedAdmin.id) === key) return;
                if (!seen.has(key)) { seen.add(key); normalized.push(item); }
              });
            
              const display = [];
              const adminToShow = pinnedAdmin || pinnedAdminLocal;
              if (query) {
                // search mode: admin first (if present) then all normalized search results
                if (adminToShow) display.push(adminToShow);
                display.push(...normalized);
              } else {
                // empty query: show admin + up to 4 suggestions
                if (adminToShow) display.push(adminToShow);
                const others = normalized.slice(0, 4);
                display.push(...others);
              }
            
              const label = query ? 'Search results' : ((Array.isArray(defaultUsers) && defaultUsers.length) ? 'Recent' : 'Suggestions');
            
              if (loading && query) return (<div className="muted">Searching...</div>);
              if (!loading && display.length === 0) return (<div className="muted">{query ? 'No users found' : 'No suggestions available'}</div>);
            
              return (
                <div className="default-list">
                  <div className="label">{label}</div>
                  {display.map(u => (
                    <div key={(u && (u._id || u.id)) || JSON.stringify(u)} className="user-row">
                      <div className="user-name">{(u && (u.name || u.email)) || 'Unnamed'}</div>
                      <div className="user-id">{(u && (u._id || u.id)) || ''}</div>
                      <button className="create-btn" onClick={() => handleCreateChat((u && (u._id || u.id)) || u)}>Chat</button>
                    </div>
                  ))}
                  {/* no fallback error UI needed */}
                </div>
              );
          })()}
        </div>
      </div>
    </div>
  );
}