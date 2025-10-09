import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatModal from '../components/ChatModal';
import './PagesStyles.css';

const SocialPanel = () => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="social-panel-admin">
      <aside className="social-sidebar">
        <div className="sidebar-header">
          <h2>Social Panel</h2>
          <p className="muted">Admin tools & collaboration</p>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`nav-item${activeTab === 'chats' ? ' active' : ''}`} onClick={() => setActiveTab('chats')}>Chats</button>
          <button className={`nav-item${activeTab === 'collab' ? ' active' : ''}`} onClick={() => setActiveTab('collab')}>Collaborations</button>
        </nav>

        <div className="sidebar-actions">
          <button className="admin-chat-btn" onClick={() => setIsChatOpen(true)}>Open Admin Chat Panel</button>
        </div>
      </aside>

  <main className="social-main">
        {activeTab === 'overview' && (
          <section className="tab-overview">
            <h3>Overview</h3>
            <p>Quick stats and recent activity from chats and collaboration spaces will appear here.</p>
            <div className="overview-cards">
              <div className="card">Active Chats: <strong>—</strong></div>
              <div className="card">Unread Messages: <strong>—</strong></div>
              <div className="card">Open Collaboration Rooms: <strong>—</strong></div>
            </div>
          </section>
        )}

        {activeTab === 'chats' && (
          <section className="tab-chats">
            <h3>Live Chats</h3>
            <p>Monitor and join active user chats. Use the Admin Chat Panel to reply directly.</p>
            <div className="chats-placeholder">
              <p>No active chats yet.</p>
            </div>
          </section>
        )}

        {activeTab === 'collab' && (
          <section className="tab-collab">
            <h3>Collaborations</h3>
            <p>Create collaboration rooms, assign team members, and manage shared notes or tasks.</p>
            <div className="collab-actions">
              <button className="create-room-btn">Create Room</button>
              <button className="manage-rooms-btn">Manage Rooms</button>
            </div>
            <div className="collab-placeholder">
              <p>No collaboration rooms yet.</p>
            </div>
          </section>
        )}
      </main>

      {isChatOpen && (
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} adminView={true} />
      )}
    </div>
  );
};

export default SocialPanel;
