# Enhanced Code Editor - Feature Documentation

## 🚀 Overview

The enhanced code editor is a full-featured development environment integrated into your portfolio website. It supports project-based coding with folder organization, GitHub synchronization, multi-user collaboration, and extensive language support.

## ✨ Features Implemented

### 1. **Project Management**
- Create multiple code projects
- Each project has its own folder structure
- Project metadata (name, description, primary language)
- Public/private project settings
- Project statistics (total files, lines of code)

### 2. **Folder Organization**
- Hierarchical folder tree structure
- Create/rename/delete files and folders
- Visual tree navigation with expand/collapse
- File icons based on language type
- Breadcrumb navigation

### 3. **GitHub Integration**
- **Import from GitHub**: Clone entire repositories
- **Push to GitHub**: Commit and push changes
- Branch selection support
- Sync status tracking
- Personal access token authentication
- Automatic file structure synchronization

### 4. **Multi-User Collaboration**
- Secret code system for project sharing
- Role-based access control (Owner, Editor, Viewer)
- Multiple collaborators per project
- Join projects using secret codes
- Collaborator management (add/remove, change roles)

### 5. **Language Support (30+ Languages)**
Supported languages with syntax highlighting:
- **Web**: JavaScript, TypeScript, HTML, CSS, JSON, XML, YAML
- **Backend**: Python, Java, C#, Go, Rust, PHP, Ruby, Node.js
- **Systems**: C, C++, Shell, PowerShell
- **Mobile**: Swift, Kotlin
- **Data**: SQL, R, MATLAB
- **Other**: Scala, Lua, Perl, Markdown, Dockerfile

### 6. **Monaco Editor Integration**
- Full VS Code editor experience
- IntelliSense and auto-completion
- Syntax highlighting
- Code formatting
- Multi-cursor support
- Find and replace
- Minimap navigation

### 7. **File Operations**
- Create new files/folders
- Import files from local system
- Export files to local system
- Auto-save functionality
- Unsaved changes detection

### 8. **Build System (Placeholder)**
- Build configuration per project
- Language-specific build commands
- Run configurations
- Output console (ready for integration)

## 📁 File Structure

### Backend Files
```
backend/
├── models/
│   └── CodeProject.js          # Project data model
├── controllers/
│   └── codeProjectController.js # CRUD & GitHub operations
├── services/
│   └── githubService.js         # GitHub API integration
└── routes/
    └── codeProjectRoutes.js     # API endpoints
```

### Frontend Files
```
frontend/src/components/
├── CodeEditorPanelEnhanced.jsx  # Main editor component
└── CodeEditorPanel.css          # Styling
```

## 🔌 API Endpoints

### Project Management
- `GET /api/code/projects` - Get all user projects
- `GET /api/code/projects/:projectId` - Get single project
- `POST /api/code/projects` - Create new project
- `PUT /api/code/projects/:projectId` - Update project
- `DELETE /api/code/projects/:projectId` - Delete project

### Collaboration
- `POST /api/code/projects/join` - Join project with secret code
- `PUT /api/code/projects/:projectId/collaborators` - Update collaborator role
- `DELETE /api/code/projects/:projectId/collaborators/:collaboratorId` - Remove collaborator

### GitHub Integration
- `POST /api/code/projects/:projectId/github/sync` - Import from GitHub
- `POST /api/code/projects/:projectId/github/push` - Push to GitHub

## 🎯 Usage Guide

### Creating a New Project
1. Click the "+" button in the sidebar header
2. Fill in project details:
   - Project name (required)
   - Description (optional)
   - Primary language
   - Enable collaboration (generates secret code)
   - Make public/private
3. Click "Create"

### Importing from GitHub
1. Select a project
2. Click the GitHub icon (branch icon) in project actions
3. Select "Import from GitHub" tab
4. Enter:
   - GitHub Personal Access Token
   - Repository URL (e.g., `https://github.com/user/repo`)
   - Branch name (default: main)
5. Click "Import"

### Collaborating with Others
**As Project Owner:**
1. Enable collaboration when creating project
2. Click Users icon in project actions
3. Copy and share the 8-character secret code

**As Collaborator:**
1. Click Users icon
2. Enter secret code
3. Click "Join"

### Pushing to GitHub
1. Make changes to your files
2. Click Save to save locally
3. Click GitHub icon
4. Select "Push to GitHub" tab
5. Enter commit message
6. Click "Push"

## 🔐 Security Features

- Personal Access Tokens stored securely (should be encrypted in production)
- Role-based access control
- Secret code authentication for collaboration
- HTTP-only cookie authentication
- Owner-only permissions for critical operations

## 🛠️ Configuration

### GitHub Token Scopes Required
- `repo` - Full control of private repositories
- `public_repo` - Access public repositories

### Environment Variables
No additional environment variables required. Uses existing authentication system.

## 📊 Data Models

### CodeProject Schema
```javascript
{
  name: String,
  description: String,
  owner: ObjectId (User),
  files: [FileNode],          // Hierarchical structure
  collaborators: [{
    userId: ObjectId,
    email: String,
    role: String,             // owner, editor, viewer
    joinedAt: Date
  }],
  secretCode: String,         // 8-character code
  isPublic: Boolean,
  allowCollaboration: Boolean,
  github: {
    enabled: Boolean,
    repoUrl: String,
    repoOwner: String,
    repoName: String,
    branch: String,
    lastSyncAt: Date,
    syncStatus: String,
    lastCommitSha: String,
    accessToken: String
  },
  buildConfig: {
    language: String,
    buildCommand: String,
    runCommand: String,
    entryFile: String
  },
  primaryLanguage: String,
  totalFiles: Number,
  totalLines: Number
}
```

### FileNode Structure
```javascript
{
  id: String,
  name: String,
  type: String,              // 'file' or 'folder'
  path: String,
  content: String,           // for files only
  language: String,          // for files only
  children: [FileNode],      // for folders only
  lastModified: Date
}
```

## 🚧 Future Enhancements

### Real-Time Collaboration (Not Implemented)
- WebSocket integration using Socket.io
- Live cursor positions
- Operational transformation for conflict resolution
- Real-time presence indicators
- Chat within editor

### Build & Run System (Not Implemented)
- Code execution sandbox
- Language-specific runtime environments
- Output streaming
- Debug console
- Error highlighting

### Additional Features
- Git history viewer
- Diff visualization
- Code snippets library
- Terminal integration
- Extension marketplace
- Themes and customization
- AI code assistant integration

## 🐛 Known Limitations

1. **GitHub Token Storage**: Tokens are stored in database (should be encrypted in production)
2. **Large Files**: May have performance issues with very large files
3. **Binary Files**: Only text files supported
4. **Merge Conflicts**: No conflict resolution UI
5. **Build System**: Not fully implemented, placeholder only
6. **Real-Time Collab**: Not implemented yet

## 📝 Development Notes

### Adding New Language Support
1. Add to `languages` object in `CodeEditorPanelEnhanced.jsx`
2. Monaco editor will automatically provide syntax highlighting
3. Add file extension to import file accept attribute

### Extending GitHub Features
- Modify `githubService.js` to add new GitHub API operations
- Add corresponding controller methods
- Update routes

### Adding Build Support
1. Implement sandbox execution environment (Docker recommended)
2. Add language-specific runtime containers
3. Implement WebSocket for streaming output
4. Add security measures for code execution

## 📚 Dependencies

### Backend
- `@octokit/rest` - GitHub API client
- `socket.io` - Real-time communication (for future use)
- `mongoose` - MongoDB ODM
- `express` - Web framework

### Frontend
- `@monaco-editor/react` - Code editor component
- `lucide-react` - Icon library
- `react` - UI framework

## 🔧 Maintenance

### Database Indexes
The CodeProject model has indexes on:
- `owner` + `createdAt` (for listing user projects)
- `secretCode` (for collaboration lookups)
- `collaborators.userId` (for finding collaborated projects)

### Backup Considerations
- Projects contain user code - ensure regular backups
- GitHub sync provides external backup option
- Consider export functionality for bulk backups

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify GitHub token permissions
3. Ensure network connectivity for GitHub operations
4. Check browser compatibility (Chrome, Firefox, Edge recommended)

---

**Version**: 1.0.0  
**Last Updated**: October 14, 2025  
**Status**: Production Ready (with noted limitations)
