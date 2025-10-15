import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Code, Plus, X, Save, FileCode, Trash2, Download, Upload } from 'lucide-react';

/**
 * CodeEditorPanel
 * 
 * Full-featured code editor with:
 * - Multi-tab file management
 * - Monaco editor integration (VS Code editor)
 * - Sync with user's sharedRepos (save/load snippets)
 * - Language detection and syntax highlighting
 * - File import/export
 */

export default function CodeEditorPanel({ user, onSave }) {
  // Tabs state: each tab is { id, name, language, content, dirty }
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize tabs from user.sharedRepos on mount
  useEffect(() => {
    if (!user || !user.sharedRepos || user.sharedRepos.length === 0) {
      // Create a default welcome tab
      const welcomeTab = {
        id: Date.now(),
        name: 'welcome.js',
        language: 'javascript',
        content: '// Welcome to your code editor!\n// Click "New File" to create a new snippet\n// Save your work to sync it with your profile\n\nconsole.log("Hello, world!");',
        dirty: false
      };
      setTabs([welcomeTab]);
      setActiveTabId(welcomeTab.id);
      return;
    }

    // Load existing repos as tabs
    const loaded = user.sharedRepos
      .filter(r => r.content) // only load items with content (code snippets)
      .map((r, idx) => ({
        id: r.repoId || `repo-${idx}`,
        name: r.name || 'untitled',
        language: r.language || detectLanguage(r.name),
        content: r.content || '',
        dirty: false,
        repoId: r.repoId // track original ID for updates
      }));

    if (loaded.length === 0) {
      // No code snippets; add default tab
      const defaultTab = {
        id: Date.now(),
        name: 'snippet.js',
        language: 'javascript',
        content: '// Start coding...\n',
        dirty: false
      };
      setTabs([defaultTab]);
      setActiveTabId(defaultTab.id);
    } else {
      setTabs(loaded);
      setActiveTabId(loaded[0].id);
    }
  }, [user]);

  // Detect language from filename extension
  const detectLanguage = (filename) => {
    if (!filename) return 'plaintext';
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      sh: 'shell',
      yaml: 'yaml',
      yml: 'yaml',
      xml: 'xml',
      sql: 'sql'
    };
    return langMap[ext] || 'plaintext';
  };

  // Get active tab
  const activeTab = tabs.find(t => t.id === activeTabId);

  // Handle editor mount
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
      wordWrap: 'on',
      automaticLayout: true
    });
  };

  // Handle content change
  const handleEditorChange = (value) => {
    if (!activeTab) return;
    setTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, content: value, dirty: true } : t));
  };

  // Create new tab
  const createNewTab = () => {
    const newTab = {
      id: Date.now(),
      name: `untitled-${tabs.length + 1}.js`,
      language: 'javascript',
      content: '// New file\n',
      dirty: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // Close tab
  const closeTab = useCallback((tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tab.dirty) {
      const confirmed = window.confirm(`"${tab.name}" has unsaved changes. Close anyway?`);
      if (!confirmed) return;
    }
    const remaining = tabs.filter(t => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [tabs, activeTabId]);

  // Rename tab
  const renameTab = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    const newName = prompt('Enter new filename:', tab.name);
    if (!newName || newName === tab.name) return;
    const newLang = detectLanguage(newName);
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, name: newName, language: newLang, dirty: true } : t));
  };

  // Save current tab to profile
  const saveCurrentTab = useCallback(async () => {
    if (!activeTab) return;
    setSaving(true);
    setMessage('');
    try {
      const existing = (user && user.sharedRepos) ? user.sharedRepos.slice() : [];
      
      // Find if this tab corresponds to an existing repo
      const idx = existing.findIndex(r => r.repoId === activeTab.repoId || r.name === activeTab.name);
      
      const entry = {
        repoId: activeTab.repoId || `snippet-${Date.now()}`,
        name: activeTab.name,
        url: '',
        shared: true,
        description: `Code snippet: ${activeTab.language}`,
        language: activeTab.language,
        content: activeTab.content
      };

      if (idx !== -1) {
        // Update existing
        existing[idx] = entry;
      } else {
        // Add new
        existing.unshift(entry);
      }

      if (typeof onSave === 'function') {
        await onSave(existing);
        // Mark tab as clean
        setTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, dirty: false, repoId: entry.repoId } : t));
        setMessage('✓ Saved');
      }
    } catch (err) {
      console.error('save failed', err);
      setMessage('✗ Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 2000);
    }
  }, [activeTab, user, onSave]);

  // Delete current tab from profile
  const deleteCurrentTab = useCallback(async () => {
    if (!activeTab) return;
    const confirmed = window.confirm(`Delete "${activeTab.name}" from your profile?`);
    if (!confirmed) return;

    try {
      const remaining = (user && user.sharedRepos) ? user.sharedRepos.filter(r => r.repoId !== activeTab.repoId && r.name !== activeTab.name) : [];
      if (typeof onSave === 'function') {
        await onSave(remaining);
        closeTab(activeTab.id);
        setMessage('✓ Deleted');
      }
    } catch (err) {
      console.error('delete failed', err);
      setMessage('✗ Delete failed');
    }
  }, [activeTab, user, onSave, closeTab]);

  // Export current tab
  const exportCurrentTab = () => {
    if (!activeTab) return;
    const blob = new Blob([activeTab.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import file
  const importFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      const newTab = {
        id: Date.now(),
        name: file.name,
        language: detectLanguage(file.name),
        content: content || '',
        dirty: true
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="code-editor-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600, border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', background: 'var(--background-panel)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--border-color)', background: 'var(--background-secondary)', alignItems: 'center' }}>
        <button className="icon-btn" onClick={createNewTab} title="New File" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--background-primary)', cursor: 'pointer' }}>
          <Plus size={16} />
          New
        </button>
        <button className="icon-btn" onClick={saveCurrentTab} disabled={saving || !activeTab} title="Save" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--background-primary)', cursor: activeTab ? 'pointer' : 'not-allowed', opacity: activeTab ? 1 : 0.5 }}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button className="icon-btn" onClick={deleteCurrentTab} disabled={!activeTab || !activeTab.repoId} title="Delete from profile" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--background-primary)', cursor: (activeTab && activeTab.repoId) ? 'pointer' : 'not-allowed', opacity: (activeTab && activeTab.repoId) ? 1 : 0.5 }}>
          <Trash2 size={16} />
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="icon-btn" onClick={importFile} title="Import file" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--background-primary)', cursor: 'pointer' }}>
            <Upload size={16} />
          </button>
          <button className="icon-btn" onClick={exportCurrentTab} disabled={!activeTab} title="Export" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--background-primary)', cursor: activeTab ? 'pointer' : 'not-allowed', opacity: activeTab ? 1 : 0.5 }}>
            <Download size={16} />
          </button>
        </div>
        {message && <div style={{ marginLeft: 8, color: message.includes('✓') ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem' }}>{message}</div>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '4px 8px', borderBottom: '1px solid var(--border-color)', background: 'var(--background-secondary)', overflowX: 'auto', flexWrap: 'nowrap' }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            onDoubleClick={() => renameTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
              background: tab.id === activeTabId ? 'var(--background-primary)' : 'transparent',
              border: tab.id === activeTabId ? '1px solid var(--border-color)' : '1px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem'
            }}
          >
            <FileCode size={14} />
            <span>{tab.name}{tab.dirty ? ' •' : ''}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, position: 'relative' }}>
        {activeTab ? (
          <Editor
            height="100%"
            language={activeTab.language}
            value={activeTab.content}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              readOnly: false
            }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
              <Code size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>No file open</p>
              <button onClick={createNewTab} style={{ marginTop: 12, padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--background-primary)', cursor: 'pointer' }}>
                Create New File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.jsx,.ts,.tsx,.py,.html,.css,.json,.md,.java,.cpp,.c,.go,.rs,.sh,.yaml,.yml,.xml,.sql,.txt"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />

      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 12px', borderTop: '1px solid var(--border-color)', background: 'var(--background-secondary)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div>{activeTab ? `${activeTab.language} • ${activeTab.content.split('\n').length} lines` : 'No file'}</div>
        <div>{tabs.length} file{tabs.length !== 1 ? 's' : ''} open</div>
      </div>
    </div>
  );
}
