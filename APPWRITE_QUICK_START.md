# 🚀 Appwrite Code Projects - Quick Start

## ⚡ 3-Step Migration

### 1️⃣ Get API Key (2 minutes)
```
1. Open: https://cloud.appwrite.io/
2. Click: Settings → API Keys
3. Click: "Create API Key"
4. Name: "Code Projects Migration"
5. Select: ALL SCOPES ✅
6. Copy: The generated key
7. Add to: backend/.env
```

```env
APPWRITE_API_KEY=paste_your_key_here
```

### 2️⃣ Run Setup (30 seconds)
```bash
cd backend
node scripts/setupAppwrite.js
```

✅ Creates collections: `code_projects`, `collaborators`  
✅ Creates storage: `project-files-bucket`

### 3️⃣ Migrate Data (1-2 minutes)
```bash
node scripts/migrateToAppwrite.js
```

✅ Migrates all projects from MongoDB to Appwrite cloud

---

## 📝 Update Your Code

### Option A: Switch to Appwrite (Recommended)
```javascript
// In ProfilePage.jsx
import CodeEditorPanelAppwrite from '../components/CodeEditorPanelAppwrite.jsx';

<CodeEditorPanelAppwrite />
```

### Option B: Keep Both (Testing)
```javascript
const [useCloud, setUseCloud] = useState(true);

{useCloud ? (
  <CodeEditorPanelAppwrite />
) : (
  <CodeEditorPanel apiFetch={apiFetch} />
)}

<button onClick={() => setUseCloud(!useCloud)}>
  Toggle Cloud
</button>
```

---

## 🧪 Test It Works

1. **Create Project**: Click "New Project" → Enter details → Save
2. **Edit Files**: Create files, write code, save changes
3. **Check Cloud**: Visit https://cloud.appwrite.io/ → Database → code_projects
4. **Verify Data**: See your projects in Appwrite dashboard

---

## 🔄 Rollback (If Needed)

```bash
node scripts/migrateToAppwrite.js rollback
```

This deletes Appwrite data (MongoDB unchanged)

---

## 📊 What You Get

✅ **Cloud Storage** - Projects accessible anywhere  
✅ **Global CDN** - Fast access worldwide  
✅ **Automatic Backups** - Built-in data protection  
✅ **Real-time Sync** - Live collaboration ready  
✅ **No Server Costs** - Free tier (75k reads/month)  
✅ **Zero Maintenance** - Fully managed service

---

## 🔗 Quick Links

- **Appwrite Dashboard**: https://cloud.appwrite.io/
- **Project Console**: https://cloud.appwrite.io/console/project-68ef61ed0005c49591cf
- **Full Guide**: [APPWRITE_MIGRATION_GUIDE.md](./APPWRITE_MIGRATION_GUIDE.md)
- **Summary**: [APPWRITE_INTEGRATION_SUMMARY.md](./APPWRITE_INTEGRATION_SUMMARY.md)

---

## 🆘 Common Issues

**"API key invalid"**  
→ Check `.env` has correct key with ALL scopes

**"Collection not found"**  
→ Run `node scripts/setupAppwrite.js` first

**"Permission denied"**  
→ Login with: kushagradubey5002@gmail.com

**"Document too large"**  
→ Use Storage bucket for files >1MB

---

## 💡 Pro Tips

1. **Monitor Usage**: Check Appwrite dashboard regularly
2. **Free Tier**: 75k reads + 25k writes/month = plenty for small teams
3. **Real-time**: Enable subscriptions for live collaboration
4. **Security**: API key = backend only, never in frontend code
5. **Backup**: MongoDB data untouched, safe to experiment

---

## 📞 Need Help?

- **Docs**: [APPWRITE_MIGRATION_GUIDE.md](./APPWRITE_MIGRATION_GUIDE.md) (detailed walkthrough)
- **Appwrite**: https://appwrite.io/docs
- **Discord**: https://appwrite.io/discord

---

**Ready?** Start with Step 1! ⬆️

Total Time: ~5 minutes to cloud! ☁️
