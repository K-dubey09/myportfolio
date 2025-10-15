# ✅ Appwrite Migration Checklist

## 📋 Pre-Migration Setup

- [ ] Read `APPWRITE_QUICK_START.md` (5 min quick overview)
- [ ] Read `APPWRITE_MIGRATION_GUIDE.md` (detailed documentation)
- [ ] Verify Appwrite account access at https://cloud.appwrite.io/
- [ ] Confirm project exists: `68ef61ed0005c49591cf`
- [ ] Backup MongoDB data (optional but recommended)

---

## 🔑 Step 1: API Key Configuration

- [ ] Login to Appwrite Console: https://cloud.appwrite.io/
- [ ] Navigate to **Settings → API Keys**
- [ ] Click **"Create API Key"**
- [ ] Set name: "Code Projects Migration"
- [ ] **IMPORTANT**: Select **ALL SCOPES** ✅
- [ ] Copy the generated API key
- [ ] Open `backend/.env` file
- [ ] Add: `APPWRITE_API_KEY=your_key_here`
- [ ] Save and close `.env`
- [ ] Verify key is NOT committed to git (check `.gitignore`)

**Expected Result**: `.env` file contains valid Appwrite API key

---

## 🏗️ Step 2: Setup Collections & Storage

- [ ] Open terminal/command prompt
- [ ] Navigate to backend: `cd backend`
- [ ] Run setup script: `node scripts/setupAppwrite.js`
- [ ] Verify output shows:
  - [ ] ✅ `code_projects` collection created
  - [ ] ✅ 22 attributes added to code_projects
  - [ ] ✅ `collaborators` collection created  
  - [ ] ✅ 5 attributes added to collaborators
  - [ ] ✅ `project-files-bucket` storage created
  - [ ] ✅ Indexes created (owner_index, project_index)
- [ ] Open Appwrite Console → Database
- [ ] Confirm collections exist:
  - [ ] `code_projects` visible
  - [ ] `collaborators` visible
- [ ] Open Appwrite Console → Storage
- [ ] Confirm bucket exists:
  - [ ] `project-files-bucket` visible

**Expected Result**: 2 collections + 1 storage bucket created successfully

---

## 🚚 Step 3: Migrate Data

- [ ] Ensure MongoDB is running (check backend connection)
- [ ] Still in `backend` directory
- [ ] Run migration: `node scripts/migrateToAppwrite.js`
- [ ] Monitor output for:
  - [ ] "Connected to MongoDB" ✅
  - [ ] "Found X projects to migrate" (note the number)
  - [ ] Each project shows "✅ Migrated: [project name]"
  - [ ] Each collaborator shows "✅ Migrated collaborator: [email]"
  - [ ] "Migration Summary" shows success count
  - [ ] Zero failures reported
- [ ] Open Appwrite Console → Database → code_projects
- [ ] Verify project count matches MongoDB count
- [ ] Click on a project document
- [ ] Verify data looks correct:
  - [ ] name, description present
  - [ ] ownerId, ownerEmail correct
  - [ ] files field contains JSON
  - [ ] timestamps populated
- [ ] Open Appwrite Console → Database → collaborators
- [ ] Verify collaborators migrated (if any)

**Expected Result**: All MongoDB projects successfully migrated to Appwrite

---

## 🔄 Step 4: Update Frontend Code

### Option A: Full Switch to Appwrite (Recommended)

- [ ] Open `frontend/src/pages/ProfilePage.jsx` (or wherever CodeEditorPanel is used)
- [ ] Find the import: `import CodeEditorPanel from '../components/CodeEditorPanel.jsx'`
- [ ] Replace with: `import CodeEditorPanelAppwrite from '../components/CodeEditorPanelAppwrite.jsx'`
- [ ] Find usage: `<CodeEditorPanel ... />`
- [ ] Replace with: `<CodeEditorPanelAppwrite />`
- [ ] Remove old props (apiFetch, etc.) - Appwrite version doesn't need them
- [ ] Save file

### Option B: Keep Both for Testing

- [ ] Import both components
- [ ] Add state: `const [useCloud, setUseCloud] = useState(true)`
- [ ] Use conditional: `{useCloud ? <CodeEditorPanelAppwrite /> : <CodeEditorPanel ... />}`
- [ ] Add toggle button for switching
- [ ] Save file

**Expected Result**: Frontend configured to use Appwrite component

---

## 🧪 Step 5: Test Functionality

### Start Development Server
- [ ] Open new terminal
- [ ] Navigate to frontend: `cd frontend`
- [ ] Start dev server: `npm run dev`
- [ ] Wait for server to start
- [ ] Note the URL (usually http://localhost:5173 or 5174)

### Test Authentication
- [ ] Open browser to dev server URL
- [ ] Login with: kushagradubey5002@gmail.com / Dubey@5002
- [ ] Verify successful login
- [ ] Navigate to profile page or code editor section

### Test Project Loading
- [ ] Code editor should show "☁️ Appwrite Projects" header
- [ ] Projects should load from cloud
- [ ] Verify project list shows your migrated projects
- [ ] Check browser console for errors (should be none)

### Test Create Project
- [ ] Click "New Project" button
- [ ] Fill in project details:
  - [ ] Name: "Test Cloud Project"
  - [ ] Description: "Testing Appwrite integration"
  - [ ] Select language: JavaScript
- [ ] Click "Create"
- [ ] Verify project appears in list
- [ ] Check Appwrite Console → Database → Verify new document exists

### Test Edit & Save
- [ ] Select a project from list
- [ ] Create new file: "test.js"
- [ ] Add code: `console.log('Hello from Appwrite!');`
- [ ] Click "Save to Cloud" button
- [ ] Verify success message
- [ ] Refresh page
- [ ] Verify changes persisted

### Test Collaborators (if applicable)
- [ ] Open project with collaboration enabled
- [ ] View secret code
- [ ] Verify collaborator list loads
- [ ] Test adding collaborator (if possible)

### Test GitHub Metadata (if applicable)
- [ ] Open project with GitHub sync
- [ ] Verify GitHub URL displays
- [ ] Check last sync time
- [ ] Verify metadata intact

**Expected Result**: All features work with Appwrite cloud storage

---

## 🔍 Step 6: Verify Data Integrity

### Compare MongoDB vs Appwrite
- [ ] Open MongoDB Compass (or mongo shell)
- [ ] Count documents: `db.codeprojects.countDocuments()`
- [ ] Note the count
- [ ] Open Appwrite Console → Database → code_projects
- [ ] Note the document count
- [ ] Counts should match

### Spot Check Projects
- [ ] Pick 3-5 random projects
- [ ] For each project:
  - [ ] Compare name in MongoDB vs Appwrite
  - [ ] Compare ownerId
  - [ ] Compare file tree structure
  - [ ] Compare collaborators (if any)
  - [ ] Verify all data matches

### Check mongoId Field
- [ ] Open Appwrite Console → code_projects
- [ ] Click on any document
- [ ] Verify `mongoId` field exists
- [ ] Verify it contains the original MongoDB `_id`

**Expected Result**: Data is identical between MongoDB and Appwrite

---

## 📊 Step 7: Monitor Performance

### First 24 Hours
- [ ] Monitor Appwrite Console → Usage dashboard
- [ ] Check requests count
- [ ] Check bandwidth usage
- [ ] Check database reads/writes
- [ ] Verify within free tier limits (75k reads, 25k writes/month)

### Check Response Times
- [ ] Test project loading speed
- [ ] Test save operation speed
- [ ] Compare to previous MongoDB times
- [ ] Note any performance differences

### Error Monitoring
- [ ] Check browser console for errors
- [ ] Check Appwrite Console → Logs
- [ ] Check backend server logs
- [ ] Document any issues encountered

**Expected Result**: Performance is acceptable, no major issues

---

## 🎯 Step 8: Rollback Plan (If Needed)

### If Migration Fails
- [ ] Stop frontend dev server
- [ ] Run rollback: `node scripts/migrateToAppwrite.js rollback`
- [ ] Verify Appwrite data deleted
- [ ] Revert frontend code to use `CodeEditorPanel`
- [ ] Restart dev server
- [ ] Verify MongoDB version still works

### If Partial Success
- [ ] Document which projects failed
- [ ] Check error logs
- [ ] Fix issues in migration script
- [ ] Run rollback
- [ ] Re-run migration
- [ ] Verify success

**Expected Result**: Can safely rollback if needed

---

## 📝 Step 9: Documentation Update

- [ ] Update README.md with Appwrite info
- [ ] Add section: "Cloud Storage with Appwrite"
- [ ] Link to migration guides
- [ ] Document API key requirement
- [ ] Update setup instructions
- [ ] Add troubleshooting section
- [ ] Commit documentation changes

**Expected Result**: Project documentation reflects Appwrite integration

---

## 🎉 Step 10: Post-Migration Cleanup

### Optional: Remove MongoDB Dependency (After Confidence Period)
- [ ] Wait 1-2 weeks for thorough testing
- [ ] Backup MongoDB one last time
- [ ] Remove CodeEditorPanel component (old version)
- [ ] Remove codeProjectController (backend)
- [ ] Remove codeProjectRoutes (backend)
- [ ] Update package.json (remove unused dependencies)
- [ ] Test everything still works
- [ ] Commit final changes

### Mark Migration Complete
- [ ] Update APPWRITE_INTEGRATION_SUMMARY.md with completion date
- [ ] Add final notes and lessons learned
- [ ] Archive migration scripts (keep for reference)
- [ ] Celebrate! 🎉

**Expected Result**: Clean codebase using Appwrite exclusively

---

## 📈 Success Metrics

Mark migration successful when ALL of these are true:

- ✅ All MongoDB projects migrated (0 failures)
- ✅ All collaborators migrated
- ✅ Frontend loads projects from Appwrite
- ✅ Create/edit/save/delete operations work
- ✅ No console errors
- ✅ Performance is acceptable
- ✅ Data integrity verified
- ✅ Rollback plan tested (optional but recommended)
- ✅ Team members can use new system
- ✅ Documentation updated

---

## 🆘 Troubleshooting Reference

| Issue | Solution |
|-------|----------|
| "API key invalid" | Check `.env` has correct key, verify ALL scopes selected |
| "Collection not found" | Run `setupAppwrite.js` first |
| "Permission denied" | Login with kushagradubey5002@gmail.com, check Appwrite auth |
| "Migration failed" | Check MongoDB connection, verify data format |
| "Document too large" | Files >1MB need Storage bucket, not embedded JSON |
| "Network error" | Check internet, verify Appwrite endpoint accessible |
| "Projects not loading" | Check browser console, verify userId from auth |
| "Save fails" | Check Appwrite permissions, verify user authenticated |

---

## 📞 Resources

- **Quick Start**: [APPWRITE_QUICK_START.md](./APPWRITE_QUICK_START.md)
- **Full Guide**: [APPWRITE_MIGRATION_GUIDE.md](./APPWRITE_MIGRATION_GUIDE.md)
- **Summary**: [APPWRITE_INTEGRATION_SUMMARY.md](./APPWRITE_INTEGRATION_SUMMARY.md)
- **Appwrite Docs**: https://appwrite.io/docs
- **Appwrite Console**: https://cloud.appwrite.io/
- **Support**: https://appwrite.io/discord

---

## 🕐 Estimated Timeline

| Phase | Time | Status |
|-------|------|--------|
| Read documentation | 15-30 min | ⬜ |
| Get API key | 2 min | ⬜ |
| Run setup script | 30 sec | ⬜ |
| Run migration | 1-5 min | ⬜ |
| Update frontend | 5 min | ⬜ |
| Test functionality | 15-30 min | ⬜ |
| Verify data | 10 min | ⬜ |
| Monitor & document | Ongoing | ⬜ |
| **TOTAL** | **~1 hour** | ⬜ |

---

## ✅ Sign Off

**Migrated By**: _________________  
**Date Completed**: _________________  
**Projects Migrated**: _________________  
**Issues Encountered**: _________________  
**Overall Success**: ⬜ Yes ⬜ No ⬜ Partial  

**Notes**:
```
[Add any important notes or lessons learned here]
```

---

**Ready to start?** Begin with "Pre-Migration Setup" above! 🚀

**Print This Checklist**: Use it as a physical guide during migration!
