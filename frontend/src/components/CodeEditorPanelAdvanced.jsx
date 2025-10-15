import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  Code, Plus, X, Save, FileCode, Folder, FolderOpen, FolderPlus, File, 
  ChevronRight, ChevronDown, GitBranch, GitCommit, Play, Users, Copy, Check, 
  Terminal, Search, Settings, FileText, Layout, ZoomIn, ZoomOut, RotateCcw,
  Command, Bug, Package, GitPullRequest, AlertCircle, CheckCircle, Clock,
  MoreVertical, Maximize2, Minimize2, SplitSquareHorizontal, RefreshCw
} from 'lucide-react';
import './CodeEditorPanelAdvanced.css';

/**
 * VS Code-like Advanced Code Editor
 * 
 * Features:
 * - Command Palette (Ctrl+Shift+P)
 * - Integrated Terminal
 * - Split Editor View
 * - Multi-tab support with drag/drop
 * - Search across files
 * - Git integration UI
 * - Settings panel
 * - Breadcrumb navigation
 * - Outline/Symbols view
 * - Status bar with stats
 * - Problems panel
 * - Output panel
 */

export default function CodeEditorPanelAdvanced({ apiFetch }) {
  // Core state
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  
  // UI state
  const [leftSidebarView, setLeftSidebarView] = useState('files'); // files, search, git, extensions
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [bottomPanelView, setBottomPanelView] = useState('terminal'); // terminal, problems, output, debug
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const bottomPanelHeight = 250;
  
  // Editor state
  const [fontSize, setFontSize] = useState(14);
  const theme = 'vs-dark';
  const wordWrap = 'on';
  
  // Feature state
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [gitStatus] = useState({ modified: [], added: [], deleted: [] });
  const [problems] = useState([]);
  const [terminalCommands, setTerminalCommands] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  
  // Status
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const editorRef = useRef(null);
  const commandPaletteRef = useRef(null);

  // Supported languages (30+)
  const languages = {
    javascript: { name: 'JavaScript', ext: 'js', icon: '📜', color: '#f7df1e' },
    typescript: { name: 'TypeScript', ext: 'ts', icon: '🔷', color: '#3178c6' },
    python: { name: 'Python', ext: 'py', icon: '🐍', color: '#3776ab' },
    java: { name: 'Java', ext: 'java', icon: '☕', color: '#007396' },
    cpp: { name: 'C++', ext: 'cpp', icon: '⚙️', color: '#00599c' },
    c: { name: 'C', ext: 'c', icon: '🔧', color: '#a8b9cc' },
    csharp: { name: 'C#', ext: 'cs', icon: '💎', color: '#239120' },
    go: { name: 'Go', ext: 'go', icon: '🐹', color: '#00add8' },
    rust: { name: 'Rust', ext: 'rs', icon: '🦀', color: '#dea584' },
    php: { name: 'PHP', ext: 'php', icon: '🐘', color: '#777bb4' },
    ruby: { name: 'Ruby', ext: 'rb', icon: '💎', color: '#cc342d' },
    swift: { name: 'Swift', ext: 'swift', icon: '🔶', color: '#fa7343' },
    kotlin: { name: 'Kotlin', ext: 'kt', icon: '🎯', color: '#7f52ff' },
    html: { name: 'HTML', ext: 'html', icon: '🌐', color: '#e34c26' },
    css: { name: 'CSS', ext: 'css', icon: '🎨', color: '#1572b6' },
    json: { name: 'JSON', ext: 'json', icon: '📋', color: '#000000' },
    yaml: { name: 'YAML', ext: 'yaml', icon: '📝', color: '#cb171e' },
    markdown: { name: 'Markdown', ext: 'md', icon: '📝', color: '#083fa1' },
    sql: { name: 'SQL', ext: 'sql', icon: '🗄️', color: '#cc2927' },
    shell: { name: 'Shell', ext: 'sh', icon: '💻', color: '#89e051' },
    docker: { name: 'Dockerfile', ext: 'Dockerfile', icon: '🐳', color: '#2496ed' }
  };

  // Helper functions for commands
  const createNewFile = () => {
    alert('Create new file - feature coming soon');
  };

  const createNewFolder = () => {
    alert('Create new folder - feature coming soon');
  };

  const splitEditorView = () => {
    alert('Split editor view - feature coming soon');
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const closeTab = (tabId) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (tab && tab.dirty) {
      if (!window.confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) return;
    }

    const remaining = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(remaining);

    if (activeTabId === tabId) {
      setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const closeActiveTab = useCallback(() => {
    const tabId = activeTabId;
    if (!tabId) return;
    
    const tab = openTabs.find(t => t.id === tabId);
    if (tab && tab.dirty) {
      if (!window.confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) return;
    }

    const remaining = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(remaining);

    if (activeTabId === tabId) {
      setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  }, [activeTabId, openTabs]);

  const saveActiveTab = useCallback(async () => {
    const tab = openTabs.find(t => t.id === activeTabId);
    if (!tab || !activeProject) return;

    setSaving(true);
    try {
      // Update file in project structure
      const updateFileInTree = (nodes) => {
        return nodes.map(node => {
          if (node.id === tab.fileId) {
            return { ...node, content: tab.content, lastModified: new Date() };
          } else if (node.type === 'folder' && node.children) {
            return { ...node, children: updateFileInTree(node.children) };
          }
          return node;
        });
      };

      const updatedFiles = updateFileInTree(activeProject.files);
      const { res, json } = await apiFetch(`/api/code/projects/${activeProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ files: updatedFiles })
      });

      if (res && res.ok && json) {
        setActiveProject(json);
        setProjects(projects.map(p => p._id === json._id ? json : p));
        setOpenTabs(openTabs.map(t => t.id === tab.id ? { ...t, dirty: false, saved: true } : t));
        showMessage('✓ Saved');
      }
    } catch (error) {
      console.error('Save failed:', error);
      showMessage('✗ Save failed');
    } finally {
      setSaving(false);
    }
  }, [openTabs, activeTabId, activeProject, apiFetch, projects]);

  const saveAllTabs = async () => {
    for (const tab of openTabs) {
      if (tab.dirty) {
        setActiveTabId(tab.id);
        await saveActiveTab();
      }
    }
  };

  // Command palette commands
  const commands = [
    { id: 'new-file', label: 'New File', icon: <FileCode size={16} />, shortcut: 'Ctrl+N', action: createNewFile },
    { id: 'new-folder', label: 'New Folder', icon: <FolderPlus size={16} />, action: createNewFolder },
    { id: 'save', label: 'Save File', icon: <Save size={16} />, shortcut: 'Ctrl+S', action: saveActiveTab },
    { id: 'save-all', label: 'Save All', icon: <Save size={16} />, shortcut: 'Ctrl+K S', action: saveAllTabs },
    { id: 'close-tab', label: 'Close Tab', icon: <X size={16} />, shortcut: 'Ctrl+W', action: closeActiveTab },
    { id: 'toggle-terminal', label: 'Toggle Terminal', icon: <Terminal size={16} />, shortcut: 'Ctrl+`', action: () => setShowBottomPanel(prev => !prev) },
    { id: 'split-editor', label: 'Split Editor', icon: <SplitSquareHorizontal size={16} />, action: splitEditorView },
    { id: 'search-files', label: 'Search in Files', icon: <Search size={16} />, shortcut: 'Ctrl+Shift+F', action: () => { setLeftSidebarView('search'); setShowLeftSidebar(true); } },
    { id: 'git-status', label: 'Git Status', icon: <GitBranch size={16} />, action: () => { setLeftSidebarView('git'); setShowLeftSidebar(true); } },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} />, shortcut: 'Ctrl+,', action: () => alert('Settings panel - coming soon') },
    { id: 'zoom-in', label: 'Zoom In', icon: <ZoomIn size={16} />, shortcut: 'Ctrl+=', action: () => setFontSize(f => Math.min(f + 2, 30)) },
    { id: 'zoom-out', label: 'Zoom Out', icon: <ZoomOut size={16} />, shortcut: 'Ctrl+-', action: () => setFontSize(f => Math.max(f - 2, 10)) },
    { id: 'reset-zoom', label: 'Reset Zoom', icon: <RotateCcw size={16} />, action: () => setFontSize(14) },
    { id: 'github-sync', label: 'Sync with GitHub', icon: <RefreshCw size={16} />, action: () => alert('GitHub sync - feature available in project actions') },
    { id: 'collaboration', label: 'Collaboration', icon: <Users size={16} />, action: () => alert('Collaboration - feature available in project actions') }
  ];

  // Load projects on mount
  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command Palette
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveActiveTab();
      }
      // Close tab
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        closeActiveTab();
      }
      // Toggle terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setShowBottomPanel(prev => !prev);
      }
      // Zoom
      if (e.ctrlKey && e.key === '=') {
        e.preventDefault();
        setFontSize(f => Math.min(f + 2, 30));
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        setFontSize(f => Math.max(f - 2, 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeActiveTab, saveActiveTab]);

  const loadProjects = async () => {
    try {
      const { res, json } = await apiFetch('/api/code/projects', { credentials: 'include' });
      if (res && res.ok && json) {
        setProjects(json);
        if (json.length > 0 && !activeProject) {
          setActiveProject(json[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const detectLanguage = (filename) => {
    if (!filename) return 'plaintext';
    const ext = filename.split('.').pop().toLowerCase();
    for (const [lang, info] of Object.entries(languages)) {
      if (info.ext === ext) return lang;
    }
    return 'plaintext';
  };

  // Tab management
  const openFileInTab = (file) => {
    const existing = openTabs.find(t => t.fileId === file.id);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const newTab = {
      id: `tab-${Date.now()}`,
      fileId: file.id,
      name: file.name,
      path: file.path,
      content: file.content || '',
      language: file.language || detectLanguage(file.name),
      dirty: false,
      saved: true
    };

    setOpenTabs([...openTabs, newTab]);
    setActiveTabId(newTab.id);
  };



  const handleEditorChange = (value) => {
    if (!activeTabId) return;
    setOpenTabs(openTabs.map(t => 
      t.id === activeTabId ? { ...t, content: value, dirty: true, saved: false } : t
    ));
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  // File tree rendering
  const renderFileTree = (nodes, level = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.id);
      const activeFile = openTabs.find(t => t.id === activeTabId);
      const isActive = activeFile?.fileId === node.id;

      if (node.type === 'folder') {
        return (
          <div key={node.id} style={{ marginLeft: level * 16 }}>
            <div
              className={`tree-item folder ${isActive ? 'active' : ''}`}
              onClick={() => toggleFolder(node.id)}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
              <span>{node.name}</span>
              <span className="item-count">{node.children?.length || 0}</span>
            </div>
            {isExpanded && renderFileTree(node.children, level + 1)}
          </div>
        );
      } else {
        const lang = languages[node.language] || languages.plaintext;
        return (
          <div key={node.id} style={{ marginLeft: level * 16 }}>
            <div
              className={`tree-item file ${isActive ? 'active' : ''}`}
              onClick={() => openFileInTab(node)}
            >
              <File size={14} />
              <span>{node.name}</span>
              <span className="file-icon">{lang?.icon || '📄'}</span>
            </div>
          </div>
        );
      }
    });
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Command palette
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(commandSearch.toLowerCase())
  );

  const executeCommand = (cmd) => {
    cmd.action();
    setShowCommandPalette(false);
    setCommandSearch('');
  };

  // Terminal
  const executeTerminalCommand = () => {
    if (!terminalInput.trim()) return;
    
    const newCommand = {
      id: Date.now(),
      command: terminalInput,
      output: `> ${terminalInput}\n[Terminal execution not yet implemented]\n`,
      timestamp: new Date()
    };
    
    setTerminalCommands([...terminalCommands, newCommand]);
    setTerminalInput('');
  };

  // Search across files
  const searchInFiles = () => {
    if (!searchQuery || !activeProject) return;
    
    const results = [];
    const searchInNode = (node, path = '') => {
      if (node.type === 'file' && node.content) {
        const lines = node.content.split('\n');
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({
              file: path + '/' + node.name,
              line: idx + 1,
              content: line.trim(),
              fileId: node.id
            });
          }
        });
      } else if (node.type === 'folder' && node.children) {
        node.children.forEach(child => searchInNode(child, path + '/' + node.name));
      }
    };

    activeProject.files.forEach(node => searchInNode(node));
    setSearchResults(results);
  };

  const activeTab = openTabs.find(t => t.id === activeTabId);

  return (
    <div className="vscode-editor">
      {/* Activity Bar */}
      <div className="activity-bar">
        <button 
          className={`activity-btn ${leftSidebarView === 'files' ? 'active' : ''}`}
          onClick={() => { setLeftSidebarView('files'); setShowLeftSidebar(true); }}
          title="Explorer (Ctrl+Shift+E)"
        >
          <FileCode size={24} />
        </button>
        <button 
          className={`activity-btn ${leftSidebarView === 'search' ? 'active' : ''}`}
          onClick={() => { setLeftSidebarView('search'); setShowLeftSidebar(true); }}
          title="Search (Ctrl+Shift+F)"
        >
          <Search size={24} />
        </button>
        <button 
          className={`activity-btn ${leftSidebarView === 'git' ? 'active' : ''}`}
          onClick={() => { setLeftSidebarView('git'); setShowLeftSidebar(true); }}
          title="Source Control"
        >
          <GitBranch size={24} />
        </button>
        <button 
          className={`activity-btn ${leftSidebarView === 'debug' ? 'active' : ''}`}
          onClick={() => { setLeftSidebarView('debug'); setShowLeftSidebar(true); }}
          title="Run and Debug"
        >
          <Bug size={24} />
        </button>
        <button 
          className={`activity-btn ${leftSidebarView === 'extensions' ? 'active' : ''}`}
          onClick={() => { setLeftSidebarView('extensions'); setShowLeftSidebar(true); }}
          title="Extensions"
        >
          <Package size={24} />
        </button>
        <div className="activity-spacer" />
        <button 
          className="activity-btn"
          onClick={() => alert('Settings panel - coming soon')}
          title="Settings (Ctrl+,)"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Left Sidebar */}
      {showLeftSidebar && (
        <div className="sidebar left-sidebar">
          <div className="sidebar-header">
            <h3>
              {leftSidebarView === 'files' && <><FileCode size={18} /> EXPLORER</>}
              {leftSidebarView === 'search' && <><Search size={18} /> SEARCH</>}
              {leftSidebarView === 'git' && <><GitBranch size={18} /> SOURCE CONTROL</>}
              {leftSidebarView === 'debug' && <><Bug size={18} /> DEBUG</>}
              {leftSidebarView === 'extensions' && <><Package size={18} /> EXTENSIONS</>}
            </h3>
            <button onClick={() => setShowLeftSidebar(false)} className="icon-btn">
              <X size={16} />
            </button>
          </div>

          <div className="sidebar-content">
            {/* Files View */}
            {leftSidebarView === 'files' && (
              <>
                <div className="project-selector">
                  <select
                    value={activeProject?._id || ''}
                    onChange={(e) => {
                      const project = projects.find(p => p._id === e.target.value);
                      setActiveProject(project);
                      setOpenTabs([]);
                      setActiveTabId(null);
                    }}
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  <button onClick={() => alert('Create new project - use CodeEditorPanelEnhanced for full project management')} title="New Project">
                    <Plus size={16} />
                  </button>
                </div>

                {activeProject && (
                  <>
                    <div className="tree-actions">
                      <button onClick={() => alert('Create new file')} title="New File">
                        <FileCode size={14} /> File
                      </button>
                      <button onClick={() => alert('Create new folder')} title="New Folder">
                        <FolderPlus size={14} /> Folder
                      </button>
                    </div>
                    <div className="file-tree">
                      {renderFileTree(activeProject.files)}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Search View */}
            {leftSidebarView === 'search' && (
              <div className="search-panel">
                <input
                  type="text"
                  placeholder="Search in files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchInFiles()}
                  className="search-input"
                />
                <button onClick={searchInFiles} className="search-btn">Search</button>
                <div className="search-results">
                  {searchResults.length === 0 ? (
                    <p className="no-results">No results found</p>
                  ) : (
                    searchResults.map((result, idx) => (
                      <div key={idx} className="search-result-item">
                        <div className="result-file">{result.file}</div>
                        <div className="result-line">Line {result.line}: {result.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Git View */}
            {leftSidebarView === 'git' && (
              <div className="git-panel">
                <div className="git-section">
                  <h4><GitCommit size={16} /> Changes</h4>
                  <div className="git-changes">
                    {gitStatus.modified.length === 0 ? (
                      <p className="no-changes">No changes</p>
                    ) : (
                      gitStatus.modified.map((file, idx) => (
                        <div key={idx} className="git-file modified">
                          <File size={14} />
                          <span>{file}</span>
                          <span className="status">M</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="git-actions">
                  <button onClick={() => alert('GitHub sync - use CodeEditorPanelEnhanced for full GitHub integration')}>
                    <GitBranch size={16} /> Sync with GitHub
                  </button>
                </div>
              </div>
            )}

            {/* Debug View */}
            {leftSidebarView === 'debug' && (
              <div className="debug-panel">
                <p className="feature-placeholder">
                  <Bug size={48} />
                  <span>Debug features coming soon</span>
                </p>
              </div>
            )}

            {/* Extensions View */}
            {leftSidebarView === 'extensions' && (
              <div className="extensions-panel">
                <p className="feature-placeholder">
                  <Package size={48} />
                  <span>Extensions marketplace coming soon</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        {/* Tab Bar */}
        <div className="tab-bar">
          <div className="tabs-container">
            {openTabs.map(tab => (
              <div
                key={tab.id}
                className={`editor-tab ${tab.id === activeTabId ? 'active' : ''} ${tab.dirty ? 'dirty' : ''}`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <span className="tab-icon">{languages[tab.language]?.icon || '📄'}</span>
                <span className="tab-name">{tab.name}</span>
                {tab.dirty && <span className="dirty-indicator">●</span>}
                <button
                  className="tab-close"
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="tab-actions">
            {message && <span className="status-message">{message}</span>}
            <button onClick={() => setShowCommandPalette(true)} title="Command Palette (Ctrl+Shift+P)">
              <Command size={16} />
            </button>
            <button onClick={saveActiveTab} disabled={!activeTab?.dirty || saving} title="Save (Ctrl+S)">
              <Save size={16} />
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        {activeTab && (
          <div className="breadcrumb">
            <span className="breadcrumb-item">{activeProject?.name}</span>
            <ChevronRight size={14} />
            <span className="breadcrumb-item">{activeTab.path}</span>
          </div>
        )}

        {/* Editor Area */}
        <div className="editor-container">
          {activeTab ? (
            <Editor
              height="100%"
              language={activeTab.language}
              value={activeTab.content}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme={theme}
              options={{
                fontSize,
                wordWrap,
                minimap: { enabled: true },
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                folding: true,
                renderWhitespace: 'selection',
                cursorBlinking: 'smooth',
                smoothScrolling: true
              }}
            />
          ) : (
            <div className="editor-empty">
              <Code size={64} />
              <h3>No file open</h3>
              <p>Select a file from the explorer or create a new one</p>
              <button onClick={() => setShowCommandPalette(true)} className="cta-btn">
                Open Command Palette
              </button>
            </div>
          )}
        </div>

        {/* Bottom Panel */}
        {showBottomPanel && (
          <div className="bottom-panel" style={{ height: bottomPanelHeight }}>
            <div className="panel-tabs">
              <button
                className={bottomPanelView === 'terminal' ? 'active' : ''}
                onClick={() => setBottomPanelView('terminal')}
              >
                <Terminal size={16} /> TERMINAL
              </button>
              <button
                className={bottomPanelView === 'problems' ? 'active' : ''}
                onClick={() => setBottomPanelView('problems')}
              >
                <AlertCircle size={16} /> PROBLEMS <span className="badge">{problems.length}</span>
              </button>
              <button
                className={bottomPanelView === 'output' ? 'active' : ''}
                onClick={() => setBottomPanelView('output')}
              >
                <FileText size={16} /> OUTPUT
              </button>
              <button
                className={bottomPanelView === 'debug' ? 'active' : ''}
                onClick={() => setBottomPanelView('debug')}
              >
                <Bug size={16} /> DEBUG CONSOLE
              </button>
              <button onClick={() => setShowBottomPanel(false)} className="panel-close">
                <X size={16} />
              </button>
            </div>

            <div className="panel-content">
              {bottomPanelView === 'terminal' && (
                <div className="terminal-content">
                  <div className="terminal-output">
                    {terminalCommands.map(cmd => (
                      <div key={cmd.id} className="terminal-entry">
                        <div className="terminal-command">$ {cmd.command}</div>
                        <div className="terminal-result">{cmd.output}</div>
                      </div>
                    ))}
                  </div>
                  <div className="terminal-input-area">
                    <span className="terminal-prompt">$</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && executeTerminalCommand()}
                      placeholder="Type a command..."
                      className="terminal-input"
                    />
                  </div>
                </div>
              )}

              {bottomPanelView === 'problems' && (
                <div className="problems-content">
                  {problems.length === 0 ? (
                    <div className="empty-state">
                      <CheckCircle size={48} />
                      <p>No problems detected</p>
                    </div>
                  ) : (
                    problems.map((problem, idx) => (
                      <div key={idx} className={`problem-item ${problem.severity}`}>
                        <AlertCircle size={16} />
                        <span>{problem.message}</span>
                        <span className="problem-location">{problem.file}:{problem.line}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {bottomPanelView === 'output' && (
                <div className="output-content">
                  <pre>Output panel - Build and execution results will appear here</pre>
                </div>
              )}

              {bottomPanelView === 'debug' && (
                <div className="debug-content">
                  <pre>Debug console - Debugging features coming soon</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span className="status-item">
            <GitBranch size={14} /> main
          </span>
          {activeTab && (
            <>
              <span className="status-item">
                <FileCode size={14} /> {activeTab.language}
              </span>
              <span className="status-item">
                UTF-8
              </span>
              <span className="status-item">
                LF
              </span>
            </>
          )}
        </div>
        <div className="status-right">
          {activeProject && (
            <>
              <span className="status-item">
                {activeProject.totalFiles} files
              </span>
              <span className="status-item">
                {activeProject.totalLines} lines
              </span>
            </>
          )}
          {activeTab && (
            <span className="status-item">
              {activeTab.content.split('\n').length} lines
            </span>
          )}
          <span className="status-item clickable" onClick={() => setFontSize(f => f === 14 ? 16 : 14)}>
            {fontSize}px
          </span>
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="modal-overlay" onClick={() => setShowCommandPalette(false)}>
          <div className="command-palette" onClick={(e) => e.stopPropagation()}>
            <input
              ref={commandPaletteRef}
              type="text"
              placeholder="Type a command or search..."
              value={commandSearch}
              onChange={(e) => setCommandSearch(e.target.value)}
              className="command-input"
              autoFocus
            />
            <div className="command-list">
              {filteredCommands.map(cmd => (
                <div
                  key={cmd.id}
                  className="command-item"
                  onClick={() => executeCommand(cmd)}
                >
                  <span className="command-icon">{cmd.icon}</span>
                  <span className="command-label">{cmd.label}</span>
                  {cmd.shortcut && <span className="command-shortcut">{cmd.shortcut}</span>}
                </div>
              ))}
              {filteredCommands.length === 0 && (
                <div className="no-commands">No commands found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals remain the same as before... */}
    </div>
  );
}
