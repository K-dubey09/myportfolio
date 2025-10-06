# 🚀 Full-Stack Portfolio Application with Role-Based Access Control

A complete portfolio management system with secure MongoDB storage, GridFS file uploads, and sophisticated role-based authentication.

## ✨ Key Features Implemented

### 🔐 **Unified Authentication System**
- **Single Login Page**: Common login interface for all user roles
- **Role-Based Access**: Admin, Editor, and Viewer permissions
- **JWT Security**: Secure token-based authentication
- **Registration Control**: Users can only register as "Viewer" role
- **Admin Panel Protection**: Only admins see admin panel access

### 📁 **MongoDB GridFS File Storage**
- **No Local Folders**: All uploads stored directly in MongoDB
- **GridFS Integration**: Handles large files efficiently
- **File Metadata**: Tracks uploader info, roles, and categories
- **Secure Access**: Role-based file access permissions
- **File Management**: Admin dashboard for file organization

### 🎯 **Role-Based Content Display**
- **Dynamic Navigation**: Menu items appear based on user role
- **Protected Content**: Blogs, vlogs, and gallery require authentication
- **Admin Panel**: Only visible to admin users
- **Personalized Experience**: Content tailored to user permissions

## 🏗️ **System Architecture**

### Backend (Node.js + Express + MongoDB)
```
📦 backend/
├── 🔧 server.js                 # Main server with GridFS setup
├── 🗃️ models/
│   ├── User.js                  # User authentication & roles
│   ├── Gallery.js               # Image gallery with GridFS
│   └── [Other models...]
├── 🎮 controllers/
│   ├── authController.js        # Unified authentication
│   ├── fileController.js        # GridFS file operations
│   └── [Other controllers...]
├── 🛡️ middleware/
│   └── auth.js                  # Role-based permissions
└── 🔧 utils/
    └── fileUpload.js            # GridFS utilities
```

### Frontend (React + Vite)
```
📦 frontend/
├── 🏠 src/
│   ├── 📱 components/
│   │   ├── Login.jsx            # Unified login component
│   │   ├── PortfolioSite.jsx    # Main site with role-based UI
│   │   └── UserRegistration.jsx # Viewer registration
│   ├── 🎨 context/
│   │   └── AuthContext.jsx      # Authentication state
│   └── 💄 styles/
│       ├── Login.css            # Modern login styling
│       └── App.css              # Role-based navigation
```

## 🚀 **Getting Started**

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone & Install**
   ```bash
   git clone <repository>
   cd portfolio
   npm install
   ```

2. **Configure Environment**
   ```bash
   # backend/.env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/my-portfolio
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL=http://localhost:5173
   ADMIN_EMAIL=admin@portfolio.com
   ADMIN_PASSWORD=admin123
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## 🔑 **Authentication System**

### User Roles & Permissions

#### 👑 **Admin**
- Full access to admin panel
- File upload & management
- User management
- Content creation/editing/deletion
- Analytics access

#### ✏️ **Editor**
- Content creation & editing
- File uploads
- Limited admin access
- No user management

#### 👀 **Viewer**
- Access to protected content (blogs, vlogs, gallery)
- View-only permissions
- No admin panel access
- Public registration available

### Login Credentials
```
Admin Login:
Email: admin@portfolio.com
Password: admin123

Test Registration:
- Anyone can register as a "Viewer"
- Admin creates Editor/Admin accounts
```

## 📂 **File Management with GridFS**

### File Upload Features
- **MongoDB Storage**: No local file system dependencies
- **Large File Support**: GridFS handles files > 16MB
- **Metadata Tracking**: User, role, category information
- **Secure Access**: Role-based file permissions
- **File Categories**: Organized by content type

### File API Endpoints
```
POST /api/upload              # Upload file to GridFS
GET  /api/files/:filename     # Serve file from GridFS
GET  /api/files               # List files (paginated)
DELETE /api/files/:filename   # Delete file (admin/owner)
GET  /api/files/:filename/info # File metadata
```

## 🎨 **Role-Based UI Features**

### Navigation Bar
- **Dynamic Menu**: Items appear based on authentication status
- **Admin Panel Button**: Only visible to admin users
- **Login/Logout**: Unified authentication controls
- **User Badge**: Shows current role with styling

### Content Visibility
- **Public**: About, Projects, Experience, Contact
- **Authenticated**: Blogs, Vlogs, Gallery, Testimonials
- **Admin**: Full admin panel access

### Registration Flow
- **Homepage**: Login button instead of registration
- **Login Page**: Contains "Register as Viewer" option
- **No Public Admin**: Admin accounts created by existing admins

## 🛡️ **Security Features**

### Authentication Security
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role Validation**: Server-side permission checks
- **Token Expiry**: 7-day token lifetime

### File Security
- **Upload Validation**: File type and size restrictions
- **Access Control**: Role-based file access
- **Malware Protection**: File type whitelist
- **Metadata Tracking**: Audit trail for uploads

## 📊 **API Documentation**

### Authentication Endpoints
```
POST /api/auth/login     # User login
POST /api/auth/register  # User registration (viewer only)
GET  /api/auth/profile   # Current user profile
POST /api/auth/logout    # User logout
```

### Content Endpoints
```
GET  /api/profile        # Public profile data
GET  /api/projects       # Public projects
GET  /api/blogs          # Protected: Authenticated users
GET  /api/vlogs          # Protected: Authenticated users
GET  /api/gallery        # Protected: Authenticated users
```

### Admin Endpoints
```
GET  /api/admin/users    # User management (admin only)
POST /api/admin/*        # Content management (role-based)
```

## 🔧 **Development Commands**

```bash
# Start both servers
npm run dev

# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Build for production
npm run build

# Seed database
npm run seed

# Run tests
npm run test
```

## 🌐 **Live Application**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:5173/admin (admin only)

## 📝 **Usage Guide**

### For Visitors
1. Browse public content (about, projects, experience)
2. Click "Login" to access exclusive content
3. Register as "Viewer" for blog/vlog/gallery access

### For Admins
1. Login with admin credentials
2. Access admin panel via navigation
3. Upload files - stored in MongoDB GridFS
4. Manage users and content
5. Files appear on main page based on role permissions

### For Content Management
1. All uploads go to MongoDB (no local folders)
2. Files are categorized and tracked
3. Role-based visibility on main page
4. Secure file serving through API

## 🏆 **Technical Achievements**

✅ **Unified Login System** - Single interface for all roles  
✅ **MongoDB GridFS Storage** - No local file dependencies  
✅ **Role-Based UI** - Dynamic content based on permissions  
✅ **Secure File Management** - Tracked uploads with metadata  
✅ **Protected Admin Panel** - Only accessible to admin users  
✅ **Public Registration** - Viewers can self-register  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Responsive Design** - Modern, mobile-friendly UI  

## 🔮 **Next Steps**

- [ ] Email verification for registration
- [ ] Password reset functionality  
- [ ] File upload progress indicators
- [ ] Advanced file filtering and search
- [ ] Bulk file operations
- [ ] Image optimization and thumbnails
- [ ] Social media integration
- [ ] Analytics dashboard

---

**🎉 Your portfolio system is now fully operational with secure MongoDB storage, role-based access control, and a unified authentication experience!**