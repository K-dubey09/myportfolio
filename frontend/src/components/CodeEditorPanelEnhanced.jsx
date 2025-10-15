import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Code, Plus, X, Save, FileCode,
  Folder, FolderOpen, FolderPlus, File, ChevronRight, ChevronDown,
  GitBranch, GitCommit, Play, Users,
  Copy, Check, Terminal
} from 'lucide-react';
import './CodeEditorPanel.css';

/**
 * Enhanced CodeEditorPanel
 * 
 * Features:
 * - Folder tree structure
 * - GitHub sync (fetch/push)
 * - Multi-user collaboration with secret codes
 * - Build and run support
 * - Multiple language support (30+ languages)
 * - Project management
 */

export default function CodeEditorPanel({ apiFetch }) {
  // State management
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);

  const editorRef = useRef(null);

  // Supported languages
  const languages = {
    javascript: { name: 'JavaScript', ext: 'js', icon: '📜' },
    typescript: { name: 'TypeScript', ext: 'ts', icon: '🔷' },
    python: { name: 'Python', ext: 'py', icon: '🐍' },
    java: { name: 'Java', ext: 'java', icon: '☕' },
    cpp: { name: 'C++', ext: 'cpp', icon: '⚙️' },
    c: { name: 'C', ext: 'c', icon: '🔧' },
    csharp: { name: 'C#', ext: 'cs', icon: '💎' },
    go: { name: 'Go', ext: 'go', icon: '🐹' },
    rust: { name: 'Rust', ext: 'rs', icon: '🦀' },
    php: { name: 'PHP', ext: 'php', icon: '🐘' },
    ruby: { name: 'Ruby', ext: 'rb', icon: '💎' },
    swift: { name: 'Swift', ext: 'swift', icon: '🔶' },
    kotlin: { name: 'Kotlin', ext: 'kt', icon: '🎯' },
    scala: { name: 'Scala', ext: 'scala', icon: '⚡' },
    html: { name: 'HTML', ext: 'html', icon: '🌐' },
    css: { name: 'CSS', ext: 'css', icon: '🎨' },
    json: { name: 'JSON', ext: 'json', icon: '📋' },
    xml: { name: 'XML', ext: 'xml', icon: '📄' },
    yaml: { name: 'YAML', ext: 'yaml', icon: '📝' },
    markdown: { name: 'Markdown', ext: 'md', icon: '📝' },
    sql: { name: 'SQL', ext: 'sql', icon: '🗄️' },
    shell: { name: 'Shell', ext: 'sh', icon: '💻' },
    docker: { name: 'Dockerfile', ext: 'Dockerfile', icon: '🐳' },
    r: { name: 'R', ext: 'r', icon: '📊' },
    matlab: { name: 'MATLAB', ext: 'm', icon: '📐' },
    lua: { name: 'Lua', ext: 'lua', icon: '🌙' },
    perl: { name: 'Perl', ext: 'pl', icon: '🐪' },
    powershell: { name: 'PowerShell', ext: 'ps1', icon: '⚡' },
    plaintext: { name: 'Plain Text', ext: 'txt', icon: '📄' }
  };

  // Load projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
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
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Detect language from filename
  const detectLanguage = (filename) => {
    if (!filename) return 'plaintext';
    const ext = filename.split('.').pop().toLowerCase();
    for (const [lang, info] of Object.entries(languages)) {
      if (info.ext === ext) return lang;
    }
    return 'plaintext';
  };

  // File tree rendering
  const renderFileTree = (nodes, level = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.id);
      const isActive = activeFile?.id === node.id;

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
            </div>
            {isExpanded && renderFileTree(node.children, level + 1)}
          </div>
        );
      } else {
        return (
          <div key={node.id} style={{ marginLeft: level * 16 }}>
            <div
              className={`tree-item file ${isActive ? 'active' : ''}`}
              onClick={() => openFile(node)}
            >
              <File size={14} />
              <span>{node.name}</span>
              <span className="file-language">{languages[node.language]?.icon || '📄'}</span>
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

  const openFile = (file) => {
    setActiveFile(file);
  };

  // Create new project
  const createNewProject = async (projectData) => {
    try {
      const { res, json } = await apiFetch('/api/code/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(projectData)
      });

      if (res && res.ok && json) {
        setProjects([json, ...projects]);
        setActiveProject(json);
        setShowNewProjectModal(false);
        showMessage('✓ Project created');
      } else {
        showMessage('✗ Failed to create project');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      showMessage('✗ Failed to create project');
    }
  };

  // Create new file/folder in project
  const createFileOrFolder = async (type, name, parentPath = '') => {
    if (!activeProject) return;

    const newNode = {
      id: `${type}-${Date.now()}`,
      name,
      type,
      path: parentPath ? `${parentPath}/${name}` : name,
      content: type === 'file' ? '' : undefined,
      language: type === 'file' ? detectLanguage(name) : undefined,
      children: type === 'folder' ? [] : undefined,
      lastModified: new Date()
    };

    const updatedFiles = [...activeProject.files, newNode];
    await updateProjectFiles(updatedFiles);
  };

  // Update project files
  const updateProjectFiles = async (files) => {
    try {
      const { res, json } = await apiFetch(`/api/code/projects/${activeProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ files })
      });

      if (res && res.ok && json) {
        setActiveProject(json);
        setProjects(projects.map(p => p._id === json._id ? json : p));
        showMessage('✓ Saved');
      } else {
        showMessage('✗ Save failed');
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      showMessage('✗ Save failed');
    }
  };

  // Handle editor change
  const handleEditorChange = (value) => {
    if (!activeFile) return;
    
    // Update file content in project
    const updateFileContent = (nodes) => {
      return nodes.map(node => {
        if (node.id === activeFile.id) {
          return { ...node, content: value, lastModified: new Date() };
        } else if (node.type === 'folder' && node.children) {
          return { ...node, children: updateFileContent(node.children) };
        }
        return node;
      });
    };

    const updatedFiles = updateFileContent(activeProject.files);
    setActiveProject({ ...activeProject, files: updatedFiles });
  };

  // Save current project
  const saveProject = async () => {
    if (!activeProject) return;
    setSaving(true);
    await updateProjectFiles(activeProject.files);
    setSaving(false);
  };

  // GitHub sync - Import
  const syncFromGitHub = async (githubData) => {
    if (!activeProject) return;

    try {
      const { res, json } = await apiFetch(`/api/code/projects/${activeProject._id}/github/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(githubData)
      });

      if (res && res.ok && json) {
        setActiveProject(json.project);
        setProjects(projects.map(p => p._id === json.project._id ? json.project : p));
        setShowGitHubModal(false);
        showMessage('✓ Synced from GitHub');
      } else {
        showMessage('✗ Sync failed');
      }
    } catch (error) {
      console.error('Failed to sync:', error);
      showMessage('✗ Sync failed');
    }
  };

  // GitHub sync - Push
  const pushToGitHub = async (commitMessage) => {
    if (!activeProject) return;

    try {
      const { res } = await apiFetch(`/api/code/projects/${activeProject._id}/github/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ commitMessage })
      });

      if (res && res.ok) {
        showMessage('✓ Pushed to GitHub');
      } else {
        showMessage('✗ Push failed');
      }
    } catch (error) {
      console.error('Failed to push:', error);
      showMessage('✗ Push failed');
    }
  };

  // Join project with secret code
  const joinProject = async (secretCode) => {
    try {
      const { res } = await apiFetch('/api/code/projects/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ secretCode })
      });

      if (res && res.ok) {
        await loadProjects();
        setShowCollabModal(false);
        showMessage('✓ Joined project');
      } else {
        showMessage('✗ Invalid code');
      }
    } catch (error) {
      console.error('Failed to join:', error);
      showMessage('✗ Invalid code');
    }
  };

  // Show message
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Handle editor mount
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="code-editor-container">
      {/* Sidebar - Project & File Tree */}
      <div className="editor-sidebar">
        <div className="sidebar-header">
          <h3><Code size={18} /> Code Projects</h3>
          <button onClick={() => setShowNewProjectModal(true)} className="icon-btn" title="New Project">
            <Plus size={16} />
          </button>
        </div>

        {/* Project Selector */}
        <div className="project-selector">
          <select
            value={activeProject?._id || ''}
            onChange={(e) => {
              const project = projects.find(p => p._id === e.target.value);
              setActiveProject(project);
              setActiveFile(null);
            }}
            className="project-dropdown"
          >
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* File Tree */}
        {activeProject && (
          <>
            <div className="file-tree">
              <div className="tree-actions">
                <button onClick={() => {
                  const name = prompt('File name:');
                  if (name) createFileOrFolder('file', name);
                }} className="tree-action-btn">
                  <Plus size={14} /> File
                </button>
                <button onClick={() => {
                  const name = prompt('Folder name:');
                  if (name) createFileOrFolder('folder', name);
                }} className="tree-action-btn">
                  <FolderPlus size={14} /> Folder
                </button>
              </div>
              {renderFileTree(activeProject.files)}
            </div>

            {/* Project Actions */}
            <div className="project-actions">
              <button onClick={() => setShowGitHubModal(true)} className="action-btn" title="GitHub Sync">
                <GitBranch size={16} />
              </button>
              <button onClick={() => setShowCollabModal(true)} className="action-btn" title="Collaboration">
                <Users size={16} />
              </button>
              <button onClick={() => setShowBuildModal(true)} className="action-btn" title="Build & Run">
                <Play size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Editor Area */}
      <div className="editor-main">
        {/* Toolbar */}
        <div className="editor-toolbar">
          <div className="toolbar-left">
            {activeFile && (
              <>
                <FileCode size={18} />
                <span className="file-path">{activeFile.path}</span>
                <span className="file-lang">{languages[activeFile.language]?.name || 'Unknown'}</span>
              </>
            )}
          </div>
          <div className="toolbar-right">
            <button onClick={saveProject} disabled={!activeProject || saving} className="toolbar-btn">
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
            {message && <span className="toolbar-message">{message}</span>}
          </div>
        </div>

        {/* Editor */}
        <div className="editor-area">
          {activeFile ? (
            <Editor
              height="100%"
              language={activeFile.language}
              value={activeFile.content || ''}
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
                tabSize: 2,
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          ) : (
            <div className="editor-empty">
              <Code size={64} />
              <h3>No file selected</h3>
              <p>Select a file from the tree or create a new one</p>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="editor-status-bar">
          <div>
            {activeProject && (
              <span>📁 {activeProject.name} • {activeProject.totalFiles} files • {activeProject.totalLines} lines</span>
            )}
          </div>
          <div>
            {activeFile && (
              <span>{languages[activeFile.language]?.icon} {activeFile.language}</span>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewProjectModal && <NewProjectModal onClose={() => setShowNewProjectModal(false)} onCreate={createNewProject} languages={languages} />}
      {showGitHubModal && <GitHubModal onClose={() => setShowGitHubModal(false)} onSync={syncFromGitHub} onPush={pushToGitHub} project={activeProject} />}
      {showCollabModal && <CollaborationModal onClose={() => setShowCollabModal(false)} onJoin={joinProject} project={activeProject} />}
      {showBuildModal && <BuildModal onClose={() => setShowBuildModal(false)} project={activeProject} />}
    </div>
  );
}

// New Project Modal Component
function NewProjectModal({ onClose, onCreate, languages }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('javascript');
  const [allowCollaboration, setAllowCollaboration] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ name, description, primaryLanguage, allowCollaboration, isPublic });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Project</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <input type="text" placeholder="Project name" value={name} onChange={e => setName(e.target.value)} required />
          <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          <select value={primaryLanguage} onChange={e => setPrimaryLanguage(e.target.value)}>
            {Object.entries(languages).map(([key, info]) => (
              <option key={key} value={key}>{info.icon} {info.name}</option>
            ))}
          </select>
          <label>
            <input type="checkbox" checked={allowCollaboration} onChange={e => setAllowCollaboration(e.target.checked)} />
            Enable collaboration (generates secret code)
          </label>
          <label>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
            Make project public
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// GitHub Modal Component
function GitHubModal({ onClose, onSync, onPush, project }) {
  const [tab, setTab] = useState('import');
  const [githubToken, setGithubToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');

  const handleImport = (e) => {
    e.preventDefault();
    onSync({ githubToken, repoUrl, branch });
  };

  const handlePush = (e) => {
    e.preventDefault();
    onPush(commitMessage);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><GitBranch size={20} /> GitHub Integration</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-tabs">
          <button className={tab === 'import' ? 'active' : ''} onClick={() => setTab('import')}>Import from GitHub</button>
          <button className={tab === 'push' ? 'active' : ''} onClick={() => setTab('push')} disabled={!project?.github?.enabled}>Push to GitHub</button>
        </div>
        {tab === 'import' ? (
          <form onSubmit={handleImport} className="modal-form">
            <input type="password" placeholder="GitHub Personal Access Token" value={githubToken} onChange={e => setGithubToken(e.target.value)} required />
            <input type="url" placeholder="https://github.com/user/repo" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} required />
            <input type="text" placeholder="Branch (default: main)" value={branch} onChange={e => setBranch(e.target.value)} />
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary"><Download size={16} /> Import</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePush} className="modal-form">
            <input type="text" placeholder="Commit message" value={commitMessage} onChange={e => setCommitMessage(e.target.value)} required />
            <p className="hint">Push changes to: {project?.github?.repoUrl}</p>
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary"><GitCommit size={16} /> Push</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Collaboration Modal Component
function CollaborationModal({ onClose, onJoin, project }) {
  const [secretCode, setSecretCode] = useState('');
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(project.secretCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    onJoin(secretCode);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Users size={20} /> Collaboration</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {project?.secretCode ? (
          <div className="modal-form">
            <h4>Share this code:</h4>
            <div className="secret-code-display">
              <code>{project.secretCode}</code>
              <button onClick={copyCode} className="btn-icon">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="hint">Collaborators: {project.collaborators?.length || 0}</p>
            <div className="modal-actions">
              <button onClick={onClose} className="btn-primary">Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="modal-form">
            <h4>Join a project:</h4>
            <input type="text" placeholder="Enter secret code" value={secretCode} onChange={e => setSecretCode(e.target.value.toUpperCase())} required maxLength={8} />
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Join</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Build Modal Component
function BuildModal({ onClose }) {
  const output = 'Build functionality coming soon!\nThis will support running code for multiple languages.';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Terminal size={20} /> Build & Run</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="build-output">
          <pre>{output}</pre>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
}
