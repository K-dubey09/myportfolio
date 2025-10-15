# Appwrite Migration Guide - Code Projects

## 🎯 Overview

This guide helps you migrate your code projects from MongoDB to Appwrite cloud storage. Appwrite provides:
- ☁️ Cloud-hosted database
- 🔐 Built-in authentication
- 🔄 Real-time subscriptions
- 📦 File storage
- 🌍 Global CDN

## 📋 Prerequisites

1. **Appwrite Account**: https://cloud.appwrite.io/
2. **Project ID**: `68ef61ed0005c49591cf` (already configured)
3. **API Key**: Required for backend operations

## 🚀 Quick Start (3 Steps)

### Step 1: Get Appwrite API Key

1. Go to https://cloud.appwrite.io/
2. Select your project
3. Navigate to **Settings → API Keys**
4. Click **"Create API Key"**
5. Configure:
   - Name: "Code Projects Migration"
   - Expiration: Never (or custom)
   - Scopes: **SELECT ALL** (for full access)
6. **Copy the API key immediately** (you won't see it again!)

### Step 2: Add API Key to Environment

Add to `.env` file in backend folder:

```env
APPWRITE_API_KEY=your_api_key_here
```

Example:
```env
APPWRITE_API_KEY=5f5e8c9d0b5a4d3c2b1a0f9e8d7c6b5a4d3c2b1a0f9e8d7c6b5a4d3c2b1
```

### Step 3: Run Migration Scripts

```bash
# 1. Setup Appwrite collections and buckets
cd backend
node scripts/setupAppwrite.js

# 2. Migrate data from MongoDB to Appwrite
node scripts/migrateToAppwrite.js

# 3. Verify migration
# Check Appwrite console: https://cloud.appwrite.io/
```

## 📝 Detailed Steps

### 1. Appwrite Setup Script

This creates the necessary collections and storage buckets:

```bash
cd backend
node scripts/setupAppwrite.js
```

**What it creates:**
- ✅ `code_projects` collection (stores project metadata and files)
- ✅ `collaborators` collection (stores project collaborators)
- ✅ `project-files-bucket` storage bucket (for large files)

**Expected output:**
```
🚀 Setting up Appwrite for Code Projects
==================================================
📦 Creating code_projects collection...
✅ Collection created: code_projects
  ✅ Created attribute: name
  ✅ Created attribute: description
  ... (more attributes)
  ✅ Created index: owner_index
✅ Code Projects collection setup complete

👥 Creating collaborators collection...
✅ Collection created: collaborators
  ... (attributes)
✅ Collaborators collection setup complete

🗂️ Creating project-files-bucket...
✅ Bucket created: project-files-bucket
✅ Storage bucket setup complete

==================================================
✅ Appwrite setup complete!
```

### 2. Migration Script

This transfers your existing data from MongoDB to Appwrite:

```bash
node scripts/migrateToAppwrite.js
```

**What it does:**
- Connects to MongoDB
- Fetches all code projects
- Transforms data to Appwrite format
- Creates documents in Appwrite
- Migrates collaborators
- Provides progress feedback

**Expected output:**
```
🚀 Starting migration from MongoDB to Appwrite...
✅ Connected to MongoDB
📦 Found 5 projects to migrate

📝 Migrating: My React App
✅ Migrated: My React App (65f8b2c3d4e5f6g7h8i9)
  ✅ Migrated collaborator: user@example.com

📝 Migrating: Python Project
✅ Migrated: Python Project (75f8b2c3d4e5f6g7h8i9)

... (more projects)

==================================================
📊 Migration Summary:
✅ Success: 5
❌ Failed: 0
📦 Total: 5
==================================================
```

### 3. Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
node scripts/migrateToAppwrite.js rollback
```

This deletes all migrated data from Appwrite (MongoDB data is untouched).

## 🔄 Using Appwrite in Your App

### Frontend Integration

#### Option 1: Update ProfilePage to use Appwrite component

```javascript
// In ProfilePage.jsx
import CodeEditorPanelAppwrite from '../components/CodeEditorPanelAppwrite.jsx';

// Replace:
<CodeEditorPanel apiFetch={apiFetch} ... />

// With:
<CodeEditorPanelAppwrite />
```

#### Option 2: Keep both (switchable)

```javascript
const [useAppwrite, setUseAppwrite] = useState(true);

{useAppwrite ? (
  <CodeEditorPanelAppwrite />
) : (
  <CodeEditorPanel apiFetch={apiFetch} ... />
)}
```

### Backend Integration

The Appwrite service is ready to use:

```javascript
import { appwriteCodeProjectService } from '../lib/appwriteCodeProjects.js';

// Create project
const project = await appwriteCodeProjectService.createProject({
  name: "My Project",
  ownerId: userId,
  ownerEmail: userEmail
});

// Get user projects
const projects = await appwriteCodeProjectService.getUserProjects(userId);

// Update project
await appwriteCodeProjectService.updateProject(projectId, { 
  name: "New Name" 
});
```

## 📊 Data Structure

### Appwrite vs MongoDB

| Feature | MongoDB | Appwrite |
|---------|---------|----------|
| Storage | Self-hosted | Cloud-hosted |
| Authentication | Custom JWT | Built-in |
| Real-time | Manual WebSocket | Built-in subscriptions |
| File Storage | GridFS | Built-in Storage |
| Scaling | Manual | Automatic |
| Cost | Server costs | Pay-as-you-go |

### Collection Schema

**code_projects** collection:
```javascript
{
  name: string,
  description: string,
  ownerId: string,
  ownerEmail: string,
  primaryLanguage: string,
  isPublic: boolean,
  allowCollaboration: boolean,
  secretCode: string (8 chars),
  totalFiles: integer,
  totalLines: integer,
  files: string (JSON),
  githubEnabled: boolean,
  githubRepoUrl: string,
  githubBranch: string,
  githubLastSync: datetime,
  buildLanguage: string,
  buildCommand: string,
  runCommand: string,
  tags: string (JSON array),
  createdAt: datetime,
  updatedAt: datetime,
  mongoId: string (reference)
}
```

**collaborators** collection:
```javascript
{
  projectId: string,
  userId: string,
  email: string,
  role: string (owner/editor/viewer),
  joinedAt: datetime
}
```

## 🔐 Security

### Permissions

Collections are configured with:
- ✅ **Read**: Any user can read public projects
- ✅ **Create**: Only authenticated users
- ✅ **Update**: Only authenticated users (owner check in code)
- ✅ **Delete**: Only authenticated users (owner check in code)

### Best Practices

1. **API Key Security**
   - Never commit API keys to git
   - Use environment variables
   - Rotate keys regularly
   - Use separate keys for dev/prod

2. **Data Validation**
   - Validate on both client and server
   - Check permissions before operations
   - Sanitize user inputs

3. **Rate Limiting**
   - Appwrite has built-in rate limiting
   - Monitor usage in dashboard

## 🎯 Features Comparison

### What Works in Appwrite

✅ **All Core Features:**
- Project CRUD operations
- File tree management
- Collaborator management
- GitHub sync metadata
- Build configurations
- Real-time updates (subscriptions available)

✅ **Additional Benefits:**
- Cloud hosting (no server maintenance)
- Automatic backups
- Global CDN
- Built-in authentication
- Real-time subscriptions
- File storage with CDN

### What Needs Adaptation

⚠️ **GitHub Operations:**
- GitHub API calls still happen on backend
- Only metadata stored in Appwrite
- Full GitHub service remains on Node.js backend

⚠️ **Large Files:**
- Files >1MB should use Storage bucket instead of embedded JSON
- Use `appwriteFileService.uploadFile()` for large files

## 📈 Monitoring & Debugging

### Appwrite Dashboard

Monitor your data at: https://cloud.appwrite.io/

**Key Sections:**
- **Database**: View collections and documents
- **Storage**: View uploaded files
- **Users**: Manage authentication
- **Settings**: Configure project settings
- **Logs**: Debug issues

### Common Issues

**Issue**: "API key invalid"
- **Solution**: Verify API key in .env, ensure it has all scopes

**Issue**: "Collection not found"
- **Solution**: Run `setupAppwrite.js` first

**Issue**: "Permission denied"
- **Solution**: Check collection permissions in Appwrite dashboard

**Issue**: "Document size too large"
- **Solution**: Use Storage for large files instead of embedding in document

## 🔄 Sync Strategy

### Dual Operation (Recommended for transition)

1. **Write to both** MongoDB and Appwrite
2. **Read from** Appwrite (with MongoDB fallback)
3. **Gradually migrate** all users
4. **Remove MongoDB** dependency after full migration

### Code Example:

```javascript
async function saveProject(projectData) {
  // Save to both
  const mongoResult = await CodeProject.create(projectData);
  const appwriteResult = await appwriteCodeProjectService.createProject(projectData);
  
  // Return Appwrite result (preferred)
  return appwriteResult;
}
```

## 📝 Testing Checklist

After migration, test:

- [ ] Create new project
- [ ] Load existing projects
- [ ] Edit files
- [ ] Save changes
- [ ] Add collaborators
- [ ] Delete projects
- [ ] GitHub sync metadata
- [ ] Build configurations
- [ ] Real-time updates

## 🚨 Rollback Plan

If you need to revert to MongoDB:

1. **Stop using Appwrite component**:
   ```javascript
   // Switch back to original
   <CodeEditorPanel apiFetch={apiFetch} ... />
   ```

2. **Keep MongoDB data** (never deleted during migration)

3. **Run rollback script**:
   ```bash
   node scripts/migrateToAppwrite.js rollback
   ```

4. **Remove Appwrite dependencies** (optional):
   ```bash
   npm uninstall appwrite node-appwrite
   ```

## 💰 Cost Estimation

Appwrite Cloud pricing:
- **Free Tier**: 75,000 reads/month, 25,000 writes/month
- **Pro Tier**: $15/month + usage
- **Storage**: $0.04/GB/month
- **Bandwidth**: $0.10/GB

**Typical usage** (small team):
- Projects: ~50 documents = Free
- Files: ~100MB = ~$0.004/month
- Operations: ~10,000/month = Free

**Estimated**: FREE or < $1/month for most users

## 📞 Support

### Documentation
- Appwrite Docs: https://appwrite.io/docs
- API Reference: https://appwrite.io/docs/references

### Help Resources
- Discord: https://appwrite.io/discord
- GitHub: https://github.com/appwrite/appwrite
- Stack Overflow: Tag `appwrite`

### Project-Specific
- Check `CODE_EDITOR_DOCUMENTATION.md` for editor features
- Check console logs for errors
- Monitor Appwrite dashboard for API issues

## ✅ Success Criteria

Migration is successful when:
1. ✅ All collections created in Appwrite
2. ✅ All projects migrated (0 failures)
3. ✅ Collaborators migrated
4. ✅ Frontend can read/write to Appwrite
5. ✅ No errors in console
6. ✅ All features working (CRUD, collab, sync)

## 🎉 Next Steps

After successful migration:

1. **Update documentation** with Appwrite-specific info
2. **Monitor usage** in Appwrite dashboard
3. **Optimize queries** if needed
4. **Enable real-time** subscriptions for live collaboration
5. **Consider** removing MongoDB dependency

---

**Need Help?**
- Check Appwrite dashboard logs
- Review migration script output
- Test with small dataset first
- Keep MongoDB backup until confident

**Ready to migrate?** Start with Step 1! 🚀
