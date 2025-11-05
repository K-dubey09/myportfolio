# Firebase Backend - Quick Start Guide

## 1. Initialize Firebase (First Time Only)

Run the initialization script to create example users:

```bash
cd backend
node scripts/initFirebase.js
```

This creates:
- **Admin**: admin@portfolio.com / admin123!
- **Editor**: editor@portfolio.com / editor123!
- **Viewer**: viewer@portfolio.com / viewer123!

## 2. Start the Backend Server

```bash
cd backend
npm start
```

Server will start on: http://localhost:5000

## 3. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend will start on: http://localhost:5173

## 4. Test Authentication

1. Go to http://localhost:5173
2. Click Login
3. Use: admin@portfolio.com / admin123!
4. You should see "Admin" role with full permissions

## API Endpoints

### Authentication
- POST `/api/auth/register` - Create new user
- POST `/api/auth/login` - Login with email/password
- POST `/api/auth/logout` - Logout (requires auth)
- GET `/api/auth/profile` - Get user profile (requires auth)
- PUT `/api/auth/profile` - Update profile (requires auth)
- PUT `/api/auth/change-password` - Change password (requires auth)

### Portfolio Data
- GET `/api/portfolio` - Get all portfolio data

## Troubleshooting

### "Firebase not initialized" error
Solution: Run `node scripts/initFirebase.js` first

### "Service account not found" error
Solution: Make sure `backend/firebase-service-account.json` exists

### "Module not found" error
Solution: Run `npm install` in backend and frontend folders

### "Port already in use" error
Solution: Kill the process or change PORT in backend/.env

## Firebase Console

View your data: https://console.firebase.google.com/project/my-portfolio-7ceb6

- **Authentication**  Users  See registered users
- **Firestore Database**  Data  See collections
- **Storage**  Files  See uploaded files

## Development Tips

### Get Firebase ID Token (for API testing)
```javascript
import { auth } from './config/firebase';
const token = await auth.currentUser.getIdToken();
console.log(token);
```

### Test API with curl
```bash
# Get profile
curl -H "Authorization: Bearer YOUR_ID_TOKEN" http://localhost:5000/api/auth/profile
```

### Check Firebase Connection
```bash
cd backend
node -e "import('./config/firebase.js').then(m => m.default.initialize().then(() => console.log('Connected!')))"
```

## Next: Convert Controllers

Most CRUD operations still need conversion from MongoDB to Firestore.
See FIREBASE_SETUP_COMPLETE.md for details.

---
For complete migration details, see: FIREBASE_SETUP_COMPLETE.md
