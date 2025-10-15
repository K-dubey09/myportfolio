# API_BASE Environment Variable Migration

## Files Updated

### ✅ Core Configuration
- `frontend/.env` - Created with VITE_API_BASE
- `frontend/src/config/api.js` - Created centralized API config

### ✅ Context
- `frontend/src/context/AuthContext.jsx` - Using import.meta.env.VITE_API_BASE

### ✅ Components
- `frontend/src/components/ContactsList.jsx` - Using API_ROOT_URL from config
- `frontend/src/components/PortfolioSite.jsx` - Using API_ROOT_URL from config
- `frontend/src/components/UserRegistration.jsx` - Using API_ROOT_URL from config
- `frontend/src/components/ChatModal.jsx` - Already using import.meta.env.VITE_API_BASE

### ✅ Pages (Partially Updated)
- `frontend/src/pages/TestimonialsPage.jsx` - Using API_BASE_URL from config
- `frontend/src/pages/BlogsPage.jsx` - Using API_BASE_URL from config
- `frontend/src/pages/ProfilePage.jsx` - Already using import.meta.env.VITE_API_BASE
- `frontend/src/pages/AchievementsPage.jsx` - Already using import.meta.env.VITE_API_BASE

### ⏳ Remaining Files to Update
- `frontend/src/pages/VlogsPage.jsx`
- `frontend/src/pages/ProjectsPage.jsx`
- `frontend/src/pages/GalleryPage.jsx`
- `frontend/src/pages/ExperiencePage.jsx`
- `frontend/src/pages/EducationPage.jsx`
- `frontend/src/pages/SkillsPage.jsx`
- `frontend/src/pages/CertificationsPage.jsx`
- `frontend/src/pages/StatisticsPage.jsx`
- `frontend/src/pages/ServicesPage.jsx`

## How to Update Remaining Files

For each file, follow this pattern:

1. **Add import at top:**
```javascript
import { API_BASE_URL } from '../config/api'
```

2. **Replace hardcoded URLs:**
```javascript
// Before:
fetch('http://localhost:5000/api/blogs', ...)

// After:
fetch(`${API_BASE_URL}/blogs`, ...)
```

## Environment Variable Usage

The `.env` file contains:
```
VITE_API_BASE=http://localhost:5000/api
```

To change the API URL (e.g., for production), update this single line.

### For Production:
```
VITE_API_BASE=https://your-domain.com/api
```

## Central API Configuration

The `frontend/src/config/api.js` exports:
- `API_BASE_URL` - Full API URL with `/api` suffix
- `API_ROOT_URL` - Root URL without `/api` suffix

All components should import from this file for consistency.
