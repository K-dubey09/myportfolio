# 🚀 Professional Portfolio Website# 🚀 Full-Stack Portfolio Application



A comprehensive full-stack portfolio application built with React.js and Node.js, featuring a powerful admin panel, dynamic content management, and professional portfolio showcase.A complete portfolio management system with React frontend and Node.js backend, featuring authentication, role-based access control, and MongoDB integration.



## 📋 Table of Contents## 📋 Table of Contents



- [Features](#-features)- [Features](#features)

- [Tech Stack](#-tech-stack)- [Tech Stack](#tech-stack)

- [Quick Start](#-quick-start)- [Quick Start](#quick-start)

- [Project Structure](#-project-structure)- [Project Structure](#project-structure)

- [API Documentation](#-api-documentation)- [API Documentation](#api-documentation)

- [Database Models](#-database-models)- [Authentication](#authentication)

- [Authentication & Authorization](#-authentication--authorization)- [Testing](#testing)

- [Admin Panel](#-admin-panel)- [Development](#development)

- [Portfolio Sections](#-portfolio-sections)- [Deployment](#deployment)

- [Development](#-development)

- [Deployment](#-deployment)## ✨ Features

- [Environment Variables](#-environment-variables)

- [Scripts](#-scripts)### 🎨 Frontend Features

- [Contributing](#-contributing)- **Modern React UI** with framer-motion animations

- **Responsive Design** that works on all devices

## ✨ Features- **Role-based Content** - Different views for admin/editor/viewer

- **Interactive Portfolio** showcase with smooth transitions

### 🎨 Frontend Features- **Admin Panel** for content management

- **Modern React 19 UI** with Framer Motion animations- **Real-time Notifications** with react-hot-toast

- **Professional Portfolio Design** with responsive layout

- **Dynamic Content Loading** from MongoDB database### 🔧 Backend Features

- **Interactive Admin Panel** for complete content management- **RESTful API** with Express.js

- **Multi-section Portfolio** (Profile, Projects, Services, Experience, Education, Blogs, Contact)- **MongoDB Integration** with Mongoose ODM

- **Contact Form** with email integration- **JWT Authentication** with role-based access control

- **Image Gallery** with professional image handling- **File Upload Support** with GridFS for large files

- **User Authentication** with role-based access control- **Rate Limiting** to prevent abuse

- **Real-time Notifications** with React Hot Toast- **Comprehensive Logging** and error handling

- **Responsive Design** optimized for all devices- **API Health Monitoring** endpoint



### 🔧 Backend Features### 🛡️ Security Features

- **RESTful API** with Express.js- **Password Hashing** with bcryptjs

- **MongoDB Integration** with Mongoose ODM- **JWT Token Security** with configurable expiration

- **JWT Authentication** with secure token management- **CORS Protection** with specific origin allowlist

- **File Upload System** with GridFS and Sharp image processing- **Rate Limiting** on sensitive endpoints

- **Rate Limiting** on sensitive endpoints- **Environment Variables** for sensitive configuration

- **CORS Configuration** for secure cross-origin requests

- **Comprehensive Error Handling** with detailed logging## 🛠️ Tech Stack

- **Health Monitoring** endpoints

- **Database Seeding** scripts for quick setup### Frontend

- **React 18** - Modern React with hooks

### 🛡️ Security Features- **Vite** - Fast build tool and dev server

- **Password Hashing** with bcryptjs- **React Router** - Client-side routing

- **JWT Token Security** with configurable expiration- **Framer Motion** - Smooth animations

- **Role-based Access Control** (Admin, Editor, Viewer)- **React Hot Toast** - Beautiful notifications

- **Protected Routes** with middleware authentication

- **Input Validation** and sanitization### Backend

- **Rate Limiting** to prevent abuse- **Node.js** - JavaScript runtime

- **Express.js** - Web application framework

## 🛠️ Tech Stack- **MongoDB** - NoSQL database

- **Mongoose** - MongoDB object modeling

### Frontend- **JWT** - JSON Web Tokens for authentication

- **React 19** - Latest React with concurrent features- **Multer + GridFS** - File upload handling

- **Vite (Rolldown)** - Next-generation build tool

- **React Router DOM** - Client-side routing### Development Tools

- **Framer Motion** - Professional animations- **Nodemon** - Auto-restart development server

- **Lucide React** - Beautiful icon library- **ESLint** - Code linting

- **React Hot Toast** - Toast notifications- **Concurrently** - Run multiple scripts simultaneously



### Backend## 🚀 Quick Start

- **Node.js** - JavaScript runtime

- **Express.js** - Web application framework### Prerequisites

- **MongoDB** - NoSQL database- Node.js (v18+ recommended)

- **Mongoose** - MongoDB object modeling- MongoDB (local or Atlas)

- **JWT** - JSON Web Tokens for authentication- Git

- **Multer + GridFS** - File upload and storage

- **Sharp** - High-performance image processing### Installation

- **bcryptjs** - Password hashing

1. **Clone the repository**

### Development Tools   ```bash

- **ESLint** - Code linting and formatting   git clone <repository-url>

- **Nodemon** - Auto-restart development server   cd portfolio

- **Concurrently** - Run multiple scripts simultaneously   ```



## 🚀 Quick Start2. **Install dependencies**

   ```bash

### Prerequisites   # Install root workspace dependencies

- Node.js (v18+ recommended)   npm install

- MongoDB (local installation or MongoDB Atlas)   

- Git   # Install backend dependencies

   cd backend

### Installation   npm install

   

1. **Clone the repository**   # Install frontend dependencies

   ```bash   cd ../frontend

   git clone https://github.com/k-dubey09/myportfolio.git   npm install

   cd myportfolio   ```

   ```

3. **Environment Setup**

2. **Install dependencies**   ```bash

   ```bash   # Copy example environment file

   # Install workspace dependencies   cd backend

   npm install   cp .env.example .env

      

   # Install backend dependencies   # Edit .env with your configuration

   cd backend   nano .env

   npm install   ```

   

   # Install frontend dependencies4. **Database Setup**

   cd ../frontend   ```bash

   npm install   # Seed the database with sample data

   cd ..   cd backend

   ```   npm run seed

   ```

3. **Environment Configuration**

   Create a `.env` file in the `backend` directory:5. **Start Development Servers**

   ```env   ```bash

   # Server Configuration   # Start both frontend and backend (from root directory)

   PORT=5000   npm run dev

   NODE_ENV=development   

   FRONTEND_URL=http://localhost:5173   # OR start individually

   npm run dev:backend    # Backend only

   # Database   npm run dev:frontend   # Frontend only

   MONGODB_URI=mongodb://localhost:27017/portfolio   ```



   # Authentication## 📁 Project Structure

   JWT_SECRET=your-super-secret-jwt-key-here

```

   # Admin User (for initial setup)portfolio/

   ADMIN_EMAIL=admin@portfolio.com├── backend/                 # Node.js backend API

   ADMIN_PASSWORD=admin123│   ├── config/             # Database and configuration

   ADMIN_NAME=Portfolio Admin│   ├── controllers/        # Route controllers

   ```│   ├── middleware/         # Custom middleware

│   ├── models/            # MongoDB models

4. **Database Setup**│   ├── routes/            # API routes (if using separate routing)

   ```bash│   ├── scripts/           # Database seeding scripts

   # Seed the database with initial data│   ├── test/              # API tests

   npm run seed│   ├── uploads/           # File upload directory

   ```│   ├── utils/             # Utility functions

│   ├── .env               # Environment variables

5. **Start Development Servers**│   ├── .env.example       # Environment template

   ```bash│   ├── server.js          # Main server file

   # Start both frontend and backend simultaneously│   └── package.json       # Backend dependencies

   npm run dev├── frontend/              # React frontend

   ```│   ├── public/            # Static assets

│   ├── src/               # Source code

6. **Access the Application**│   │   ├── components/    # React components

   - **Portfolio Website**: http://localhost:5173│   │   ├── context/       # React context providers

   - **Admin Panel**: http://localhost:5173/admin│   │   ├── assets/        # Images, fonts, etc.

   - **API Health Check**: http://localhost:5000/api/health│   │   ├── App.jsx        # Main App component

│   │   └── main.jsx       # Entry point

## 📁 Project Structure│   ├── Admin/             # Admin panel components

│   └── package.json       # Frontend dependencies

```├── package.json           # Root workspace configuration

portfolio/└── README.md              # This file

├── 📂 backend/                    # Node.js Backend API```

│   ├── 📂 config/

│   │   └── database.js           # MongoDB connection configuration## 🔌 API Documentation

│   ├── 📂 controllers/           # Route controllers

│   │   ├── authController.js     # Authentication logic### Base URL

│   │   ├── contactInfoController.js- Development: `http://localhost:5000/api`

│   │   ├── crudController.js     # Generic CRUD operations- Production: `https://your-domain.com/api`

│   │   ├── fileController.js     # File upload handling

│   │   ├── imageController.js    # Image processing### Authentication Endpoints

│   │   ├── profileController.js  # Profile management

│   │   └── userController.js     # User management#### POST `/auth/login`

│   ├── 📂 middleware/Login with email and password.

│   │   └── auth.js               # JWT authentication middleware

│   ├── 📂 models/                # MongoDB schemas**Request Body:**

│   │   ├── Blog.js               # Blog posts```json

│   │   ├── Contact.js            # Contact messages{

│   │   ├── ContactInfo.js        # Contact information  "email": "admin@portfolio.com",

│   │   ├── Education.js          # Educational background  "password": "admin123"

│   │   ├── Experience.js         # Work experience}

│   │   ├── Gallery.js            # Image gallery```

│   │   ├── Profile.js            # Personal profile

│   │   ├── Project.js            # Portfolio projects**Response:**

│   │   ├── Service.js            # Services offered```json

│   │   ├── Skill.js              # Technical skills{

│   │   ├── Testimonial.js        # Client testimonials  "message": "Login successful",

│   │   ├── User.js               # User accounts  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

│   │   └── Vlog.js               # Video blogs  "user": {

│   ├── 📂 routes/    "id": "...",

│   │   ├── fileRoutes.js         # File upload routes    "email": "admin@portfolio.com",

│   │   ├── imageRoutes.js        # Image handling routes    "name": "Admin User",

│   │   └── portfolioRoutes.js    # Portfolio API routes    "role": "admin",

│   ├── 📂 scripts/               # Database utilities    "permissions": ["canCreatePosts", "canEditPosts", "canDeletePosts", "canUploadFiles", "canManageUsers"]

│   │   ├── seedDatabase.js       # Database seeding  }

│   │   ├── createAdmin.js        # Admin user creation}

│   │   └── migrateEnhancedSchemas.js```

│   ├── 📂 uploads/               # File storage directory

│   ├── 📂 utils/                 # Utility functions#### POST `/auth/register`

│   │   ├── auth.js               # Authentication utilitiesRegister a new user (admin only).

│   │   ├── dataManager.js        # Data management

│   │   └── fileUpload.js         # File upload utilities#### GET `/auth/profile`

│   ├── .env                      # Environment variablesGet current user profile (requires authentication).

│   ├── server.js                 # Main server file

│   └── package.json              # Backend dependencies### Public Endpoints

├── 📂 frontend/                   # React Frontend

│   ├── 📂 public/                # Static assets#### GET `/profile`

│   ├── 📂 src/Get portfolio owner's profile information.

│   │   ├── 📂 components/        # React components

│   │   │   ├── AdminLogin.jsx    # Admin authentication#### GET `/projects`

│   │   │   ├── ContactsList.jsx  # Contact messages listGet all public projects.

│   │   │   ├── Login.jsx         # User login

│   │   │   ├── Navigation.jsx    # Navigation component#### GET `/skills`

│   │   │   ├── PortfolioSite.jsx # Main portfolio componentGet all skills.

│   │   │   ├── RegistrationPage.jsx

│   │   │   └── UserRegistration.jsx#### GET `/portfolio`

│   │   ├── 📂 context/Get complete portfolio data (profile, projects, skills).

│   │   │   └── AuthContext.jsx   # Authentication context

│   │   ├── 📂 pages/             # Portfolio section pages### Protected Endpoints

│   │   │   ├── AchievementsPage.jsx

│   │   │   ├── BlogsPage.jsx#### GET `/admin/*`

│   │   │   ├── CertificationsPage.jsxAdmin-only endpoints (requires admin role).

│   │   │   ├── EducationPage.jsx

│   │   │   ├── ExperiencePage.jsx#### POST `/admin/*`

│   │   │   ├── GalleryPage.jsxAdmin creation endpoints (requires appropriate permissions).

│   │   │   ├── ProjectsPage.jsx

│   │   │   ├── ServicesPage.jsx### Health Check

│   │   │   ├── SkillsPage.jsx

│   │   │   ├── StatisticsPage.jsx#### GET `/health`

│   │   │   ├── TestimonialsPage.jsxServer health status.

│   │   │   └── VlogsPage.jsx

│   │   ├── 📂 assets/            # Images, fonts, etc.**Response:**

│   │   ├── App.jsx               # Main App component```json

│   │   ├── App.css               # Global styles{

│   │   ├── index.css             # Base styles  "status": "OK",

│   │   └── main.jsx              # Entry point  "timestamp": "2025-10-06T09:01:05.248Z",

│   ├── 📂 Admin/                 # Admin Panel  "environment": "development",

│   │   ├── AdminPanel.jsx        # Main admin interface  "database": "connected"

│   │   └── AdminPanel.css        # Admin panel styling}

│   ├── eslint.config.js          # ESLint configuration```

│   ├── vite.config.js            # Vite build configuration

│   └── package.json              # Frontend dependencies## 🔐 Authentication

├── .gitignore                    # Git ignore rules

├── package.json                  # Workspace configuration### Default Admin Credentials

└── README.md                     # This documentation- **Email:** `admin@portfolio.com`

```- **Password:** `admin123`



## 🔌 API Documentation⚠️ **Important:** Change the default admin password after first login!



### Base URL### User Roles

- **Development**: `http://localhost:5000/api`

- **Production**: `https://your-domain.com/api`#### Admin

- Full access to all features

### Authentication Endpoints- User management

- Content creation, editing, and deletion

#### POST `/auth/login`- File uploads

User authentication with email and password.

#### Editor

**Request:**- Content creation and editing

```json- File uploads

{- Limited user management

  "email": "admin@portfolio.com",

  "password": "admin123"#### Viewer

}- Read-only access

```- Cannot modify content



**Response:**### JWT Configuration

```json- **Expiration:** 7 days (configurable in .env)

{- **Algorithm:** HS256

  "success": true,- **Secret:** Set in JWT_SECRET environment variable

  "message": "Login successful",

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",## 🧪 Testing

  "user": {

    "id": "...",### Backend API Tests

    "email": "admin@portfolio.com",```bash

    "name": "Portfolio Admin",cd backend

    "role": "admin"npm run test

  }```

}

```### Manual Testing

1. **API Test Page:** `http://localhost:5000/test-page`

#### POST `/auth/register`2. **Health Check:** `http://localhost:5000/api/health`

Register new user (admin only).3. **Frontend:** `http://localhost:5173`



#### GET `/auth/profile`### Test Coverage

Get current user profile (requires authentication).The test suite covers:

- ✅ Server health check

### Portfolio Endpoints- ✅ Public API endpoints

- ✅ Authentication flow

#### GET `/profile`- ✅ Protected routes

Get portfolio owner's profile information.- ✅ Database connectivity



#### GET `/projects`## 💻 Development

Get all portfolio projects.

### Available Scripts

#### GET `/services`

Get all services offered.#### Root Directory

```bash

#### GET `/experiences`npm run dev          # Start both frontend and backend

Get work experience data.npm run dev:backend  # Start backend only

npm run dev:frontend # Start frontend only

#### GET `/education`npm run build        # Build frontend for production

Get educational background.npm run test         # Run backend tests

npm run seed         # Seed database with sample data

#### GET `/blogs````

Get blog posts.

#### Backend Directory

#### GET `/contact-info````bash

Get contact information.npm run dev    # Start development server with nodemon

npm run start  # Start production server

#### POST `/contact`npm run seed   # Seed database

Submit contact form message.npm run test   # Run API tests

```

### Admin Endpoints (Protected)

#### Frontend Directory

#### GET `/admin/dashboard````bash

Get admin dashboard data.npm run dev    # Start development server

npm run build  # Build for production

#### POST `/admin/profile`npm run preview # Preview production build

Update profile information.```



#### POST `/admin/projects`### Environment Variables

Create new project.

#### Backend (.env)

#### PUT `/admin/projects/:id````env

Update existing project.# Server Configuration

PORT=5000

#### DELETE `/admin/projects/:id`NODE_ENV=development

Delete project.FRONTEND_URL=http://localhost:5173



### File Upload Endpoints# Database

MONGODB_URI=mongodb://localhost:27017/my-portfolio

#### POST `/upload/image`

Upload and process images.# Authentication

JWT_SECRET=your-super-secret-jwt-key

#### POST `/upload/file`

Upload files to GridFS storage.# Admin User (for seeding)

ADMIN_EMAIL=admin@portfolio.com

### Health CheckADMIN_PASSWORD=admin123

ADMIN_NAME=Admin User

#### GET `/health````

Server health status and database connectivity.

### Development Guidelines

## 🗄️ Database Models

1. **Code Style:** Follow ESLint configuration

### Core Models2. **Commits:** Use conventional commit messages

3. **Testing:** Write tests for new API endpoints

#### **Profile**4. **Security:** Never commit sensitive data to version control

```javascript

{## 🚀 Deployment

  name: String,

  title: String,### Backend Deployment

  bio: String,

  email: String,1. **Environment Setup**

  phone: String,   - Set production environment variables

  location: String,   - Use MongoDB Atlas for database

  profileImage: String,   - Configure proper JWT secret

  socialLinks: {

    linkedin: String,2. **Build & Deploy**

    github: String,   ```bash

    twitter: String,   npm run start

    website: String   ```

  }

}### Frontend Deployment

```

1. **Build for Production**

#### **Project**   ```bash

```javascript   cd frontend

{   npm run build

  title: String,   ```

  description: String,

  technologies: [String],2. **Deploy** built files from `frontend/dist` directory

  liveUrl: String,

  githubUrl: String,### Production Considerations

  imageUrl: String,

  category: String,- Use HTTPS in production

  featured: Boolean,- Set secure CORS origins

  createdAt: Date- Implement proper logging

}- Set up monitoring and health checks

```- Use environment-specific configurations

- Implement database backups

#### **Experience**

```javascript## 📊 Performance & Monitoring

{

  company: String,### Health Monitoring

  position: String,- Health endpoint: `/api/health`

  startDate: Date,- Database connection status

  endDate: Date,- Server uptime tracking

  current: Boolean,

  description: String,### Performance Features

  technologies: [String],- Rate limiting on authentication endpoints

  location: String- Efficient MongoDB queries with indexing

}- Optimized frontend bundle with Vite

```- Image optimization for uploads



#### **Education**## 🤝 Contributing

```javascript

{1. Fork the repository

  institution: String,2. Create a feature branch

  degree: String,3. Make your changes

  field: String,4. Write/update tests

  startDate: Date,5. Submit a pull request

  endDate: Date,

  gpa: Number,## 📄 License

  description: String

}This project is licensed under the MIT License - see the LICENSE file for details.

```

## 🆘 Support

#### **Service**

```javascript### Common Issues

{

  title: String,1. **Port already in use**

  description: String,   ```bash

  icon: String,   # Kill existing Node processes

  price: String,   npx kill-port 5000

  features: [String]   ```

}

```2. **MongoDB connection issues**

   - Ensure MongoDB is running

#### **Blog**   - Check connection string in .env

```javascript   - Verify database permissions

{

  title: String,3. **Frontend API connection issues**

  content: String,   - Check backend server is running

  excerpt: String,   - Verify CORS configuration

  imageUrl: String,   - Check network/firewall settings

  category: String,

  tags: [String],### Getting Help

  published: Boolean,

  publishedAt: Date- Check the [Issues](../../issues) page

}- Review the [API test page](http://localhost:5000/test-page) when servers are running

```- Verify all endpoints work with the test suite



#### **Contact**---

```javascript

{🎉 **Happy coding!** Your portfolio application is now ready for development and deployment.
  name: String,
  email: String,
  subject: String,
  message: String,
  status: String,
  createdAt: Date
}
```

#### **User**
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String,
  permissions: [String],
  lastLogin: Date,
  isActive: Boolean
}
```

## 🔐 Authentication & Authorization

### User Roles

#### **Admin**
- Full system access
- User management
- Content creation, editing, deletion
- File uploads and management
- System configuration

#### **Editor**
- Content creation and editing
- File uploads
- Limited user management

#### **Viewer**
- Read-only access
- Cannot modify content

### Default Credentials
- **Email**: `admin@portfolio.com`
- **Password**: `admin123`

⚠️ **Important**: Change default credentials after first login!

### JWT Configuration
- **Expiration**: 7 days (configurable)
- **Algorithm**: HS256
- **Secret**: Set in environment variables

## 🎛️ Admin Panel

The comprehensive admin panel provides full control over portfolio content:

### Features
- **Dashboard** with analytics and quick stats
- **Profile Management** - Update personal information and images
- **Project Management** - Add, edit, delete projects with image uploads
- **Service Management** - Manage services offered
- **Experience Management** - Work history and career timeline
- **Education Management** - Academic background
- **Blog Management** - Create and manage blog posts
- **Contact Management** - View and respond to contact messages
- **User Management** - Admin user controls
- **File Management** - Upload and organize media files

### Access
- Navigate to `/admin` on the frontend
- Login with admin credentials
- Full CRUD operations on all content types

## 🏠 Portfolio Sections

### Main Sections

1. **Hero/Profile Section**
   - Personal introduction
   - Professional title
   - Profile image
   - Contact information
   - Social links

2. **About Section**
   - Detailed biography
   - Skills showcase
   - Professional summary

3. **Services Section**
   - Services offered
   - Pricing information
   - Service descriptions

4. **Projects Section**
   - Portfolio projects
   - Live demos and GitHub links
   - Technology stacks
   - Project categories

5. **Experience Section**
   - Work history
   - Company details
   - Role descriptions
   - Career timeline

6. **Education Section**
   - Academic background
   - Certifications
   - Achievements

7. **Blog Section**
   - Technical articles
   - Industry insights
   - Personal thoughts

8. **Contact Section**
   - Contact form
   - Contact information
   - Location details
   - Social media links

## 💻 Development

### Available Scripts

#### **Root Directory**
```bash
npm run dev          # Start both frontend and backend
npm run dev:backend  # Start backend only
npm run dev:frontend # Start frontend only
npm run build        # Build frontend for production
npm run test         # Run backend tests
npm run seed         # Seed database with sample data
```

#### **Backend Directory**
```bash
npm run start        # Start production server
npm run dev          # Start development server with nodemon
npm run seed         # Seed database with sample data
npm run test         # Run API tests
```

#### **Frontend Directory**
```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Development Workflow

1. **Setup Environment**
   ```bash
   # Clone and install
   git clone <repository-url>
   cd portfolio
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Seed Database**
   ```bash
   npm run seed
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

### Code Style Guidelines

- **ESLint**: Follow configured rules
- **Commits**: Use conventional commit messages
- **Testing**: Write tests for new API endpoints
- **Security**: Never commit sensitive data

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup**
   ```bash
   # Production environment variables
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=secure-production-secret
   ```

2. **Build and Deploy**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy Built Files**
   - Deploy contents of `frontend/dist` directory
   - Configure web server to serve static files
   - Set up proper routing for SPA

### Production Considerations

- **HTTPS**: Use SSL/TLS certificates
- **Environment Variables**: Secure configuration
- **Database**: Use MongoDB Atlas or secured instance
- **Monitoring**: Implement logging and health checks
- **Backup**: Regular database backups
- **CDN**: Use CDN for static assets

## 🔧 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/portfolio

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Admin User (for seeding)
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Portfolio Admin

# File Upload
MAX_FILE_SIZE=5000000
UPLOAD_PATH=uploads/

# Email (if using email services)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

## 📜 Scripts

### Database Scripts
- `seedDatabase.js` - Initial database setup with sample data
- `createAdmin.js` - Create admin user
- `migrateEnhancedSchemas.js` - Database schema migration

### Utility Scripts
- `cleanupAndResetProfile.js` - Reset profile data
- `checkProfileRecords.js` - Validate profile records
- `testContactInfoSingleRecord.js` - Test contact info functionality

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make changes and commit**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open Pull Request**

### Development Guidelines
- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill existing processes
   npx kill-port 5000
   npx kill-port 5173
   ```

2. **MongoDB connection issues**
   - Ensure MongoDB is running
   - Check connection string
   - Verify network connectivity

3. **Frontend API connection issues**
   - Verify backend is running on port 5000
   - Check CORS configuration
   - Ensure API endpoints are accessible

4. **File upload issues**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure Sharp is properly installed

### Health Check
- **API Health**: http://localhost:5000/api/health
- **Database Status**: Included in health check response

### Getting Help
- Check [Issues](../../issues) page
- Review API documentation
- Test endpoints with health check

---

## 🎯 Project Highlights

✅ **Full-stack Architecture** - Complete MERN stack implementation  
✅ **Professional Design** - Modern UI/UX with animations  
✅ **Admin Panel** - Comprehensive content management  
✅ **Database Integration** - MongoDB with proper schema design  
✅ **Authentication** - Secure JWT-based auth system  
✅ **File Management** - Image upload and processing  
✅ **Responsive Design** - Mobile-first approach  
✅ **SEO Ready** - Optimized for search engines  
✅ **Production Ready** - Deployment-ready configuration  

---

**🎉 Happy coding! Your professional portfolio is ready to showcase your amazing work.**

---

*Built with ❤️ using React, Node.js, and MongoDB*