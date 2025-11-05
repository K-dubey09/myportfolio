# Home Route Data Mapping - Request/Response Reference

## Complete Frontend-Backend Data Flow

### Request #1: Profile Data
```
Frontend Request:
GET http://localhost:5000/api/profile

Backend Handler:
- Route: server.js line 187
- Controller: ProfileController.getAll
- Query: profiles collection (Firestore)
- Auth: None required (public)

Example Response:
{
  "id": "profile-1",
  "name": "John Doe",
  "title": "Full Stack Developer",
  "bio": "Passionate about web development",
  "image": "https://storage.googleapis.com/.../profile.jpg",
  "social": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "twitter": "https://twitter.com/johndoe"
  },
  "location": "New York, USA",
  "experience": "5+ years"
}

Frontend Processing (lines 60-61):
setProfile(profileData)
- Stored in: profile state
- Rendered in: Hero section (Hero component)
```

---

### Request #2: Services Data
```
Frontend Request:
GET http://localhost:5000/api/services

Backend Handler:
- Route: server.js line 330
- Controller: ServicesController.getAll
- Query: services collection (Firestore)
- Auth: None required (public)

Example Response (Array Format):
[
  {
    "id": "service-1",
    "title": "Web Development",
    "description": "Custom web applications",
    "icon": "💻",
    "category": "Development",
    "price": "Contact for quote"
  },
  {
    "id": "service-2",
    "title": "UI/UX Design",
    "description": "Beautiful user interfaces",
    "icon": "🎨",
    "category": "Design"
  }
]

Frontend Processing (lines 62):
setServices(Array.isArray(servicesData) ? servicesData.slice(0, 3) : (servicesData.services?.slice(0, 3) || []))
- Limits to: 3 items
- Stored in: services state
- Rendered in: Services section (ServiceCard component)
```

---

### Request #3: Projects Data
```
Frontend Request:
GET http://localhost:5000/api/projects

Backend Handler:
- Route: server.js line 218
- Controller: ProjectsController.getAll
- Query: projects collection (Firestore)
- Auth: None required (public)

Example Response (Array Format):
[
  {
    "id": "proj-1",
    "title": "E-Commerce Platform",
    "description": "Full-featured online store",
    "image": "https://storage.googleapis.com/.../project1.jpg",
    "link": "https://ecommerce-demo.com",
    "technologies": ["React", "Node.js", "Firebase"],
    "status": "Completed",
    "startDate": "2023-01-01",
    "endDate": "2023-06-30"
  }
]

Frontend Processing (lines 63):
setProjects(Array.isArray(projectsData) ? projectsData.slice(0, 3) : (projectsData.projects?.slice(0, 3) || []))
- Limits to: 3 items
- Stored in: projects state
- Rendered in: Projects section (ProjectCard component)
```

---

### Request #4: Experiences Data
```
Frontend Request:
GET http://localhost:5000/api/experiences

Backend Handler:
- Route: server.js line 230
- Controller: ExperiencesController.getAll
- Query: experiences collection (Firestore)
- Auth: None required (public)

Example Response (Array Format):
[
  {
    "id": "exp-1",
    "title": "Senior Developer",
    "company": "Tech Corp",
    "location": "New York, USA",
    "startDate": "2022-01-01",
    "endDate": null,
    "current": true,
    "description": "Lead development team",
    "technologies": ["React", "Node.js"],
    "highlights": ["Launched 5 products", "Led 10+ engineers"]
  }
]

Frontend Processing (lines 64):
setExperience(Array.isArray(experienceData) ? experienceData.slice(0, 2) : (experienceData.experience?.slice(0, 2) || []))
- Limits to: 2 items
- Stored in: experience state
- Rendered in: Experience section (ExperienceCard component)
```

---

### Request #5: Education Data
```
Frontend Request:
GET http://localhost:5000/api/education

Backend Handler:
- Route: server.js line 242
- Controller: EducationController.getAll
- Query: education collection (Firestore)
- Auth: None required (public)

Example Response (Array Format):
[
  {
    "id": "edu-1",
    "school": "State University",
    "degree": "Bachelor of Science",
    "field": "Computer Science",
    "graduationYear": 2020,
    "gpa": 3.8,
    "honors": "Cum Laude",
    "description": "Focus on full-stack development"
  }
]

Frontend Processing (lines 65):
setEducation(Array.isArray(educationData) ? educationData.slice(0, 2) : (educationData.education?.slice(0, 2) || []))
- Limits to: 2 items
- Stored in: education state
- Rendered in: Education section (EducationCard component)
```

---

### Request #6: Blogs Data
```
Frontend Request:
GET http://localhost:5000/api/blogs

Backend Handler:
- Route: server.js line 255
- Controller: BlogsController.getAll
- Query: blogs collection (Firestore)
- Auth: None required (public)

Example Response (Array Format):
[
  {
    "id": "blog-1",
    "title": "Getting Started with React",
    "description": "A beginner's guide to React",
    "content": "...",
    "image": "https://storage.googleapis.com/.../blog1.jpg",
    "author": "John Doe",
    "publishedDate": "2024-01-15",
    "category": "Tutorial",
    "tags": ["React", "JavaScript"],
    "fileUrls": ["https://storage.googleapis.com/.../file1.pdf"]
  }
]

Frontend Processing (lines 66):
setBlogs(Array.isArray(blogsData) ? blogsData.slice(0, 3) : (blogsData.blogs?.slice(0, 3) || []))
- Limits to: 3 items
- Stored in: blogs state
- Rendered in: Blogs section (BlogCard component)
```

---

### Request #7: Vlogs Data
```
Frontend Request:
GET http://localhost:5000/api/vlogs

Backend Handler:
- Route: server.js line 270
- Controller: VlogsController.getAll
- Query: vlogs collection (Firestore)
- Auth: None required (public)

Example Response (Array Format):
[
  {
    "id": "vlog-1",
    "title": "Web Development Tutorial",
    "description": "Learn web development in 30 minutes",
    "thumbnailUrl": "https://storage.googleapis.com/.../thumbnail.jpg",
    "platform": "YouTube",
    "publishedDate": "2024-01-20",
    "watchLink": "https://youtube.com/watch?v=...",
    "duration": "30:45",
    "fileUrls": ["https://storage.googleapis.com/.../video.mp4"]
  }
]

Frontend Processing (lines 67):
setVlogs(Array.isArray(vlogsData) ? vlogsData.slice(0, 3) : (vlogsData.vlogs?.slice(0, 3) || []))
- Limits to: 3 items
- Stored in: vlogs state
- Rendered in: Vlogs section (VlogCard component)
```

---

### Request #8: Gallery Data
```
Frontend Request:
GET http://localhost:5000/api/gallery

Backend Handler:
- Route: server.js line 283
- Controller: GalleryController.getAll
- Query: gallery collection (Firestore)
- Auth: None required (public)

Example Response (Array Format):
[
  {
    "id": "gal-1",
    "title": "Conference 2024",
    "category": "Events",
    "location": "New York",
    "imageUrl": "https://storage.googleapis.com/.../photo1.jpg",
    "imageUrls": [
      "https://storage.googleapis.com/.../photo1.jpg",
      "https://storage.googleapis.com/.../photo2.jpg"
    ],
    "description": "Photos from tech conference",
    "date": "2024-01-20"
  }
]

Frontend Processing (lines 68):
setGallery(Array.isArray(galleryData) ? galleryData.slice(0, 6) : (galleryData.gallery?.slice(0, 6) || []))
- Limits to: 6 items
- Stored in: gallery state
- Rendered in: Gallery section (GalleryCard component)
```

---

### Request #9: Contact Info Data
```
Frontend Request:
GET http://localhost:5000/api/contact-info

Backend Handler:
- Route: server.js line 345
- Controller: ContactInfoController.getAll
- Query: contactInfo collection (Firestore)
- Auth: None required (public)

Example Response (Single Object):
{
  "id": "contact-1",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "address": "123 Main St, New York, NY 10001",
  "linkedin": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe",
  "twitter": "https://twitter.com/johndoe",
  "instagram": "https://instagram.com/johndoe",
  "website": "https://johndoe.com",
  "timezone": "EST",
  "language": "English"
}

Frontend Processing (lines 69-77):
if (Array.isArray(contactInfoData) && contactInfoData.length > 0) {
  setContactInfo(contactInfoData[0])
} else if (contactInfoData && !Array.isArray(contactInfoData)) {
  setContactInfo(contactInfoData)
} else {
  setContactInfo(null)
}
- Stored in: contactInfo state
- Rendered in: Contact section (ContactInfo component)
```

---

### Request #10: Achievements Data (Sequential)
```
Frontend Request:
GET http://localhost:5000/api/achievements

Backend Handler:
- Route: server.js line 319
- Controller: AchievementsController.getAll
- Query: achievements collection (Firestore)
- Auth: None required (public)

Example Response (Array Format):
[
  {
    "id": "ach-1",
    "title": "Best Developer Award",
    "description": "Awarded for outstanding contributions",
    "date": "2024-01-15",
    "image": "https://storage.googleapis.com/.../badge.png",
    "category": "Recognition",
    "issuer": "Tech Association",
    "url": "https://example.com/achievement/1"
  }
]

Frontend Processing (lines 90-95):
const aRes = await fetch(`${API_BASE_URL}/api/achievements`)
if (aRes.ok) {
  const aJson = await aRes.json()
  const items = Array.isArray(aJson) ? aJson : (aJson.achievements || aJson.data || [])
  setAchievementsPreview(items.slice(0, 3))
}
- Limits to: 3 items
- Stored in: achievementsPreview state
- Rendered in: Achievements section (AchievementCard component)
```

---

### Request #11: Testimonials Data (Sequential)
```
Frontend Request:
GET http://localhost:5000/api/testimonials

Backend Handler:
- Route: server.js line 308
- Controller: TestimonialsController.getAll
- Query: testimonials collection (Firestore)
- Auth: None required (public)

Example Response (Array Format):
[
  {
    "id": "test-1",
    "name": "Jane Smith",
    "role": "CTO",
    "company": "Innovation Labs",
    "image": "https://storage.googleapis.com/.../profile.jpg",
    "message": "Outstanding developer and great team player",
    "rating": 5,
    "date": "2024-01-10"
  }
]

Frontend Processing (lines 102-107):
const tRes = await fetch(`${API_BASE_URL}/api/testimonials`)
if (tRes.ok) {
  const tJson = await tRes.json()
  setTestimonialsPreview(Array.isArray(tJson) ? tJson.slice(0, 3) : (tJson.testimonials?.slice(0, 3) || []))
}
- Limits to: 3 items
- Stored in: testimonialsPreview state
- Rendered in: Testimonials section (TestimonialCard component)
```

---

### Contact Form Submission
```
Frontend Request:
POST http://localhost:5000/api/contacts
Content-Type: application/json

Request Body:
{
  "name": "Visitor Name",
  "email": "visitor@example.com",
  "subject": "Project Inquiry",
  "message": "I'm interested in working with you..."
}

Backend Handler:
- Route: server.js line 302
- Controller: ContactsController.create
- Target Collection: contacts (Firestore)
- Auth: None required (public submission)

Response:
{
  "id": "contact-submission-123",
  "name": "Visitor Name",
  "email": "visitor@example.com",
  "subject": "Project Inquiry",
  "message": "I'm interested in working with you...",
  "createdAt": "2024-01-25T10:30:00Z",
  "read": false
}

Frontend Processing (lines 124-145):
const response = await fetch(`${API_BASE_URL}/api/contacts`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(contactForm)
})
- Shows success/error toast message
- Resets form on success
```

---

## Response Format Handling

### Format 1: Direct Array
```json
[
  { "id": "1", "title": "Item 1" },
  { "id": "2", "title": "Item 2" }
]
```
Frontend Handler:
```javascript
setData(Array.isArray(data) ? data.slice(0, limit) : (data.items?.slice(0, limit) || []))
// Uses direct array
```

### Format 2: Nested Object
```json
{
  "blogs": [
    { "id": "1", "title": "Blog 1" },
    { "id": "2", "title": "Blog 2" }
  ]
}
```
Frontend Handler:
```javascript
setData(Array.isArray(data) ? data.slice(0, limit) : (data.blogs?.slice(0, limit) || []))
// Extracts data.blogs array
```

### Format 3: Paginated Response
```json
{
  "data": [
    { "id": "1", "title": "Item 1" }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 5
}
```
Frontend Handler would need to extract `data` field if this format is used.

---

## Error Handling

### Network Error
```javascript
catch (error) {
  console.error('Error fetching data:', error)
  // User sees "Loading..." state until timeout
}
```

### Individual Endpoint Failure (Achievements/Testimonials)
```javascript
try {
  const aRes = await fetch(...)
  if (aRes.ok) {
    // Process data
  }
} catch (err) {
  console.warn('Could not fetch achievements preview', err)
  // Gracefully continues without that section
}
```

### Contact Form Submission Error
```javascript
if (!response.ok) {
  const error = await response.json()
  setContactStatus({
    type: 'error',
    message: error.message || 'Failed to send message'
  })
}
```

---

## Performance Optimization

### Current Implementation
- **Phase 1:** 9 parallel fetches (request concurrency = 9)
- **Phase 2:** 2 sequential fetches
- **Total Time:** ~9 network round-trips (Phase 1) + 2 additional

### Alternative: Single Aggregate Request
```javascript
// Instead of 11 requests, use 1:
const response = await fetch(`${API_BASE_URL}/api/portfolio`)
const data = await response.json()
// Extract all from data.data object
```

This endpoint is already implemented at `GET /api/portfolio` (server.js line 348-390).

### Improvement Path
1. Switch to aggregate endpoint to reduce network requests
2. Add caching (e.g., with React Query or SWR)
3. Implement infinite scroll for sections with many items
4. Add service worker for offline support

---

## Field Validation

When data is received, ensure these fields are present:

### Profile
✓ `name`, `title` required

### Services
✓ `title`, `description` required per item

### Projects
✓ `title` required, `image`, `link` recommended

### Experiences
✓ `title`, `company` required per item

### Education
✓ `school`, `degree` required per item

### Blogs
✓ `title` required, `publishedDate`, `image` recommended

### Vlogs
✓ `title`, `platform` required, `watchLink` recommended

### Gallery
✓ `imageUrl` or `imageUrls` required, `title` recommended

### Testimonials
✓ `name`, `message` required, `rating` recommended

### Achievements
✓ `title` required, `date`, `image` recommended

### Contact Info
✓ `email` recommended for contact section

---

## Testing Checklist

- [ ] All 11 API endpoints return 200 status
- [ ] Frontend displays data from each section
- [ ] Limiting works (3 projects shown, not 10)
- [ ] Contact form successfully submits
- [ ] No console errors after page load
- [ ] Load time acceptable (< 3 seconds)
- [ ] Responsive on mobile (data still displays)
- [ ] Images load from Firebase Storage
- [ ] Links to individual items work (if implemented)

