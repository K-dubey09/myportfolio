# Code Editor - Troubleshooting & Testing Guide

## ✅ Fixes Applied

### Issue 1: Create Button Not Working
**Problem**: The "Create" button in the new project modal wasn't working.

**Root Cause**: The `apiFetch` function in ProfilePage returns `{res, json}` format, but the CodeEditorPanelEnhanced component was expecting a direct response object.

**Fix Applied**:
- Updated all API calls to destructure `{ res, json }` from `apiFetch()`
- Fixed: `createNewProject`, `loadProjects`, `updateProjectFiles`, `syncFromGitHub`, `pushToGitHub`, `joinProject`

### Issue 2: Duplicate Index Warning
**Problem**: Mongoose warning about duplicate index on `secretCode` field.

**Root Cause**: Field had `unique: true` in schema definition AND a separate index declaration.

**Fix Applied**:
- Removed `unique: true` from field definition
- Added `{ unique: true, sparse: true }` to index declaration

## 🧪 Testing Steps

### Test 1: Create New Project ✓
1. Navigate to Profile → Code Editor
2. Click the **"+"** button in sidebar header
3. Fill in the modal:
   - **Name**: "testing project" (as shown in screenshot)
   - **Description**: "its just for testing"
   - **Language**: JavaScript (selected)
   - **✓ Enable collaboration** (checked)
   - **✓ Make project public** (checked)
4. Click **"Create"**
5. **Expected**: Project appears in dropdown, modal closes, success message shows

### Test 2: File Tree Operations
1. With active project, click **"+ File"**
2. Enter filename: `index.js`
3. File should appear in tree
4. Click the file to open in editor
5. Type some code
6. Click **"Save"**
7. **Expected**: "✓ Saved" message appears

### Test 3: Folder Creation
1. Click **"+ Folder"**
2. Enter name: `src`
3. Folder appears in tree with folder icon
4. Click to expand/collapse
5. Create file inside folder (would need deeper implementation)

### Test 4: Language Detection
Create files with different extensions and verify language detection:
- `app.js` → JavaScript
- `styles.css` → CSS
- `index.html` → HTML
- `script.ts` → TypeScript
- `main.py` → Python
- `App.java` → Java

### Test 5: Project Switching
1. Create 2-3 projects
2. Use dropdown to switch between them
3. Verify correct files load for each project

### Test 6: Collaboration (2 Users Required)
**User A (Owner):**
1. Create project with collaboration enabled
2. Click **Users icon**
3. Copy the 8-character secret code
4. Share with User B

**User B (Collaborator):**
1. Navigate to Code Editor
2. Click **Users icon**
3. Paste secret code
4. Click **"Join"**
5. Project should appear in their list

### Test 7: GitHub Import (Requires GitHub Token)
1. Get token from https://github.com/settings/tokens
   - Scopes: `repo`, `public_repo`
2. Click **GitHub icon** (branch)
3. Select "Import from GitHub"
4. Enter:
   - Token: `ghp_xxxxx...`
   - URL: `https://github.com/username/repo`
   - Branch: `main`
5. Click **"Import"**
6. Wait for sync (may take time for large repos)
7. Files should populate in tree

### Test 8: GitHub Push
1. After importing a project
2. Make changes to files
3. Click **"Save"**
4. Click **GitHub icon**
5. Select "Push to GitHub"
6. Enter commit message
7. Click **"Push"**
8. Verify changes on GitHub

## 🐛 Common Issues & Solutions

### Issue: "Failed to create project"
**Check**:
1. Open browser console (F12) → Console tab
2. Look for error messages
3. Common causes:
   - Not authenticated (refresh page, log in again)
   - Backend not running (check terminal)
   - Database connection issue

**Solution**:
```bash
# Check if backend is running
cd d:\portfolio\backend
npm start

# Check if MongoDB is running
# Verify .env has MONGODB_URI set
```

### Issue: "No projects showing"
**Check**:
1. Console for API errors
2. Network tab → XHR → `/api/code/projects`
3. Response status and body

**Solution**:
- If 401: Authentication issue, re-login
- If 404: Routes not mounted, check server.js
- If 500: Server error, check backend terminal

### Issue: GitHub sync fails
**Common causes**:
1. Invalid token
2. Wrong repo URL format
3. No permissions on repo
4. Repo is private but token lacks permissions

**Solution**:
- Token must have `repo` scope for private repos
- URL format: `https://github.com/owner/repo` (no .git)
- Try with a public repo first

### Issue: Collaboration code doesn't work
**Check**:
1. Code is exactly 8 characters
2. Code is uppercase
3. Project has collaboration enabled
4. Both users are authenticated

**Solution**:
- Owner should verify in Users modal
- Code is case-sensitive
- Regenerate code if needed (delete and recreate project with collab enabled)

### Issue: Files not saving
**Check**:
1. Console for errors
2. Network tab for PUT request to `/api/code/projects/:id`
3. Response status

**Solution**:
- Verify user has edit permissions
- If viewer role, ask owner to upgrade to editor
- Check if project still exists

## 📊 API Testing (Manual)

### Test Create Project
```bash
# Using curl (replace TOKEN with your JWT)
curl -X POST http://localhost:5000/api/code/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "API Test",
    "primaryLanguage": "javascript",
    "allowCollaboration": true
  }'
```

### Test Get Projects
```bash
curl -X GET http://localhost:5000/api/code/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Join Project
```bash
curl -X POST http://localhost:5000/api/code/projects/join \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"secretCode": "ABC12345"}'
```

## 🔍 Debugging Tips

### Enable Detailed Logging
**Backend** (server.js):
```javascript
// Add after route mounting
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Frontend** (CodeEditorPanelEnhanced.jsx):
```javascript
// Add in any function
console.log('Creating project:', projectData);
console.log('API response:', res, json);
```

### Check Authentication
```javascript
// In browser console
localStorage.getItem('authToken') // Should be null (using cookies now)
document.cookie // Should see refresh token
```

### Verify Backend Routes
```bash
# Check if routes are registered
cd d:\portfolio\backend
grep -r "codeProjectRoutes" server.js
```

### Database Inspection
```bash
# MongoDB shell
mongosh
use your_database_name
db.codeprojects.find().pretty()
db.codeprojects.countDocuments()
```

## 📝 Next Steps After Testing

### If Everything Works ✅
1. Mark "Test project creation" as completed
2. Test all other features systematically
3. Document any bugs found
4. Consider implementing optional features:
   - Real-time collaboration
   - Build & run system
   - Token encryption

### If Issues Found 🐛
1. Note the exact error message
2. Check browser console
3. Check backend terminal
4. Review the relevant code section
5. Apply fixes incrementally
6. Re-test after each fix

## 🎯 Success Criteria

**Minimum Viable (MVP)**:
- ✅ Can create projects
- ✅ Can add files
- ✅ Can edit in Monaco editor
- ✅ Can save changes
- ✅ Projects persist across refreshes

**Full Feature Set**:
- ✅ All MVP features
- ✅ Folder organization
- ✅ GitHub import works
- ✅ GitHub push works
- ✅ Collaboration codes work
- ✅ All 30+ languages supported
- ✅ No console errors

## 📞 Support

If issues persist:
1. Check all documentation files
2. Review error logs carefully
3. Test with minimal example (small project, one file)
4. Verify all dependencies installed
5. Check Node.js and npm versions

---

**Last Updated**: October 14, 2025  
**Status**: Ready for Testing  
**Critical Fixes**: Applied ✅
