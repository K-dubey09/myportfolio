# 🚀 Firebase CRUD Quick Reference

## Quick Start (3 Steps)

### 1. Initialize Sample Data
```bash
cd backend
node initializeSampleData.js
```

### 2. Start Server
```bash
npm start
```

### 3. Test API
```bash
node testAPI.js
```

## API Endpoints Cheat Sheet

### Public Endpoints (No Auth)
```
GET  /api/profile           - Get profile
GET  /api/skills            - List skills
GET  /api/projects          - List projects
GET  /api/experiences       - List experiences
GET  /api/education         - List education
GET  /api/blogs             - List blogs
GET  /api/vlogs             - List vlogs
GET  /api/gallery           - List gallery
GET  /api/testimonials      - List testimonials
GET  /api/services          - List services
GET  /api/achievements      - List achievements
GET  /api/contact-info      - Get contact info
POST /api/contacts          - Submit contact form
GET  /api/portfolio         - Get all data (aggregated)
```

### Admin Endpoints (Auth Required)
```
# Pattern for all collections
GET    /api/admin/{collection}           - List all
GET    /api/admin/{collection}/:id       - Get by ID
POST   /api/admin/{collection}           - Create
PUT    /api/admin/{collection}/:id       - Update
DELETE /api/admin/{collection}/:id       - Delete
POST   /api/admin/{collection}/batch     - Batch create

# Collections: skills, projects, experiences, education, blogs, vlogs, 
#              gallery, testimonials, services, achievements
```

### Special Routes
```
POST /api/admin/contacts/:id/mark-read   - Mark contact as read
```

## Query Parameters

```bash
# Filter by featured
GET /api/skills?featured=true

# Filter by category
GET /api/skills?category=Frontend

# Filter by status
GET /api/projects?status=completed

# Sort results
GET /api/skills?sortBy=percentage&sortDir=desc

# Limit results
GET /api/skills?limit=10

# Combine filters
GET /api/skills?category=Frontend&sortBy=percentage&sortDir=desc&limit=5

# Search
GET /api/skills/search?field=name&query=javascript
```

## cURL Examples

### Create Skill
```bash
curl -X POST http://localhost:5000/api/admin/skills \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JavaScript",
    "category": "Frontend",
    "level": "advanced",
    "percentage": 85,
    "featured": true
  }'
```

### Get All Skills
```bash
curl http://localhost:5000/api/skills
```

### Get Filtered Skills
```bash
curl "http://localhost:5000/api/skills?category=Frontend&sortBy=percentage&sortDir=desc"
```

### Update Skill
```bash
curl -X PUT http://localhost:5000/api/admin/skills/SKILL_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JavaScript",
    "category": "Frontend",
    "level": "expert",
    "percentage": 95
  }'
```

### Delete Skill
```bash
curl -X DELETE http://localhost:5000/api/admin/skills/SKILL_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Batch Create
```bash
curl -X POST http://localhost:5000/api/admin/skills/batch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {"name": "React", "category": "Frontend", "level": "advanced", "percentage": 90},
    {"name": "Node.js", "category": "Backend", "level": "intermediate", "percentage": 75}
  ]'
```

### Submit Contact Form
```bash
curl -X POST http://localhost:5000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Hello",
    "message": "This is a test message"
  }'
```

### Get Portfolio Data
```bash
curl http://localhost:5000/api/portfolio
```

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "count": 10
}
```

### Error
```json
{
  "success": false,
  "error": "Error message"
}
```

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry |
| 500 | Server Error | Internal error |

## Collections Overview

| Collection | Unique Fields | Validation |
|------------|--------------|------------|
| profiles | email (singleton) | name, email, phone |
| skills | name+category | name, category, level, percentage |
| projects | title | title, description, url |
| experiences | - | company, position, dates |
| education | - | institution, degree |
| blogs | title | title, content |
| vlogs | title | title, videoUrl |
| gallery | - | title, imageUrl |
| testimonials | - | name, message, rating |
| services | title | title, description |
| contacts | - | name, email, message |
| contactInfo | singleton | email, phone |
| achievements | title | title, description, date |

## Validation Rules Quick Reference

### Skills
- `name` ✓ Required
- `category` ✓ Required
- `level` ✓ Enum: beginner, intermediate, advanced, expert
- `percentage` ✓ Number 0-100

### Projects
- `title` ✓ Required
- `description` ✓ Required
- `url` ✓ Valid URL

### Contacts
- `name` ✓ Required
- `email` ✓ Valid email format
- `message` ✓ Required
- `status` ✓ Enum: unread, read, replied

### Testimonials
- `name` ✓ Required
- `message` ✓ Required
- `rating` ✓ Number 1-5

## File Structure

```
backend/
├── config/
│   └── firebase.js
├── controllers/
│   ├── allControllers.js           ← All 13 controllers
│   ├── firestoreControllerFactory.js
│   ├── authController.js
│   ├── AccessKeyController.js
│   └── AdminRequestController.js
├── middleware/
│   ├── authMiddleware.js
│   └── rbacMiddleware.js
├── utils/
│   ├── firestoreCRUD.js            ← Core CRUD operations
│   └── validation.js               ← Validation functions
├── initializeSampleData.js         ← Run to populate database
├── testAPI.js                      ← Run to test endpoints
└── server.js                       ← Main server file
```

## Troubleshooting

### Server won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Check Firebase credentials
# Make sure serviceAccountKey.json exists in backend/config/
```

### Authentication errors
```bash
# Make sure you're logged in first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "yourpassword"}'

# Copy the token from response and use it:
# -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Validation errors
```bash
# Check the error response for details
# Error messages tell you exactly what's wrong:
{
  "success": false,
  "error": "Validation failed",
  "message": "name is required, percentage must be between 0 and 100"
}
```

### Duplicate errors
```bash
# HTTP 409 means duplicate found
# Check unique constraints for the collection
# For skills: name+category must be unique
# For projects: title must be unique
```

## Testing Workflow

1. **Initialize data**: `node initializeSampleData.js`
2. **Start server**: `npm start`
3. **Register user**: POST to `/api/auth/register`
4. **Login**: POST to `/api/auth/login` (get token)
5. **Test CRUD**: Use token for admin endpoints
6. **Run tests**: `node testAPI.js`

## Production Checklist

- [ ] Firebase project configured
- [ ] Service account key file in place
- [ ] Environment variables set
- [ ] Sample data initialized
- [ ] All endpoints tested
- [ ] Authentication working
- [ ] Validation tested
- [ ] Duplicate prevention verified
- [ ] Error handling tested
- [ ] Frontend API calls updated

## Support Files

- `FIREBASE_CRUD_COMPLETE.md` - Complete API documentation
- `BACKEND_CRUD_SUMMARY.md` - Implementation summary
- `FIREBASE_QUICK_START.md` - Initial Firebase setup
- `FIREBASE_SETUP_COMPLETE.md` - Firebase migration guide

---

**Quick Test Command:**
```bash
# Initialize + Start + Test (all in one)
node initializeSampleData.js && npm start & sleep 5 && node testAPI.js
```

🚀 **Backend is ready to go!**
