# 🚀 Full-Stack Portfolio Application

A complete portfolio management system with React frontend and Node.js backend, featuring authentication, role-based access control, and MongoDB integration.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Testing](#testing)
- [Development](#development)
- [Deployment](#deployment)

## ✨ Features

### 🎨 Frontend Features
- **Modern React UI** with framer-motion animations
- **Responsive Design** that works on all devices
- **Role-based Content** - Different views for admin/editor/viewer
- **Interactive Portfolio** showcase with smooth transitions
- **Admin Panel** for content management
- **Real-time Notifications** with react-hot-toast

### 🔧 Backend Features
- **RESTful API** with Express.js
- **MongoDB Integration** with Mongoose ODM
- **JWT Authentication** with role-based access control
- **File Upload Support** with GridFS for large files
- **Rate Limiting** to prevent abuse
- **Comprehensive Logging** and error handling
- **API Health Monitoring** endpoint

### 🛡️ Security Features
- **Password Hashing** with bcryptjs
- **JWT Token Security** with configurable expiration
- **CORS Protection** with specific origin allowlist
- **Rate Limiting** on sensitive endpoints
- **Environment Variables** for sensitive configuration

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **React Hot Toast** - Beautiful notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Multer + GridFS** - File upload handling

### Development Tools
- **Nodemon** - Auto-restart development server
- **ESLint** - Code linting
- **Concurrently** - Run multiple scripts simultaneously

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   # Install root workspace dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy example environment file
   cd backend
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Seed the database with sample data
   cd backend
   npm run seed
   ```

5. **Start Development Servers**
   ```bash
   # Start both frontend and backend (from root directory)
   npm run dev
   
   # OR start individually
   npm run dev:backend    # Backend only
   npm run dev:frontend   # Frontend only
   ```

## 📁 Project Structure

```
portfolio/
├── backend/                 # Node.js backend API
│   ├── config/             # Database and configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes (if using separate routing)
│   ├── scripts/           # Database seeding scripts
│   ├── test/              # API tests
│   ├── uploads/           # File upload directory
│   ├── utils/             # Utility functions
│   ├── .env               # Environment variables
│   ├── .env.example       # Environment template
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Entry point
│   ├── Admin/             # Admin panel components
│   └── package.json       # Frontend dependencies
├── package.json           # Root workspace configuration
└── README.md              # This file
```

## 🔌 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

### Authentication Endpoints

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@portfolio.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@portfolio.com",
    "name": "Admin User",
    "role": "admin",
    "permissions": ["canCreatePosts", "canEditPosts", "canDeletePosts", "canUploadFiles", "canManageUsers"]
  }
}
```

#### POST `/auth/register`
Register a new user (admin only).

#### GET `/auth/profile`
Get current user profile (requires authentication).

### Public Endpoints

#### GET `/profile`
Get portfolio owner's profile information.

#### GET `/projects`
Get all public projects.

#### GET `/skills`
Get all skills.

#### GET `/portfolio`
Get complete portfolio data (profile, projects, skills).

### Protected Endpoints

#### GET `/admin/*`
Admin-only endpoints (requires admin role).

#### POST `/admin/*`
Admin creation endpoints (requires appropriate permissions).

### Health Check

#### GET `/health`
Server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-06T09:01:05.248Z",
  "environment": "development",
  "database": "connected"
}
```

## 🔐 Authentication

### Default Admin Credentials
- **Email:** `admin@portfolio.com`
- **Password:** `admin123`

⚠️ **Important:** Change the default admin password after first login!

### User Roles

#### Admin
- Full access to all features
- User management
- Content creation, editing, and deletion
- File uploads

#### Editor
- Content creation and editing
- File uploads
- Limited user management

#### Viewer
- Read-only access
- Cannot modify content

### JWT Configuration
- **Expiration:** 7 days (configurable in .env)
- **Algorithm:** HS256
- **Secret:** Set in JWT_SECRET environment variable

## 🧪 Testing

### Backend API Tests
```bash
cd backend
npm run test
```

### Manual Testing
1. **API Test Page:** `http://localhost:5000/test-page`
2. **Health Check:** `http://localhost:5000/api/health`
3. **Frontend:** `http://localhost:5173`

### Test Coverage
The test suite covers:
- ✅ Server health check
- ✅ Public API endpoints
- ✅ Authentication flow
- ✅ Protected routes
- ✅ Database connectivity

## 💻 Development

### Available Scripts

#### Root Directory
```bash
npm run dev          # Start both frontend and backend
npm run dev:backend  # Start backend only
npm run dev:frontend # Start frontend only
npm run build        # Build frontend for production
npm run test         # Run backend tests
npm run seed         # Seed database with sample data
```

#### Backend Directory
```bash
npm run dev    # Start development server with nodemon
npm run start  # Start production server
npm run seed   # Seed database
npm run test   # Run API tests
```

#### Frontend Directory
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/my-portfolio

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Admin User (for seeding)
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
```

### Development Guidelines

1. **Code Style:** Follow ESLint configuration
2. **Commits:** Use conventional commit messages
3. **Testing:** Write tests for new API endpoints
4. **Security:** Never commit sensitive data to version control

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup**
   - Set production environment variables
   - Use MongoDB Atlas for database
   - Configure proper JWT secret

2. **Build & Deploy**
   ```bash
   npm run start
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy** built files from `frontend/dist` directory

### Production Considerations

- Use HTTPS in production
- Set secure CORS origins
- Implement proper logging
- Set up monitoring and health checks
- Use environment-specific configurations
- Implement database backups

## 📊 Performance & Monitoring

### Health Monitoring
- Health endpoint: `/api/health`
- Database connection status
- Server uptime tracking

### Performance Features
- Rate limiting on authentication endpoints
- Efficient MongoDB queries with indexing
- Optimized frontend bundle with Vite
- Image optimization for uploads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

1. **Port already in use**
   ```bash
   # Kill existing Node processes
   npx kill-port 5000
   ```

2. **MongoDB connection issues**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify database permissions

3. **Frontend API connection issues**
   - Check backend server is running
   - Verify CORS configuration
   - Check network/firewall settings

### Getting Help

- Check the [Issues](../../issues) page
- Review the [API test page](http://localhost:5000/test-page) when servers are running
- Verify all endpoints work with the test suite

---

🎉 **Happy coding!** Your portfolio application is now ready for development and deployment.