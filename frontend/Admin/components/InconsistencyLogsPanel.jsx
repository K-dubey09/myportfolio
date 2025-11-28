import React, { useState, useEffect } from 'react';
import './InconsistencyLogsPanel.css';

const InconsistencyLogsPanel = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [deletedAccounts, setDeletedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, logs, deleted
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // all, resolved, unresolved
  const [typeFilter, setTypeFilter] = useState('all'); // all, data_mismatch, missing_fields, etc.
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;
  
  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch stats
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/inconsistency-stats`, { headers });
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      setStats(statsData);
      
      // Fetch logs with filters
      let logsUrl = `${import.meta.env.VITE_API_URL}/api/admin/inconsistency-logs?`;
      if (statusFilter !== 'all') logsUrl += `status=${statusFilter}&`;
      if (typeFilter !== 'all') logsUrl += `type=${typeFilter}`;
      
      const logsRes = await fetch(logsUrl, { headers });
      if (!logsRes.ok) throw new Error('Failed to fetch logs');
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);
      
      // Fetch deleted accounts
      const deletedRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/deleted-accounts`, { headers });
      if (!deletedRes.ok) throw new Error('Failed to fetch deleted accounts');
      const deletedData = await deletedRes.json();
      setDeletedAccounts(deletedData.accounts || []);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleResolveLog = async (logId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/inconsistency-logs/${logId}/resolve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: 'Manually resolved by admin' })
        }
      );
      
      if (!response.ok) throw new Error('Failed to resolve log');
      
      await fetchData(); // Refresh data
      setActionLoading(false);
    } catch (err) {
      alert('Error resolving log: ' + err.message);
      setActionLoading(false);
    }
  };

  const handleRestoreUser = async (userId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/restore-user/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason: 'Admin restoration' })
        }
      );
      
      if (!response.ok) throw new Error('Failed to restore user');
      
      setShowRestoreConfirm(false);
      setShowUserModal(false);
      await fetchData(); // Refresh data
      alert('User access restored successfully!');
      setActionLoading(false);
    } catch (err) {
      alert('Error restoring user: ' + err.message);
      setActionLoading(false);
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/inconsistency-logs/${userId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch user logs');
      
      const data = await response.json();
      setSelectedUser(data);
      setShowUserModal(true);
    } catch (err) {
      alert('Error fetching user details: ' + err.message);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.userId?.toLowerCase().includes(query) ||
      log.userEmail?.toLowerCase().includes(query) ||
      log.userName?.toLowerCase().includes(query)
    );
  });

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getTypeColor = (type) => {
    switch (type) {
      case 'data_mismatch': return '#ff6b6b';
      case 'missing_fields': return '#ffa500';
      case 'missing_auth_record': return '#dc143c';
      case 'account_deleted': return '#666';
      default: return '#999';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'data_mismatch': return 'Data Mismatch';
      case 'missing_fields': return 'Missing Fields';
      case 'missing_auth_record': return 'Missing Auth';
      case 'account_deleted': return 'Deleted';
      default: return type;
    }
  };

  const exportToCSV = () => {
    const headers = ['Log ID', 'User ID', 'Email', 'Type', 'Status', 'Timestamp'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.userId,
      log.userEmail || 'N/A',
      getTypeLabel(log.type),
      log.resolved ? 'Resolved' : 'Unresolved',
      new Date(log.timestamp?._seconds * 1000).toLocaleString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inconsistency-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="inconsistency-panel">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading consistency data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inconsistency-panel">
        <div className="error-state">
          <h2>⚠️ Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="inconsistency-panel">
      <div className="panel-header">
        <h1>🔍 User Data Consistency Monitor</h1>
        <button className="refresh-btn" onClick={fetchData}>
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Logs ({filteredLogs.length})
        </button>
        <button
          className={`tab ${activeTab === 'deleted' ? 'active' : ''}`}
          onClick={() => setActiveTab('deleted')}
        >
          🗑️ Deleted Accounts ({deletedAccounts.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="overview-tab">
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Total Logs</h3>
                <p className="stat-value">{stats.totalLogs || 0}</p>
              </div>
            </div>

            <div className="stat-card unresolved">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>Unresolved Issues</h3>
                <p className="stat-value">{stats.unresolvedLogs || 0}</p>
              </div>
            </div>

            <div className="stat-card suspended">
              <div className="stat-icon">🔒</div>
              <div className="stat-content">
                <h3>Suspended Users</h3>
                <p className="stat-value">{stats.suspendedUsers || 0}</p>
              </div>
            </div>

            <div className="stat-card deleted">
              <div className="stat-icon">🗑️</div>
              <div className="stat-content">
                <h3>Deleted Accounts</h3>
                <p className="stat-value">{deletedAccounts.length}</p>
              </div>
            </div>
          </div>

          {stats.byType && Object.keys(stats.byType).length > 0 && (
            <div className="breakdown-section">
              <h3>Issues by Type</h3>
              <div className="type-breakdown">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="type-item">
                    <div className="type-bar">
                      <div
                        className="type-fill"
                        style={{
                          width: `${(count / stats.totalLogs) * 100}%`,
                          backgroundColor: getTypeColor(type)
                        }}
                      />
                    </div>
                    <div className="type-label">
                      <span className="type-name">{getTypeLabel(type)}</span>
                      <span className="type-count">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="logs-tab">
          {/* Filters */}
          <div className="filters-bar">
            <input
              type="text"
              placeholder="Search by user ID, email, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="data_mismatch">Data Mismatch</option>
              <option value="missing_fields">Missing Fields</option>
              <option value="missing_auth_record">Missing Auth</option>
              <option value="account_deleted">Deleted</option>
            </select>

            <button onClick={exportToCSV} className="export-btn">
              📥 Export CSV
            </button>
          </div>

          {/* Logs Table */}
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No logs found matching your filters
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="user-cell">
                          <strong>{log.userName || 'Unknown'}</strong>
                          <small>{log.userEmail || log.userId}</small>
                        </div>
                      </td>
                      <td>
                        <span
                          className="type-badge"
                          style={{ backgroundColor: getTypeColor(log.type) }}
                        >
                          {getTypeLabel(log.type)}
                        </span>
                      </td>
                      <td>
                        <div className="details-cell">
                          {log.details?.missingFields && (
                            <small>Missing: {log.details.missingFields.join(', ')}</small>
                          )}
                          {log.details?.inconsistencies && log.details.inconsistencies.length > 0 && (
                            <small>
                              {log.details.inconsistencies.length} inconsistency(ies)
                            </small>
                          )}
                          {log.details?.reason && (
                            <small>{log.details.reason}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <small>
                          {log.timestamp?._seconds
                            ? new Date(log.timestamp._seconds * 1000).toLocaleString()
                            : 'N/A'}
                        </small>
                      </td>
                      <td>
                        <span className={`status-badge ${log.resolved ? 'resolved' : 'unresolved'}`}>
                          {log.resolved ? '✅ Resolved' : '⚠️ Unresolved'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-view"
                            onClick={() => viewUserDetails(log.userId)}
                          >
                            👁️
                          </button>
                          {!log.resolved && (
                            <button
                              className="btn-resolve"
                              onClick={() => handleResolveLog(log.id)}
                              disabled={actionLoading}
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Deleted Accounts Tab */}
      {activeTab === 'deleted' && (
        <div className="deleted-tab">
          <div className="deleted-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Reason</th>
                  <th>Deleted At</th>
                </tr>
              </thead>
              <tbody>
                {deletedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No deleted accounts
                    </td>
                  </tr>
                ) : (
                  deletedAccounts.map((account, index) => (
                    <tr key={index}>
                      <td><code>{account.userId}</code></td>
                      <td>{account.userData?.email || 'N/A'}</td>
                      <td>{account.userData?.name || 'N/A'}</td>
                      <td>{account.reason}</td>
                      <td>
                        <small>
                          {account.deletedAt?._seconds
                            ? new Date(account.deletedAt._seconds * 1000).toLocaleString()
                            : 'N/A'}
                        </small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="user-info">
                <p><strong>User ID:</strong> <code>{selectedUser.userId}</code></p>
                <p><strong>Email:</strong> {selectedUser.userEmail || 'N/A'}</p>
                <p><strong>Name:</strong> {selectedUser.userName || 'N/A'}</p>
                <p><strong>Total Logs:</strong> {selectedUser.logs?.length || 0}</p>
              </div>

              <h3>Log History</h3>
              <div className="user-logs">
                {selectedUser.logs && selectedUser.logs.length > 0 ? (
                  selectedUser.logs.map((log, index) => (
                    <div key={index} className="user-log-item">
                      <div className="log-header">
                        <span
                          className="type-badge"
                          style={{ backgroundColor: getTypeColor(log.type) }}
                        >
                          {getTypeLabel(log.type)}
                        </span>
                        <small>
                          {log.timestamp?._seconds
                            ? new Date(log.timestamp._seconds * 1000).toLocaleString()
                            : 'N/A'}
                        </small>
                      </div>
                      <div className="log-details">
                        {log.details?.missingFields && (
                          <p>Missing Fields: {log.details.missingFields.join(', ')}</p>
                        )}
                        {log.details?.inconsistencies && (
                          <pre>{JSON.stringify(log.details.inconsistencies, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No logs available</p>
                )}
              </div>

              {selectedUser.isSuspended && (
                <div className="restore-section">
                  <button
                    className="restore-btn"
                    onClick={() => setShowRestoreConfirm(true)}
                    disabled={actionLoading}
                  >
                    🔓 Restore User Access
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation */}
      {showRestoreConfirm && (
        <div className="modal-overlay" onClick={() => setShowRestoreConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirm Restoration</h3>
            <p>Are you sure you want to restore access for this user?</p>
            <p>This will lift the suspension and allow them to use the application.</p>
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowRestoreConfirm(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={() => handleRestoreUser(selectedUser.userId)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Restoring...' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InconsistencyLogsPanel;
