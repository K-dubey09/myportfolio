# Home Route (/) - Data Flow & Backend Integration

## Overview
The home route (`/`) renders the **`PortfolioSite.jsx`** component, which is the public-facing portfolio website. This document outlines where the home route is defined, what data it fetches, and how it maps to backend routes.

---

## Frontend Home Route Location

**File:** `frontend/src/App.jsx`
**Route Definition:** Line ~156
```jsx
<Route path="/" element={<PortfolioSite />} />
```

**Component:** `frontend/src/components/PortfolioSite.jsx`

---

## Data Fetching Architecture

### Current Implementation
`PortfolioSite.jsx` fetches data in two phases:

#### Phase 1: Parallel Fetch (9 endpoints)
Located in `useEffect` hook (lines 43-80), fetches the following simultaneously:

| # | Section | Frontend State | Backend Route | Backend Controller | Firestore Collection |
|---|---------|----------------|----------------|--------------------|-----------------------|
| 1 | Profile | `profile` | `/api/profile` | `ProfileController.getAll()` | `profiles` |
| 2 | Services | `services` | `/api/services` | `ServicesController.getAll()` | `services` |
| 3 | Projects | `projects` | `/api/projects` | `ProjectsController.getAll()` | `projects` |
| 4 | Experiences | `experience` | `/api/experiences` | `ExperiencesController.getAll()` | `experiences` |
| 5 | Education | `education` | `/api/education` | `EducationController.getAll()` | `education` |
| 6 | Blogs | `blogs` | `/api/blogs` | `BlogsController.getAll()` | `blogs` |
| 7 | Vlogs | `vlogs` | `/api/vlogs` | `VlogsController.getAll()` | `vlogs` |
| 8 | Gallery | `gallery` | `/api/gallery` | `GalleryController.getAll()` | `gallery` |
| 9 | Contact Info | `contactInfo` | `/api/contact-info` | `ContactInfoController.getAll()` | `contactInfo` |

#### Phase 2: Sequential Fetch (2 endpoints)
After Phase 1 completes, fetch additional data:

| # | Section | Frontend State | Backend Route | Backend Controller | Firestore Collection |
|---|---------|----------------|----------------|--------------------|-----------------------|
| 10 | Achievements | `achievementsPreview` | `/api/achievements` | `AchievementsController.getAll()` | `achievements` |
| 11 | Testimonials | `testimonialsPreview` | `/api/testimonials` | `TestimonialsController.getAll()` | `testimonials` |

### Data Limiting
To keep initial page load fast, data is limited to preview amounts:
- **Profile:** 1 (single object)
- **Services:** 3 items
- **Projects:** 3 items
- **Experiences:** 2 items
- **Education:** 2 items
- **Blogs:** 3 items
- **Vlogs:** 3 items
- **Gallery:** 6 items
- **Testimonials:** 3 items
- **Achievements:** 3 items
- **Contact Info:** 1 (single object)

### Response Parsing
Each endpoint returns either:
- **Direct Array:** `[item1, item2, item3]`
- **Nested Object:** `{ sectionName: [item1, item2, item3] }`

The frontend handles both formats:
```jsx
// Example for services
setServices(Array.isArray(servicesData) ? servicesData.slice(0, 3) : (servicesData.services?.slice(0, 3) || []))
```

---

## Backend Routes Reference

### Location
**File:** `backend/server.js` (Lines 186-386)

### Public Endpoints (No Auth Required)

#### Profile
```
GET /api/profile          → Returns single profile document
```

#### Skills
```
GET /api/skills           → Returns all skills
GET /api/skills/:id       → Returns single skill
GET /api/skills/search    → Search skills
```

#### Projects
```
GET /api/projects         → Returns all projects
GET /api/projects/:id     → Returns single project
GET /api/projects/search  → Search projects
```

#### Experiences
```
GET /api/experiences      → Returns all experiences
GET /api/experiences/:id  → Returns single experience
```

#### Education
```
GET /api/education        → Returns all education entries
GET /api/education/:id    → Returns single education entry
```

#### Blogs
```
GET /api/blogs            → Returns all blogs
GET /api/blogs/:id        → Returns single blog
GET /api/blogs/search     → Search blogs
```

#### Vlogs
```
GET /api/vlogs            → Returns all vlogs
GET /api/vlogs/:id        → Returns single vlog
GET /api/vlogs/search     → Search vlogs
```

#### Gallery
```
GET /api/gallery          → Returns all gallery items
GET /api/gallery/:id      → Returns single gallery item
GET /api/gallery/search   → Search gallery
```

#### Testimonials
```
GET /api/testimonials     → Returns all testimonials
GET /api/testimonials/:id → Returns single testimonial
```

#### Achievements
```
GET /api/achievements     → Returns all achievements
GET /api/achievements/:id → Returns single achievement
GET /api/achievements/search → Search achievements
```

#### Services
```
GET /api/services         → Returns all services
GET /api/services/:id     → Returns single service
GET /api/services/search  → Search services
```

#### Contacts
```
POST /api/contacts        → Submit contact form (public)
GET /api/contacts         → View contacts (no auth required)
```

#### Contact Info
```
GET /api/contact-info     → Returns single contact info document
```

### Aggregate Endpoint
```
GET /api/portfolio        → Returns all portfolio data in single response
```

Response format:
```json
{
  "success": true,
  "data": {
    "profile": {...},
    "skills": [...],
    "projects": [...],
    "experiences": [...],
    "education": [...],
    "blogs": [...],
    "vlogs": [...],
    "gallery": [...],
    "testimonials": [...],
    "services": [...],
    "contactInfo": {...},
    "achievements": [...]
  }
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────┐
│  Home Route (/)                 │
│  PortfolioSite.jsx              │
└──────────────┬──────────────────┘
               │
        ┌──────▼──────────────────────────────────┐
        │  Phase 1: Parallel Fetch (9 endpoints)  │
        └──────┬───────────────────────────────────┘
               │
    ┌──────────┼──────────────────────────┐
    │          │                          │
    ▼          ▼                          ▼
/api/profile  /api/services   ... /api/contact-info
    │          │                          │
    ▼          ▼                          ▼
ProfileCtrl  ServicesCtrl   ... ContactInfoCtrl
    │          │                          │
    ▼          ▼                          ▼
profiles      services      ... contactInfo
(Firestore)   (Firestore)      (Firestore)
    │          │                          │
    └──────────┼──────────────────────────┘
               │
        ┌──────▼──────────────────────────────────┐
        │  Phase 2: Sequential Fetch (2 endpoints)│
        └──────┬───────────────────────────────────┘
               │
    ┌──────────┴──────────────┐
    │                         │
    ▼                         ▼
/api/achievements     /api/testimonials
    │                         │
    ▼                         ▼
AchievementsCtrl      TestimonialsCtrl
    │                         │
    ▼                         ▼
achievements          testimonials
(Firestore)           (Firestore)
```

---

## Frontend Component Sections

### PortfolioSite.jsx Renders (lines 200-747)

1. **Hero Section** - Uses `profile` state
2. **Services Section** - Uses `services` state
3. **Projects Section** - Uses `projects` state
4. **Experience Section** - Uses `experience` state
5. **Education Section** - Uses `education` state
6. **Skills Section** - Uses state fetched from full page
7. **Blogs Section** - Uses `blogs` state
8. **Vlogs Section** - Uses `vlogs` state
9. **Gallery Section** - Uses `gallery` state
10. **Testimonials Section** - Uses `testimonialsPreview` state
11. **Achievements Section** - Uses `achievementsPreview` state
12. **Contact Section** - Uses `contactInfo` state + contact form

---

## Field Mappings by Section

### Profile Section
**Expected Fields:**
- `name`, `title`, `bio`, `image`, `social`, etc.

### Services Section
**Expected Fields per Item:**
- `title`, `description`, `icon`, `category`, etc.

### Projects Section
**Expected Fields per Item:**
- `title`, `description`, `image`, `link`, `technologies`, `status`, etc.

### Experiences Section
**Expected Fields per Item:**
- `title`, `company`, `startDate`, `endDate`, `description`, `technologies`, etc.

### Education Section
**Expected Fields per Item:**
- `school`, `degree`, `field`, `graduationYear`, `description`, etc.

### Blogs Section
**Expected Fields per Item:**
- `title`, `description`, `content`, `image`, `publishedDate`, `fileUrls` or `fileUrl`, etc.

### Vlogs Section
**Expected Fields per Item:**
- `title`, `description`, `thumbnailUrl`, `platform`, `publishedDate`, `watchLink`, `fileUrls`, etc.

### Gallery Section
**Expected Fields per Item:**
- `title`, `category`, `location`, `imageUrl` or `imageUrls`, `description`, etc.

### Testimonials Section
**Expected Fields per Item:**
- `name`, `role`, `company`, `message`, `rating`, `image`, etc.

### Achievements Section
**Expected Fields per Item:**
- `title`, `description`, `date`, `image`, `category`, `badge`, etc.

### Contact Info
**Expected Fields:**
- `email`, `phone`, `address`, `linkedIn`, `github`, `twitter`, `instagram`, etc.

---

## Backend Controllers

All controllers are created using a factory pattern in `backend/controllers/allControllers.js`:

```javascript
export const BlogsController = createFirestoreController(blogsCRUD, validateBlog, [...]);
export const VlogsController = createFirestoreController(vlogsCRUD, validateVlog, [...]);
export const GalleryController = createFirestoreController(galleryCRUD, validateGallery, [...]);
// ... etc
```

Each controller supports:
- `getAll(req, res)` - Returns all items with optional filters/sorting
- `getById(req, res)` - Returns single item by ID
- `search(req, res)` - Search items (if available)
- `create(req, res)` - Create new item (admin only)
- `update(req, res)` - Update item (admin only)
- `delete(req, res)` - Delete item (admin only)
- `batchCreate(req, res)` - Create multiple items (admin only)

---

## Firestore Collections

All data is stored in Firestore under these collections:

```
Firestore Database
├── profiles
├── skills
├── projects
├── experiences
├── education
├── blogs
├── vlogs
├── gallery
├── testimonials
├── services
├── contactInfo
├── achievements
├── contacts (submissions)
└── users (auth)
```

---

## How to Verify Data Flow

### Step 1: Check Firestore Collections
Visit [Firebase Console](https://console.firebase.google.com) > Firestore Database > Collections
Ensure each collection has documents with the expected fields.

### Step 2: Test Backend Routes Directly
```bash
# Test individual routes
curl http://localhost:5000/api/blogs
curl http://localhost:5000/api/vlogs
curl http://localhost:5000/api/gallery
curl http://localhost:5000/api/portfolio  # Aggregate route
```

### Step 3: Check Frontend Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload home page (`/`)
4. Verify all fetch calls complete successfully (200 status)
5. Check Response tab to see returned data structure

### Step 4: Check Frontend Console
Open browser console to see logged data:
```javascript
console.log('Services data:', servicesData)
console.log('Projects data:', projectsData)
console.log('Blogs data:', blogsData)
console.log('Vlogs data:', vlogsData)
console.log('Gallery data:', galleryData)
// ... etc
```

---

## Troubleshooting

### Issue: Sections not rendering
**Solution:** Check browser console for fetch errors. Verify backend routes are correct in server.js.

### Issue: Wrong data appearing in sections
**Solution:** Verify Firestore collections have correct field names. Check response format (array vs nested object).

### Issue: Loading takes too long
**Solution:** Check Firestore query performance. Consider using indexes for large collections.

### Issue: 404 errors on specific routes
**Solution:** Verify route is defined in server.js with correct controller method.

---

## Alternative: Single Portfolio Endpoint

If you want to fetch all data in a single request instead of 11 parallel/sequential requests:

```javascript
// Instead of individual fetches:
fetch(`${API_BASE_URL}/api/profile`)
fetch(`${API_BASE_URL}/api/services`)
// ... 9 more fetches

// Use single aggregate endpoint:
fetch(`${API_BASE_URL}/api/portfolio`)
  .then(res => res.json())
  .then(data => {
    setProfile(data.data.profile)
    setServices(data.data.services.slice(0, 3))
    setProjects(data.data.projects.slice(0, 3))
    // ... etc
  })
```

This is already implemented in backend at `GET /api/portfolio` (server.js lines 348-390).

---

## Summary

✅ **Home Route Location:** `frontend/src/App.jsx` line ~156
✅ **Home Component:** `frontend/src/components/PortfolioSite.jsx`
✅ **Data Fetching:** 11 parallel/sequential API calls to backend
✅ **Backend Routes:** All defined in `backend/server.js` (lines 186-386)
✅ **Controllers:** All implemented in `backend/controllers/allControllers.js`
✅ **Database:** Firestore with 12 main collections
✅ **Status:** Currently properly configured and fetching from correct routes

