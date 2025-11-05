# Comprehensive Portfolio Update Implementation Plan

## Date: November 5, 2025

## Overview
Major updates to portfolio application including storage integration, featured content, and improved admin controls.

---

## Phase 1: Firebase Storage Integration ✅

### Storage Bucket Structure
```
my-portfolio-7ceb6.appspot.com/
├── images/          # Profile images, gallery photos
├── videos/          # Vlogs, video content
├── songs/           # Audio files if needed
├── documents/       # Blog attachments, PDFs, Word docs
├── thumbnails/      # Auto-generated thumbnails
└── temp/            # Temporary uploads
```

### Files to Update:
1. `backend/config/firebase.js` - Add storage helper methods
2. `backend/controllers/uploadController.js` - Support multiple file types
3. `backend/middleware/fileUpload.js` - New middleware for document uploads

---

## Phase 2: Database Collections Update

### New/Updated Collections:

#### 1. **userActivityLogs** (New)
```javascript
{
  id: string,
  userId: string,
  action: string, // 'login', 'role_change', 'profile_update', etc.
  details: object,
  ipAddress: string,
  userAgent: string,
  timestamp: timestamp,
  performedBy: string // admin who made the change
}
```

#### 2. **viewerToEditorConversions** (Updated from conversionLogs)
```javascript
{
  id: string,
  userId: string,
  userName: string,
  userEmail: string,
  fromRole: 'user',
  toRole: 'editor',
  method: 'access_key' | 'admin_approval',
  accessKeyUsed: string,
  convertedAt: timestamp,
  convertedBy: string, // admin ID if manual
  notes: string
}
```

#### 3. **contactInfo** (Modified - Single Document)
```javascript
{
  id: 'primary', // Fixed ID to ensure only one doc
  email: string,
  phone: string,
  address: string,
  socialLinks: {
    linkedin: string,
    github: string,
    twitter: string,
    // ...
  },
  availability: boolean,
  lastUpdated: timestamp,
  updatedBy: string
}
```

#### 4. **Add `featured` and `featuredOrder` to existing collections**
Update: blogs, projects, vlogs, gallery, testimonials, services, achievements

```javascript
{
  // existing fields...
  featured: boolean,
  featuredOrder: number, // 1, 2, 3 for home page display
  featuredAt: timestamp,
  viewCount: number,
  lastViewed: timestamp
}
```

---

## Phase 3: Featured Content System

### Admin Panel Updates:
- Add "⭐ Feature" button to each item in admin lists
- Show featured badge on featured items
- "Reset Featured" button to clear all featured flags
- Auto-feature most recent/viewed if no featured items

### Logic:
1. Admin marks up to 3 items as featured per section
2. Featured items appear on home page
3. If < 3 featured, auto-fill with most recent
4. Reset button clears all `featured` flags in that collection

---

## Phase 4: Gallery Access Control

### Home Route:
- Show only 3 images (featured or most recent)
- Display "View Full Gallery" button
- Button visible to all users

### Gallery Page (`/gallery`):
- **Current**: Accessible to all authenticated users
- **Update**: Restrict to admin and editor only
- Update `App.jsx`: `allowedRoles={['admin', 'editor']}`

---

## Phase 5: Document Upload in Blogs

### Blog Schema Update:
```javascript
{
  // existing fields...
  attachments: [
    {
      id: string,
      fileName: string,
      fileType: string, // 'pdf', 'docx', 'xlsx', etc.
      fileUrl: string,
      fileSize: number,
      uploadedAt: timestamp
    }
  ]
}
```

### Admin Panel:
- Add file upload section in blog create/edit form
- Support: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx)
- Show list of attached files with download/delete options

---

## Phase 6: Backend API Endpoints

### New/Updated Endpoints:

#### Viewer to Editor:
```
POST   /api/admin/viewer-to-editor/keys          - Generate access key
GET    /api/admin/viewer-to-editor/keys          - List access keys
DELETE /api/admin/viewer-to-editor/keys/:id      - Revoke key
GET    /api/admin/viewer-to-editor/requests      - List upgrade requests
POST   /api/admin/viewer-to-editor/approve/:id   - Approve request
POST   /api/admin/viewer-to-editor/reject/:id    - Reject request
GET    /api/admin/viewer-to-editor/conversions   - List conversions
POST   /api/admin/viewer-to-editor/revert/:id    - Revert to user
```

#### User Management:
```
GET    /api/admin/users                          - List all users
GET    /api/admin/users/:id                      - Get user details
PUT    /api/admin/users/:id/role                 - Update user role
DELETE /api/admin/users/:id                      - Delete user
GET    /api/admin/users/:id/activity-log         - Get user activity log
POST   /api/admin/users/:id/assign-id            - Assign user ID
```

#### Featured Content:
```
POST   /api/admin/:collection/feature/:id        - Feature an item
POST   /api/admin/:collection/unfeature/:id      - Unfeature an item
POST   /api/admin/:collection/reset-featured     - Reset all featured
GET    /api/:collection/featured                 - Get featured items
```

#### Contact Info:
```
GET    /api/contact-info                         - Get contact info (single doc)
PUT    /api/admin/contact-info                   - Update contact info
```

#### File Upload:
```
POST   /api/upload/image                         - Upload to /images
POST   /api/upload/video                         - Upload to /videos
POST   /api/upload/document                      - Upload to /documents
DELETE /api/upload/:path                         - Delete file
```

---

## Phase 7: Frontend Updates

### PortfolioSite.jsx (Home Route):
1. Fetch only featured items for each section
2. If < 3 featured, backend returns most recent
3. Gallery: Show 3 images, hide "View All" from non-admin/editor
4. Remove vlogs section for regular users ✅ (Already done)

### Admin Panel Updates:
1. Add "Feature" button to item cards
2. Show featured badge on featured items
3. Add "Reset Featured" button in section headers
4. Document upload UI in blog form
5. Contact Info: Single form (no create/delete)

### App.jsx Routing:
```javascript
<Route path="/gallery" element={
  <ProtectedRoute allowedRoles={['admin', 'editor']}>
    <GalleryPage />
  </ProtectedRoute>
} />
```

---

## Implementation Priority

### High Priority (Phase 1):
1. ✅ Fix contact info to single document
2. ✅ Add featured fields to collections
3. ✅ Update gallery route access control
4. ✅ Home page featured content logic

### Medium Priority (Phase 2):
5. ✅ Document upload for blogs
6. ✅ Firebase Storage folder structure
7. ✅ Featured content admin UI

### Low Priority (Phase 3):
8. ✅ User activity logging
9. ✅ Viewer-to-editor collection rename
10. ✅ Enhanced analytics

---

## Files to Modify

### Backend:
- `server.js` - Add new routes
- `config/firebase.js` - Add userActivityLogs collection
- `controllers/contactInfoController.js` - Single document logic
- `controllers/uploadController.js` - Document upload support
- `controllers/allControllers.js` - Add featured methods
- `middleware/fileUpload.js` - New file for document validation
- `utils/storage.js` - New file for storage helpers

### Frontend:
- `App.jsx` - Update gallery route
- `components/PortfolioSite.jsx` - Featured content logic
- `pages/GalleryPage.jsx` - Access control message
- `Admin/AdminPanel.jsx` - Featured UI, document upload
- `components/BlogForm.jsx` - New file for blog with attachments

---

## Testing Checklist

- [ ] Featured content displays correctly on home
- [ ] Reset featured button works
- [ ] Gallery restricted to admin/editor
- [ ] Document upload works for blogs
- [ ] Contact info single document enforced
- [ ] User activity logged correctly
- [ ] Viewer-to-editor flows work
- [ ] Firebase Storage folders organized correctly

---

## Next Steps

Starting implementation in order of priority...

