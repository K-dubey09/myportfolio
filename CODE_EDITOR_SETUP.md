# Enhanced Code Editor - Quick Setup Guide

## 🚀 Quick Start

### Step 1: Backend Setup
The backend routes and models are already integrated. No additional configuration needed!

### Step 2: Frontend Integration
The enhanced editor is automatically loaded in ProfilePage when you navigate to the "Code Editor" section.

### Step 3: Using the Editor

#### Create Your First Project
1. Navigate to Profile → Code Editor
2. Click the "+" button in the sidebar
3. Fill in:
   ```
   Name: My First Project
   Language: JavaScript
   ✓ Enable collaboration
   ```
4. Click "Create"

#### Add Files
1. Click "+ File" in the file tree
2. Enter filename (e.g., `index.js`)
3. Start coding!

#### Import from GitHub
1. Get a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `public_repo`
   - Copy the token

2. In the editor:
   - Click the GitHub icon (branch)
   - Select "Import from GitHub"
   - Paste your token
   - Enter repo URL: `https://github.com/username/repo`
   - Click "Import"

#### Collaborate with Others
1. Owner shares the 8-character code (shown in Users modal)
2. Collaborator enters code in Users modal
3. Both can now edit the project!

## 🎨 UI Overview

```
┌─────────────────────────────────────────────────┐
│  📦 Code Projects              [+]              │
├─────────────┬───────────────────────────────────┤
│             │  📄 index.js  [JavaScript]        │
│ 📁 My Proj  ├────────────────────────────────────┤
│  ├─ src/    │                                    │
│  │  ├─ app  │  Code Editor Area                 │
│  │  └─ lib  │  (Monaco Editor)                  │
│  └─ README  │                                    │
│             │                                    │
│ [+ File]    │                                    │
│ [+ Folder]  ├────────────────────────────────────┤
│             │  📁 My Proj • 5 files • 342 lines │
├─────────────┴────────────────────────────────────┤
│  [Branch] [Users] [Play]                        │
└──────────────────────────────────────────────────┘
```

## 🎯 Common Tasks

### Task 1: Create a Simple JavaScript Project
```javascript
// 1. Create project named "Hello World"
// 2. Create file: hello.js
// 3. Add code:
console.log("Hello, World!");
const greet = (name) => `Hello, ${name}!`;
console.log(greet("Developer"));

// 4. Click Save
```

### Task 2: Import an Existing Repo
```
1. Project: nodejs-app
2. GitHub Token: ghp_xxxxxxxxxxxxx
3. Repo URL: https://github.com/myusername/nodejs-app
4. Branch: main
5. Import → Wait for sync
```

### Task 3: Organize with Folders
```
src/
├── components/
│   ├── Header.jsx
│   └── Footer.jsx
├── utils/
│   └── helpers.js
└── index.js
```

## ⚡ Keyboard Shortcuts

Inside Monaco Editor:
- `Ctrl/Cmd + S` - Save file
- `Ctrl/Cmd + F` - Find
- `Ctrl/Cmd + H` - Replace
- `Ctrl/Cmd + /` - Toggle comment
- `Alt + Up/Down` - Move line
- `Ctrl/Cmd + D` - Select next occurrence
- `Alt + Click` - Multi-cursor

## 🔑 Getting GitHub Token

### Method 1: Classic Token
1. https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Scopes: ✓ repo, ✓ public_repo
4. Click "Generate token"
5. **Copy immediately** (you won't see it again!)

### Method 2: Fine-grained Token
1. https://github.com/settings/tokens?type=beta
2. "Generate new token"
3. Repository access: "All repositories" or specific
4. Permissions:
   - Contents: Read and write
   - Metadata: Read-only
5. Generate and copy

## 📝 Example: Full Workflow

```
1. CREATE PROJECT
   Name: "My Web App"
   Language: JavaScript
   Collaboration: ON
   
2. CREATE STRUCTURE
   [+ Folder] → public
   [+ Folder] → src
   [+ File] → index.html (in public)
   [+ File] → app.js (in src)
   [+ File] → README.md

3. WRITE CODE
   index.html:
   <!DOCTYPE html>
   <html>
     <head><title>My App</title></head>
     <body>
       <h1>Hello World</h1>
       <script src="../src/app.js"></script>
     </body>
   </html>

   app.js:
   console.log('App loaded!');

4. SAVE
   Click [Save] button

5. SHARE (Optional)
   Click [Users] → Copy code → Share with team

6. PUSH TO GITHUB (Optional)
   Click [Branch] → "Push to GitHub"
   Message: "Initial commit"
```

## 🎨 Supported File Types

### Web Development
- `.html`, `.htm` - HTML
- `.css`, `.scss`, `.sass` - Stylesheets
- `.js`, `.jsx` - JavaScript/React
- `.ts`, `.tsx` - TypeScript
- `.json` - JSON data
- `.xml` - XML data
- `.yaml`, `.yml` - YAML

### Backend Languages
- `.py` - Python
- `.java` - Java
- `.cs` - C#
- `.go` - Go
- `.rs` - Rust
- `.php` - PHP
- `.rb` - Ruby

### Systems Programming
- `.c` - C language
- `.cpp`, `.cc`, `.cxx` - C++
- `.sh` - Shell script
- `.ps1` - PowerShell

### Mobile
- `.swift` - Swift (iOS)
- `.kt` - Kotlin (Android)

### Data & Config
- `.sql` - SQL
- `.md` - Markdown
- `.txt` - Plain text
- `Dockerfile` - Docker config

### Other
- `.r` - R language
- `.m` - MATLAB
- `.lua` - Lua
- `.pl` - Perl
- `.scala` - Scala

## ⚠️ Important Notes

### Security
- **Never share** your GitHub token publicly
- Tokens have full access to your repos
- Revoke unused tokens regularly
- Use fine-grained tokens when possible

### Limitations
- Max file size: Reasonable for code (not for binary/media)
- GitHub sync: Text files only
- Build/run: Not yet implemented
- Real-time collaboration: Coming soon

### Best Practices
1. **Save frequently** - Auto-save not implemented
2. **Sync regularly** with GitHub for backup
3. **Use folders** to organize large projects
4. **Descriptive names** for files and projects
5. **Comment your code** for collaborators

## 🐛 Troubleshooting

### "Failed to sync"
- Check GitHub token validity
- Verify repo URL format
- Ensure token has correct scopes
- Check network connection

### "Invalid code"
- Secret code is case-sensitive
- Code must be exactly 8 characters
- Owner must enable collaboration
- Ask owner to regenerate if expired

### "Save failed"
- Check authentication (refresh page)
- Verify network connection
- Check browser console for errors

### "No projects showing"
- Create a new project first
- Check if you're logged in
- Refresh the page

## 📞 Need Help?

1. Check the full documentation: `CODE_EDITOR_DOCUMENTATION.md`
2. Review error messages in browser console (F12)
3. Verify all dependencies are installed
4. Check network tab for failed API calls

---

**Ready to code?** Open Profile → Code Editor and start building! 🚀
