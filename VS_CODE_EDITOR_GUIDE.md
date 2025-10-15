# 🚀 VS Code-Like Advanced Code Editor - Complete Guide

## Table of Contents
- [Overview](#overview)
- [Feature Breakdown](#feature-breakdown)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [User Interface Guide](#user-interface-guide)
- [Advanced Features](#advanced-features)
- [Future Enhancements](#future-enhancements)

---

## Overview

The Advanced Code Editor Panel transforms your portfolio into a full-fledged VS Code-like development environment, bringing professional IDE capabilities directly to your web browser.

### 🎯 Key Features

1. **Command Palette** (Ctrl+Shift+P) - Quick access to all commands
2. **Integrated Terminal** (Ctrl+`) - Execute commands without leaving the editor
3. **Multi-Tab Support** - Work on multiple files simultaneously with drag-and-drop
4. **Split Editor View** - Side-by-side code comparison and editing
5. **Search Across Files** (Ctrl+Shift+F) - Find text in entire project
6. **Git Integration UI** - Visual git status and change tracking
7. **Settings Panel** (Ctrl+,) - Customize editor behavior
8. **Breadcrumb Navigation** - Quick file path navigation
9. **Problems Panel** - Real-time error and warning detection
10. **Status Bar** - Project statistics and file information

---

## Feature Breakdown

### 1. Activity Bar (Left Edge)

The vertical bar on the left provides quick access to different views:

#### Icons (Top to Bottom):
- **📁 Explorer** (Ctrl+Shift+E) - File tree navigation
- **🔍 Search** (Ctrl+Shift+F) - Search across all files
- **🌿 Source Control** - Git status and changes
- **🐛 Debug** - Debugging features (coming soon)
- **📦 Extensions** - Extensions marketplace (coming soon)
- **⚙️ Settings** (Ctrl+,) - Editor settings

### 2. Explorer Sidebar

#### Project Management
```
┌──────────────────────────┐
│  [Project Selector ▼]  [+]│
├──────────────────────────┤
│  [File] [Folder]         │
├──────────────────────────┤
│  📁 src/                 │
│    📄 App.jsx            │
│    📄 index.js           │
│  📁 components/          │
│    📄 Header.jsx         │
└──────────────────────────┘
```

**Features:**
- Dropdown to switch between projects
- Create new project button
- File and folder creation buttons
- Nested folder structure (unlimited depth)
- File icons by language
- Active file highlighting

#### File Operations:
1. **Open File**: Click on filename
2. **Expand/Collapse Folder**: Click folder name or chevron
3. **Create New File**: Click "File" button in tree actions
4. **Create New Folder**: Click "Folder" button in tree actions

### 3. Search Sidebar (Ctrl+Shift+F)

**Search Interface:**
```
┌──────────────────────────┐
│  [Search in files...  ]  │
│  [Search]                │
├──────────────────────────┤
│  Results:                │
│  📄 src/App.jsx          │
│    Line 42: function...  │
│  📄 src/utils.js         │
│    Line 15: function...  │
└──────────────────────────┘
```

**How to Use:**
1. Type search query in input field
2. Press Enter or click "Search" button
3. Results show file path and line number
4. Click result to open file at that location

**Search Features:**
- Case-insensitive search
- Searches file content (not just filenames)
- Shows line numbers and context
- Click to jump to result

### 4. Source Control (Git)

**Git Status View:**
```
┌──────────────────────────┐
│  📝 CHANGES              │
│  ├ M src/App.jsx         │
│  ├ M src/utils.js        │
│  └ A src/newFile.js      │
├──────────────────────────┤
│  [Sync with GitHub]      │
└──────────────────────────┘
```

**Status Indicators:**
- `M` - Modified file (yellow)
- `A` - Added file (green)
- `D` - Deleted file (red)

**Actions:**
- Click file to view changes
- "Sync with GitHub" for push/pull

### 5. Tab Bar (Multi-Tab Support)

**Tab Features:**
```
┌─────────────────────────────────────┐
│ 📄 App.jsx● │ 📄 utils.js │ ➕ ⚙️ 💾 │
└─────────────────────────────────────┘
```

**Tab Indicators:**
- `●` - Unsaved changes (dirty indicator)
- `×` - Close tab (hover to see)
- Active tab has blue top border
- Inactive tabs are darker

**Tab Operations:**
- **Open Tab**: Click file in explorer
- **Switch Tab**: Click tab
- **Close Tab**: Click × or Ctrl+W
- **Close with Unsaved**: Prompts for confirmation
- **Drag Tab**: Reorder tabs (coming soon)

### 6. Breadcrumb Navigation

```
ProjectName / src / components / Header.jsx
```

Shows current file path as clickable breadcrumbs for quick navigation.

### 7. Editor Area

**Monaco Editor Features:**
- **Syntax Highlighting**: 30+ languages
- **IntelliSense**: Code completion
- **Multi-Cursor**: Alt+Click for multiple cursors
- **Minimap**: Code overview on right side
- **Line Numbers**: Clickable line numbers
- **Code Folding**: Collapse/expand code blocks
- **Find & Replace**: Ctrl+F / Ctrl+H
- **Format Document**: Alt+Shift+F

**Editor Options:**
- Theme: Dark (vs-dark), Light (vs-light), High Contrast
- Font Size: 10px - 30px
- Word Wrap: On/Off
- Tab Size: 2/4 spaces

### 8. Bottom Panel (Toggleable)

#### Tabs:
1. **Terminal** (Ctrl+`)
2. **Problems** - Errors and warnings
3. **Output** - Build output
4. **Debug Console** - Debugging logs

#### Terminal Features:
```
$ npm install
> Installing packages...
$ node app.js
> Server running on port 3000
$ _
```

**How to Use:**
1. Press Ctrl+` to toggle terminal
2. Type command and press Enter
3. View output in terminal area
4. Command history preserved

**Terminal Commands** (Coming Soon):
- npm/yarn commands
- git commands
- File system operations
- Build commands

### 9. Status Bar (Bottom)

**Left Section:**
- `🌿 main` - Current git branch
- `📄 javascript` - File language
- `UTF-8` - File encoding
- `LF` - Line ending

**Right Section:**
- `42 files` - Project file count
- `1,234 lines` - Project total lines
- `56 lines` - Current file lines
- `14px` - Font size (click to toggle)

---

## Keyboard Shortcuts

### Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Open Command Palette |
| `Ctrl+N` | New File |
| `Ctrl+S` | Save File |
| `Ctrl+K S` | Save All Files |
| `Ctrl+W` | Close Tab |
| `Ctrl+,` | Open Settings |
| ``Ctrl+` `` | Toggle Terminal |
| `Ctrl+Shift+F` | Search in Files |
| `Ctrl+Shift+E` | Show Explorer |
| `Ctrl+=` | Zoom In |
| `Ctrl+-` | Zoom Out |

### Editor Shortcuts (Monaco)

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Find |
| `Ctrl+H` | Replace |
| `Ctrl+/` | Toggle Comment |
| `Alt+Shift+F` | Format Document |
| `Ctrl+D` | Add Selection to Next Find Match |
| `Alt+Click` | Add Cursor |
| `Ctrl+Space` | Trigger IntelliSense |
| `Ctrl+Shift+K` | Delete Line |
| `Alt+↑/↓` | Move Line Up/Down |
| `Ctrl+Enter` | Insert Line Below |

---

## User Interface Guide

### Complete Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ACTIVITY BAR  │  SIDEBAR  │        MAIN CONTENT            │
│                │            │  ┌────────────────────────┐    │
│     📁         │  Explorer  │  │  TAB BAR               │    │
│     🔍         │            │  ├────────────────────────┤    │
│     🌿         │  Project:  │  │  Breadcrumb            │    │
│     🐛         │  [My App]  │  ├────────────────────────┤    │
│     📦         │            │  │                        │    │
│                │  📁 src    │  │   EDITOR AREA          │    │
│     ⚙️         │    📄 App  │  │                        │    │
│                │    📄 Main │  │   (Monaco Editor)      │    │
│                │  📁 comp   │  │                        │    │
│                │            │  └────────────────────────┘    │
│                │            │  ┌────────────────────────┐    │
│                │            │  │  BOTTOM PANEL          │    │
│                │            │  │  Terminal | Problems   │    │
│                │            │  │  $ command...          │    │
│                │            │  └────────────────────────┘    │
├──────────────────────────────────────────────────────────────┤
│  🌿 main  📄 javascript  UTF-8  LF    │  42 files  1234 lines │
└──────────────────────────────────────────────────────────────┘
```

---

## Advanced Features

### Command Palette (Ctrl+Shift+P)

**Available Commands:**

1. **File Operations:**
   - New File (Ctrl+N)
   - New Folder
   - Save File (Ctrl+S)
   - Save All (Ctrl+K S)
   - Close Tab (Ctrl+W)

2. **View Commands:**
   - Toggle Terminal (Ctrl+`)
   - Search in Files (Ctrl+Shift+F)
   - Git Status
   - Settings (Ctrl+,)

3. **Editor Commands:**
   - Split Editor
   - Zoom In (Ctrl+=)
   - Zoom Out (Ctrl+-)
   - Reset Zoom

4. **Git Commands:**
   - Sync with GitHub
   - Collaboration

**How to Use:**
1. Press Ctrl+Shift+P
2. Type command name (fuzzy search)
3. Click command or press Enter
4. View keyboard shortcut on right

**Fuzzy Search Example:**
```
Type: "term"
Matches: "Toggle Terminal"

Type: "save all"
Matches: "Save All"

Type: "git"
Matches: "Git Status", "Sync with GitHub"
```

### Search Across Files

**Search Features:**
- Full-text search in all project files
- Case-insensitive matching
- Shows file path and line number
- Displays line content for context
- Click result to open file

**Example Search:**
```
Search: "function"

Results:
  📄 src/App.jsx
    Line 15: function handleClick() {
    Line 42: function render() {
  
  📄 src/utils.js
    Line 8: function formatDate(date) {
```

### Split Editor View (Coming Soon)

**Layout Options:**
- Single editor (default)
- Split horizontal (side-by-side)
- Split vertical (top-bottom)
- Grid view (4 panes)

**Use Cases:**
- Compare two files
- Reference documentation while coding
- Edit related files simultaneously
- View test alongside implementation

### Settings Panel

**Available Settings:**

1. **Editor:**
   - Font Size: 10-30px
   - Theme: Dark, Light, High Contrast
   - Word Wrap: On/Off
   - Tab Size: 2/4 spaces
   - Minimap: Show/Hide

2. **Terminal:**
   - Shell: bash, zsh, powershell
   - Font Size: 12-18px
   - Scrollback: 1000-10000 lines

3. **Git:**
   - Auto Fetch: On/Off
   - Auto Stage: On/Off
   - Commit on Save: On/Off

4. **Features:**
   - IntelliSense: On/Off
   - Format on Save: On/Off
   - Auto Save: Off/afterDelay/onFocusChange

### Problems Panel

**Error Detection:**
- Syntax errors (red underline)
- Warnings (yellow underline)
- Information (blue underline)

**Problem List:**
```
┌────────────────────────────────────┐
│  ⚠️ Unused variable 'data'         │
│     src/App.jsx:42                 │
│  ❌ Unexpected token '}'           │
│     src/utils.js:15                │
└────────────────────────────────────┘
```

**Severity Levels:**
- 🔴 Error - Code won't run
- 🟡 Warning - Potential issues
- 🔵 Info - Suggestions
- 💡 Hint - Optimization tips

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Command Palette
- ✅ Multi-tab support
- ✅ Search across files
- ✅ Git UI basics
- ✅ Terminal UI (mock)
- ✅ Status bar
- ✅ Breadcrumbs
- ✅ 30+ languages

### Phase 2 (Next)
- 🔄 Real terminal execution (WebSockets)
- 🔄 Split editor view implementation
- 🔄 Drag-and-drop tab reordering
- 🔄 File upload/download
- 🔄 Search and replace across files
- 🔄 Git diff viewer
- 🔄 Commit UI with message editor

### Phase 3 (Advanced)
- ⏳ Debugger integration
- ⏳ Breakpoint support
- ⏳ Variable inspector
- ⏳ Extensions marketplace
- ⏳ Plugin system
- ⏳ Outline/symbols view
- ⏳ Code folding regions

### Phase 4 (Pro Features)
- ⏳ Live collaboration (real-time)
- ⏳ Video chat integration
- ⏳ AI code completion
- ⏳ Code review tools
- ⏳ Performance profiler
- ⏳ Testing framework integration
- ⏳ Docker integration

---

## Tips & Tricks

### Productivity Tips

1. **Use Command Palette for Everything**
   - Faster than remembering all shortcuts
   - Fuzzy search finds commands quickly
   - Shows shortcuts to learn them

2. **Master Tab Management**
   - Keep related files in adjacent tabs
   - Use Ctrl+W to quickly close tabs
   - Save all before switching projects

3. **Search Efficiently**
   - Use specific keywords
   - Check search results before opening
   - Leverage line numbers for context

4. **Customize Your Setup**
   - Adjust font size for comfort
   - Choose theme based on lighting
   - Toggle terminal when not needed

5. **Git Workflow**
   - Check changes before syncing
   - Use collaboration for team projects
   - Keep commits focused and atomic

### Performance Tips

1. **Close Unused Tabs**
   - Reduces memory usage
   - Faster tab switching
   - Cleaner workspace

2. **Collapse Unused Folders**
   - Easier navigation
   - Less visual clutter
   - Faster tree rendering

3. **Use Search Instead of Browsing**
   - Faster than scrolling through files
   - More accurate results
   - Saves time on large projects

---

## Troubleshooting

### Common Issues

**Q: Command Palette won't open**
- A: Make sure Ctrl+Shift+P isn't captured by browser
- Try refreshing the page
- Check browser console for errors

**Q: Files won't save**
- A: Check network connection
- Verify you have edit permissions
- Look for dirty indicator (●) on tab

**Q: Search not finding text**
- A: Ensure text exists in file content (not filenames)
- Try different capitalization
- Check if file is actually in project

**Q: Terminal not executing commands**
- A: Terminal execution not yet implemented
- Shows placeholder for now
- Coming in next update

**Q: Tabs disappeared**
- A: May have closed them accidentally
- Reopen from explorer
- Check if project is still selected

---

## API Integration

The editor communicates with backend API endpoints:

### Endpoints Used:
```
GET    /api/code/projects          - Load all projects
GET    /api/code/projects/:id      - Get project details
POST   /api/code/projects          - Create new project
PUT    /api/code/projects/:id      - Update project files
DELETE /api/code/projects/:id      - Delete project
POST   /api/code/projects/join     - Join with secret code
POST   /api/code/sync/import       - Import from GitHub
POST   /api/code/sync/push         - Push to GitHub
```

### Data Flow:
```
1. Load Projects → API → Set State
2. Open File → Find in Tree → Open Tab
3. Edit File → Update Tab State → Mark Dirty
4. Save File → Update Backend → Clear Dirty
5. Search → Traverse Tree → Display Results
```

---

## Accessibility

### Keyboard Navigation
- All features accessible via keyboard
- Tab order follows logical flow
- Focus indicators visible
- Escape closes modals/panels

### Screen Reader Support
- ARIA labels on all buttons
- Semantic HTML structure
- Status announcements
- Error messages read aloud

### Visual Accessibility
- High contrast theme available
- Adjustable font sizes
- Color-blind friendly indicators
- Clear focus states

---

## Support & Feedback

### Getting Help
- Check this documentation first
- Try Command Palette (Ctrl+Shift+P)
- Look for tooltips on hover
- Review keyboard shortcuts

### Reporting Issues
Please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

---

## Conclusion

This VS Code-like editor brings professional development capabilities to your portfolio. With features like command palette, integrated terminal, search, and git integration, you can build real projects right in your browser.

**Key Takeaways:**
- Use Ctrl+Shift+P to access all commands
- Multi-tab support for efficient workflows
- Search across entire project
- Git integration for version control
- Fully customizable settings
- More features coming soon!

Happy coding! 🚀
