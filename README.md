# 🚀 Professional Portfolio Website# 🚀 Professional Portfolio Website



A comprehensive full-stack portfolio application built with React.js and Node.js, featuring a powerful admin panel, dynamic content management, and professional portfolio showcase.A comprehensive full-stack portfolio application built with React.js and Node.js, featuring a powerful admin panel, dynamic content management, and professional portfolio showcase.



## 📋 Table of Contents## 📋 Table of Contents



- [Features](#-features)- [Features](#-features)

- [Tech Stack](#-tech-stack)- [Tech Stack](#-tech-stack)

- [Quick Start](#-quick-start)- [Quick Start](#-quick-start)

- [Project Structure](#-project-structure)- [Project Structure](#-project-structure)

- [API Documentation](#-api-documentation)- [API Documentation](#-api-documentation)

- [Database Models](#-database-models)- [Database Models](#-database-models)

- [Authentication & Authorization](#-authentication--authorization)- [Authentication & Authorization](#-authentication--authorization)

- [Admin Panel](#-admin-panel)- [Admin Panel](#-admin-panel)

- [Portfolio Sections](#-portfolio-sections)- [Portfolio Sections](#-portfolio-sections)

- [Development](#-development)- [Development](#-development)

- [Deployment](#-deployment)- [Deployment](#-deployment)

- [Environment Configuration](#-environment-configuration)- [Environment Configuration](#-environment-configuration)

- [Scripts](#-scripts)- [Scripts](#-scripts)

- [Contributing](#-contributing)- [Contributing](#-contributing)



## ✨ Features## ✨ Features



### 🎨 Frontend Features### 🎨 Frontend Features

- **Modern React 19 UI** with Framer Motion animations- **Modern React 19 UI** with Framer Motion animations

- **Professional Portfolio Design** with responsive layout- **Professional Portfolio Design** with responsive layout

- **Dynamic Content Loading** from MongoDB database- **Dynamic Content Loading** from MongoDB database

- **Interactive Admin Panel** for complete content management- **Interactive Admin Panel** for complete content management

- **Multi-section Portfolio** (Profile, Projects, Services, Experience, Education, Blogs, Contact)- **Multi-section Portfolio** (Profile, Projects, Services, Experience, Education, Blogs, Contact)

- **Contact Form** with email integration- **Contact Form** with email integration

- **Image Gallery** with professional image handling- **Image Gallery** with professional image handling

- **User Authentication** with role-based access control- **User Authentication** with role-based access control

- **Real-time Notifications** with React Hot Toast- **Real-time Notifications** with React Hot Toast

- **Responsive Design** optimized for all devices- **Responsive Design** optimized for all devices



### 🔧 Backend Features### 🔧 Backend Features

- **RESTful API** with Express.js- **RESTful API** with Express.js

- **MongoDB Integration** with Mongoose ODM- **MongoDB Integration** with Mongoose ODM

- **JWT Authentication** with secure token management- **JWT Authentication** with secure token management

- **File Upload System** with GridFS and Sharp image processing- **File Upload System** with GridFS and Sharp image processing

- **Rate Limiting** on sensitive endpoints- **Rate Limiting** on sensitive endpoints

- **CORS Configuration** for secure cross-origin requests- **CORS Configuration** for secure cross-origin requests

- **Comprehensive Error Handling** with detailed logging- **Comprehensive Error Handling** with detailed logging

- **Health Monitoring** endpoints- **Health Monitoring** endpoints

- **Database Seeding** scripts for quick setup- **Database Seeding** scripts for quick setup



### 🛡️ Security Features### 🛡️ Security Features

- **Password Hashing** with bcryptjs- **Password Hashing** with bcryptjs

- **JWT Token Security** with configurable expiration- **JWT Token Security** with configurable expiration

- **Role-based Access Control** (Admin, Editor, Viewer)- **Role-based Access Control** (Admin, Editor, Viewer)

- **Protected Routes** with middleware authentication- **Protected Routes** with middleware authentication

- **Input Validation** and sanitization- **Input Validation** and sanitization

- **Rate Limiting** to prevent abuse- **Rate Limiting** to prevent abuse



## 🛠️ Tech Stack## 🛠️ Tech Stack



### Frontend### Frontend

- **React 19** - Latest React with concurrent features- **React 19** - Latest React with concurrent features

- **Vite (Rolldown)** - Next-generation build tool- **Vite (Rolldown)** - Next-generation build tool

- **React Router DOM** - Client-side routing- **React Router DOM** - Client-side routing

- **Framer Motion** - Professional animations- **Framer Motion** - Professional animations

- **Lucide React** - Beautiful icon library- **Lucide React** - Beautiful icon library

- **React Hot Toast** - Toast notifications- **React Hot Toast** - Toast notifications



### Backend### Backend

- **Node.js** - JavaScript runtime- **Node.js** - JavaScript runtime

- **Express.js** - Web application framework- **Express.js** - Web application framework

- **MongoDB** - NoSQL database- **MongoDB** - NoSQL database

- **Mongoose** - MongoDB object modeling- **Mongoose** - MongoDB object modeling

- **JWT** - JSON Web Tokens for authentication- **JWT** - JSON Web Tokens for authentication

- **Multer + GridFS** - File upload and storage- **Multer + GridFS** - File upload and storage

- **Sharp** - High-performance image processing- **Sharp** - High-performance image processing

- **bcryptjs** - Password hashing- **bcryptjs** - Password hashing



### Development Tools### Development Tools

- **ESLint** - Code linting and formatting- **ESLint** - Code linting and formatting

- **Nodemon** - Auto-restart development server- **Nodemon** - Auto-restart development server

- **Concurrently** - Run multiple scripts simultaneously- **Concurrently** - Run multiple scripts simultaneously



## 🚀 Quick Start## 🚀 Quick Start



### Prerequisites### Prerequisites

- Node.js (v18+ recommended)- Node.js (v18+ recommended)

- MongoDB (local installation or MongoDB Atlas)- MongoDB (local installation or MongoDB Atlas)

- Git- Git



### Installation### Installation



1. **Clone the repository**1. **Clone the repository**

   ```bash   ```bash

   git clone https://github.com/k-dubey09/myportfolio.git   git clone https://github.com/k-dubey09/myportfolio.git

   cd myportfolio   cd myportfolio

   ```   ```



2. **Install dependencies**2. **Install dependencies**

   ```bash   ```bash

   # Install workspace dependencies   # Install workspace dependencies

   npm install   npm install

      

   # Install backend dependencies   # Install backend dependencies

   cd backend   cd backend

   npm install   npm install

      

   # Install frontend dependencies   # Install frontend dependencies

   cd ../frontend   cd ../frontend

   npm install   npm install

   cd ..   cd ..

   ```   ```



3. **Environment Configuration**3. **Environment Configuration**

      ```bash

   Create a `.env` file in the `backend` directory and configure the following:   # Create environment file

      cd backend

   ```bash   cp .env.example .env

   # Create environment file   

   cd backend   # Edit .env with your configuration

   cp .env.example .env   nano .env

   nano .env   ```

   ```   

      **Configure the following variables:**

   **Required Environment Variables:**   ```bash

   ```bash   # Server Configuration

   # Server Configuration   PORT=5000

   PORT=5000   NODE_ENV=development

   NODE_ENV=development   FRONTEND_URL=http://localhost:5173

   FRONTEND_URL=http://localhost:5173

   # Database - Replace with your MongoDB connection string

   # Database - Replace with your MongoDB connection string   MONGODB_URI=mongodb://localhost:27017/portfolio

   MONGODB_URI=mongodb://localhost:27017/portfolio

   # Authentication - Generate a secure random string

   # Authentication - Use the command below to generate a secure secret   JWT_SECRET=<your-secure-random-jwt-secret>

   JWT_SECRET=<your-secure-random-jwt-secret>

   # Admin User - Set your admin credentials

   # Admin User - Set your own credentials   ADMIN_EMAIL=<your-admin-email>

   ADMIN_EMAIL=<your-admin-email>   ADMIN_PASSWORD=<your-secure-password>

   ADMIN_PASSWORD=<your-secure-password>   ADMIN_NAME=<your-admin-name>

   ADMIN_NAME=<your-admin-name>   ```

   ```

4. **Generate Secure JWT Secret**

4. **Generate Secure JWT Secret**   ```bash

   ```bash   # Generate a secure JWT secret (recommended)

   # Generate a secure JWT secret (recommended)   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"   ```

   ```

   Copy the generated string and use it as your JWT_SECRET.5. **Database Setup**

   ```bash

5. **Database Setup**   # Seed the database with initial data

   ```bash   npm run seed

   # Seed the database with initial data   ```

   npm run seed

   ```6. **Start Development Servers**

   ```bash

6. **Start Development Servers**   # Start both frontend and backend simultaneously

   ```bash   npm run dev

   # Start both frontend and backend simultaneously   ```

   npm run dev

   ```7. **Access the Application**

   - **Portfolio Website**: http://localhost:5173

7. **Access the Application**   - **Admin Panel**: http://localhost:5173/admin

   - **Portfolio Website**: http://localhost:5173   - **API Health Check**: http://localhost:5000/api/health

   - **Admin Panel**: http://localhost:5173/admin

   - **API Health Check**: http://localhost:5000/api/health



## 📁 Project Structure## 📋 Table of Contents## 📋 Table of Contents



```

portfolio/

├── 📂 backend/                    # Node.js Backend API- [Features](#-features)- [Features](#features)

│   ├── 📂 config/

│   │   └── database.js           # MongoDB connection configuration- [Tech Stack](#-tech-stack)- [Tech Stack](#tech-stack)

│   ├── 📂 controllers/           # Route controllers

│   │   ├── authController.js     # Authentication logic- [Quick Start](#-quick-start)- [Quick Start](#quick-start)

│   │   ├── contactInfoController.js

│   │   ├── crudController.js     # Generic CRUD operations- [Project Structure](#-project-structure)- [Project Structure](#project-structure)

│   │   ├── fileController.js     # File upload handling

│   │   ├── imageController.js    # Image processing- [API Documentation](#-api-documentation)- [API Documentation](#api-documentation)

│   │   ├── profileController.js  # Profile management

│   │   └── userController.js     # User management- [Database Models](#-database-models)- [Authentication](#authentication)

│   ├── 📂 middleware/

│   │   └── auth.js               # JWT authentication middleware- [Authentication & Authorization](#-authentication--authorization)- [Testing](#testing)

│   ├── 📂 models/                # MongoDB schemas

│   │   ├── Blog.js               # Blog posts- [Admin Panel](#-admin-panel)- [Development](#development)

│   │   ├── Contact.js            # Contact messages

│   │   ├── ContactInfo.js        # Contact information- [Portfolio Sections](#-portfolio-sections)- [Deployment](#deployment)

│   │   ├── Education.js          # Educational background

│   │   ├── Experience.js         # Work experience- [Development](#-development)

│   │   ├── Gallery.js            # Image gallery

│   │   ├── Profile.js            # Personal profile- [Deployment](#-deployment)## ✨ Features

│   │   ├── Project.js            # Portfolio projects

│   │   ├── Service.js            # Services offered- [Environment Variables](#-environment-variables)

│   │   ├── Skill.js              # Technical skills

│   │   ├── Testimonial.js        # Client testimonials- [Scripts](#-scripts)### 🎨 Frontend Features

│   │   ├── User.js               # User accounts

│   │   └── Vlog.js               # Video blogs- [Contributing](#-contributing)- **Modern React UI** with framer-motion animations

│   ├── 📂 routes/

│   │   ├── fileRoutes.js         # File upload routes- **Responsive Design** that works on all devices

│   │   ├── imageRoutes.js        # Image handling routes

│   │   └── portfolioRoutes.js    # Portfolio API routes## ✨ Features- **Role-based Content** - Different views for admin/editor/viewer

│   ├── 📂 scripts/               # Database utilities

│   │   ├── seedDatabase.js       # Database seeding- **Interactive Portfolio** showcase with smooth transitions

│   │   ├── createAdmin.js        # Admin user creation

│   │   └── migrateEnhancedSchemas.js### 🎨 Frontend Features- **Admin Panel** for content management

│   ├── 📂 uploads/               # File storage directory

│   ├── 📂 utils/                 # Utility functions- **Modern React 19 UI** with Framer Motion animations- **Real-time Notifications** with react-hot-toast

│   │   ├── auth.js               # Authentication utilities

│   │   ├── dataManager.js        # Data management- **Professional Portfolio Design** with responsive layout

│   │   └── fileUpload.js         # File upload utilities

│   ├── .env                      # Environment variables (create this)- **Dynamic Content Loading** from MongoDB database### 🔧 Backend Features

│   ├── server.js                 # Main server file

│   └── package.json              # Backend dependencies- **Interactive Admin Panel** for complete content management- **RESTful API** with Express.js

├── 📂 frontend/                   # React Frontend

│   ├── 📂 public/                # Static assets- **Multi-section Portfolio** (Profile, Projects, Services, Experience, Education, Blogs, Contact)- **MongoDB Integration** with Mongoose ODM

│   ├── 📂 src/

│   │   ├── 📂 components/        # React components- **Contact Form** with email integration- **JWT Authentication** with role-based access control

│   │   │   ├── AdminLogin.jsx    # Admin authentication

│   │   │   ├── ContactsList.jsx  # Contact messages list- **Image Gallery** with professional image handling- **File Upload Support** with GridFS for large files

│   │   │   ├── Login.jsx         # User login

│   │   │   ├── Navigation.jsx    # Navigation component- **User Authentication** with role-based access control- **Rate Limiting** to prevent abuse

│   │   │   ├── PortfolioSite.jsx # Main portfolio component

│   │   │   ├── RegistrationPage.jsx- **Real-time Notifications** with React Hot Toast- **Comprehensive Logging** and error handling

│   │   │   └── UserRegistration.jsx

│   │   ├── 📂 context/- **Responsive Design** optimized for all devices- **API Health Monitoring** endpoint

│   │   │   └── AuthContext.jsx   # Authentication context

│   │   ├── 📂 pages/             # Portfolio section pages

│   │   │   ├── AchievementsPage.jsx

│   │   │   ├── BlogsPage.jsx### 🔧 Backend Features### 🛡️ Security Features

│   │   │   ├── CertificationsPage.jsx

│   │   │   ├── EducationPage.jsx- **RESTful API** with Express.js- **Password Hashing** with bcryptjs

│   │   │   ├── ExperiencePage.jsx

│   │   │   ├── GalleryPage.jsx- **MongoDB Integration** with Mongoose ODM- **JWT Token Security** with configurable expiration

│   │   │   ├── ProjectsPage.jsx

│   │   │   ├── ServicesPage.jsx- **JWT Authentication** with secure token management- **CORS Protection** with specific origin allowlist

│   │   │   ├── SkillsPage.jsx

│   │   │   ├── StatisticsPage.jsx- **File Upload System** with GridFS and Sharp image processing- **Rate Limiting** on sensitive endpoints

│   │   │   ├── TestimonialsPage.jsx

│   │   │   └── VlogsPage.jsx- **Rate Limiting** on sensitive endpoints- **Environment Variables** for sensitive configuration

│   │   ├── 📂 assets/            # Images, fonts, etc.

│   │   ├── App.jsx               # Main App component- **CORS Configuration** for secure cross-origin requests

│   │   ├── App.css               # Global styles

│   │   ├── index.css             # Base styles- **Comprehensive Error Handling** with detailed logging## 🛠️ Tech Stack

│   │   └── main.jsx              # Entry point

│   ├── 📂 Admin/                 # Admin Panel- **Health Monitoring** endpoints

│   │   ├── AdminPanel.jsx        # Main admin interface

│   │   └── AdminPanel.css        # Admin panel styling- **Database Seeding** scripts for quick setup### Frontend

│   ├── eslint.config.js          # ESLint configuration

│   ├── vite.config.js            # Vite build configuration- **React 18** - Modern React with hooks

│   └── package.json              # Frontend dependencies

├── .gitignore                    # Git ignore rules### 🛡️ Security Features- **Vite** - Fast build tool and dev server

├── package.json                  # Workspace configuration

└── README.md                     # This documentation- **Password Hashing** with bcryptjs- **React Router** - Client-side routing

```

- **JWT Token Security** with configurable expiration- **Framer Motion** - Smooth animations

## 🔌 API Documentation

- **Role-based Access Control** (Admin, Editor, Viewer)- **React Hot Toast** - Beautiful notifications

### Base URL

- **Development**: `http://localhost:5000/api`- **Protected Routes** with middleware authentication

- **Production**: `https://your-domain.com/api`

- **Input Validation** and sanitization### Backend

### Authentication Endpoints

- **Rate Limiting** to prevent abuse- **Node.js** - JavaScript runtime

#### POST `/auth/login`

User authentication with email and password.- **Express.js** - Web application framework



**Request:**## 🛠️ Tech Stack- **MongoDB** - NoSQL database

```json

{- **Mongoose** - MongoDB object modeling

  "email": "<your-email>",

  "password": "<your-password>"### Frontend- **JWT** - JSON Web Tokens for authentication

}

```- **React 19** - Latest React with concurrent features- **Multer + GridFS** - File upload handling



**Response:**- **Vite (Rolldown)** - Next-generation build tool

```json

{- **React Router DOM** - Client-side routing### Development Tools

  "success": true,

  "message": "Login successful",- **Framer Motion** - Professional animations- **Nodemon** - Auto-restart development server

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  "user": {- **Lucide React** - Beautiful icon library- **ESLint** - Code linting

    "id": "...",

    "email": "<your-email>",- **React Hot Toast** - Toast notifications- **Concurrently** - Run multiple scripts simultaneously

    "name": "<your-name>",

    "role": "admin"

  }

}### Backend## 🚀 Quick Start

```

- **Node.js** - JavaScript runtime

#### POST `/auth/register`

Register new user (admin only).- **Express.js** - Web application framework### Prerequisites



#### GET `/auth/profile`- **MongoDB** - NoSQL database- Node.js (v18+ recommended)

Get current user profile (requires authentication).

- **Mongoose** - MongoDB object modeling- MongoDB (local or Atlas)

### Portfolio Endpoints

- **JWT** - JSON Web Tokens for authentication- Git

#### GET `/profile`

Get portfolio owner's profile information.- **Multer + GridFS** - File upload and storage



#### GET `/projects`- **Sharp** - High-performance image processing### Installation

Get all portfolio projects.

- **bcryptjs** - Password hashing

#### GET `/services`

Get all services offered.1. **Clone the repository**



#### GET `/experiences`### Development Tools   ```bash

Get work experience data.

- **ESLint** - Code linting and formatting   git clone <repository-url>

#### GET `/education`

Get educational background.- **Nodemon** - Auto-restart development server   cd portfolio



#### GET `/blogs`- **Concurrently** - Run multiple scripts simultaneously   ```

Get blog posts.



#### GET `/contact-info`

Get contact information.## 🚀 Quick Start2. **Install dependencies**



#### POST `/contact`   ```bash

Submit contact form message.

### Prerequisites   # Install root workspace dependencies

### Admin Endpoints (Protected)

- Node.js (v18+ recommended)   npm install

#### GET `/admin/dashboard`

Get admin dashboard data.- MongoDB (local installation or MongoDB Atlas)   



#### POST `/admin/profile`- Git   # Install backend dependencies

Update profile information.

   cd backend

#### POST `/admin/projects`

Create new project.### Installation   npm install



#### PUT `/admin/projects/:id`   

Update existing project.

1. **Clone the repository**   # Install frontend dependencies

#### DELETE `/admin/projects/:id`

Delete project.   ```bash   cd ../frontend



### File Upload Endpoints   git clone https://github.com/k-dubey09/myportfolio.git   npm install



#### POST `/upload/image`   cd myportfolio   ```

Upload and process images.

   ```

#### POST `/upload/file`

Upload files to GridFS storage.3. **Environment Setup**



### Health Check2. **Install dependencies**   ```bash



#### GET `/health`   ```bash   # Copy example environment file

Server health status and database connectivity.

   # Install workspace dependencies   cd backend

## 🗄️ Database Models

   npm install   cp .env.example .env

### Core Models

      

#### **Profile**

```javascript   # Install backend dependencies   # Edit .env with your configuration

{

  name: String,   cd backend   nano .env

  title: String,

  bio: String,   npm install   ```

  email: String,

  phone: String,   

  location: String,

  profileImage: String,   # Install frontend dependencies4. **Database Setup**

  socialLinks: {

    linkedin: String,   cd ../frontend   ```bash

    github: String,

    twitter: String,   npm install   # Seed the database with sample data

    website: String

  }   cd ..   cd backend

}

```   ```   npm run seed



#### **Project**   ```

```javascript

{3. **Environment Configuration**

  title: String,

  description: String,   Create a `.env` file in the `backend` directory:5. **Start Development Servers**

  technologies: [String],

  liveUrl: String,   ```env   ```bash

  githubUrl: String,

  imageUrl: String,   # Server Configuration   # Start both frontend and backend (from root directory)

  category: String,

  featured: Boolean,   PORT=5000   npm run dev

  createdAt: Date

}   NODE_ENV=development   

```

   FRONTEND_URL=http://localhost:5173   # OR start individually

#### **Experience**

```javascript   npm run dev:backend    # Backend only

{

  company: String,   # Database   npm run dev:frontend   # Frontend only

  position: String,

  startDate: Date,   MONGODB_URI=mongodb://localhost:27017/portfolio   ```

  endDate: Date,

  current: Boolean,

  description: String,

  technologies: [String],   # Authentication## 📁 Project Structure

  location: String

}   JWT_SECRET=your-super-secret-jwt-key-here

```

```

#### **Education**

```javascript   # Admin User (for initial setup)portfolio/

{

  institution: String,   ADMIN_EMAIL=admin@portfolio.com├── backend/                 # Node.js backend API

  degree: String,

  field: String,   ADMIN_PASSWORD=admin123│   ├── config/             # Database and configuration

  startDate: Date,

  endDate: Date,   ADMIN_NAME=Portfolio Admin│   ├── controllers/        # Route controllers

  gpa: Number,

  description: String   ```│   ├── middleware/         # Custom middleware

}

```│   ├── models/            # MongoDB models



## 🔐 Authentication & Authorization4. **Database Setup**│   ├── routes/            # API routes (if using separate routing)



### User Roles   ```bash│   ├── scripts/           # Database seeding scripts



#### **Admin**   # Seed the database with initial data│   ├── test/              # API tests

- Full system access

- User management   npm run seed│   ├── uploads/           # File upload directory

- Content creation, editing, deletion

- File uploads and management   ```│   ├── utils/             # Utility functions

- System configuration

│   ├── .env               # Environment variables

#### **Editor**

- Content creation and editing5. **Start Development Servers**│   ├── .env.example       # Environment template

- File uploads

- Limited user management   ```bash│   ├── server.js          # Main server file



#### **Viewer**   # Start both frontend and backend simultaneously│   └── package.json       # Backend dependencies

- Read-only access

- Cannot modify content   npm run dev├── frontend/              # React frontend



### Initial Admin Setup   ```│   ├── public/            # Static assets



After configuring your environment variables and running the seeding script, you can access the admin panel with your configured credentials.│   ├── src/               # Source code



**To create admin user manually:**6. **Access the Application**│   │   ├── components/    # React components

```bash

cd backend   - **Portfolio Website**: http://localhost:5173│   │   ├── context/       # React context providers

node scripts/createAdmin.js

```   - **Admin Panel**: http://localhost:5173/admin│   │   ├── assets/        # Images, fonts, etc.



### Security Commands   - **API Health Check**: http://localhost:5000/api/health│   │   ├── App.jsx        # Main App component



#### Generate Strong JWT Secret│   │   └── main.jsx       # Entry point

```bash

# Generate a 64-byte random hex string for JWT secret## 📁 Project Structure│   ├── Admin/             # Admin panel components

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

```│   └── package.json       # Frontend dependencies



#### Create Strong Password```├── package.json           # Root workspace configuration

```bash

# Generate a strong passwordportfolio/└── README.md              # This file

node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"

```├── 📂 backend/                    # Node.js Backend API```



### JWT Configuration│   ├── 📂 config/

- **Expiration**: 7 days (configurable)

- **Algorithm**: HS256│   │   └── database.js           # MongoDB connection configuration## 🔌 API Documentation

- **Secret**: Set via environment variables

│   ├── 📂 controllers/           # Route controllers

## 🎛️ Admin Panel

│   │   ├── authController.js     # Authentication logic### Base URL

The comprehensive admin panel provides full control over portfolio content:

│   │   ├── contactInfoController.js- Development: `http://localhost:5000/api`

### Features

- **Dashboard** with analytics and quick stats│   │   ├── crudController.js     # Generic CRUD operations- Production: `https://your-domain.com/api`

- **Profile Management** - Update personal information and images

- **Project Management** - Add, edit, delete projects with image uploads│   │   ├── fileController.js     # File upload handling

- **Service Management** - Manage services offered

- **Experience Management** - Work history and career timeline│   │   ├── imageController.js    # Image processing### Authentication Endpoints

- **Education Management** - Academic background

- **Blog Management** - Create and manage blog posts│   │   ├── profileController.js  # Profile management

- **Contact Management** - View and respond to contact messages

- **User Management** - Admin user controls│   │   └── userController.js     # User management#### POST `/auth/login`

- **File Management** - Upload and organize media files

│   ├── 📂 middleware/Login with email and password.

### Access

- Navigate to `/admin` on the frontend│   │   └── auth.js               # JWT authentication middleware

- Login with your configured admin credentials

- Full CRUD operations on all content types│   ├── 📂 models/                # MongoDB schemas**Request Body:**



## 🏠 Portfolio Sections│   │   ├── Blog.js               # Blog posts```json



### Main Sections│   │   ├── Contact.js            # Contact messages{



1. **Hero/Profile Section**│   │   ├── ContactInfo.js        # Contact information  "email": "admin@portfolio.com",

   - Personal introduction

   - Professional title│   │   ├── Education.js          # Educational background  "password": "admin123"

   - Profile image

   - Contact information│   │   ├── Experience.js         # Work experience}

   - Social links

│   │   ├── Gallery.js            # Image gallery```

2. **About Section**

   - Detailed biography│   │   ├── Profile.js            # Personal profile

   - Skills showcase

   - Professional summary│   │   ├── Project.js            # Portfolio projects**Response:**



3. **Services Section**│   │   ├── Service.js            # Services offered```json

   - Services offered

   - Pricing information│   │   ├── Skill.js              # Technical skills{

   - Service descriptions

│   │   ├── Testimonial.js        # Client testimonials  "message": "Login successful",

4. **Projects Section**

   - Portfolio projects│   │   ├── User.js               # User accounts  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

   - Live demos and GitHub links

   - Technology stacks│   │   └── Vlog.js               # Video blogs  "user": {

   - Project categories

│   ├── 📂 routes/    "id": "...",

5. **Experience Section**

   - Work history│   │   ├── fileRoutes.js         # File upload routes    "email": "admin@portfolio.com",

   - Company details

   - Role descriptions│   │   ├── imageRoutes.js        # Image handling routes    "name": "Admin User",

   - Career timeline

│   │   └── portfolioRoutes.js    # Portfolio API routes    "role": "admin",

6. **Education Section**

   - Academic background│   ├── 📂 scripts/               # Database utilities    "permissions": ["canCreatePosts", "canEditPosts", "canDeletePosts", "canUploadFiles", "canManageUsers"]

   - Certifications

   - Achievements│   │   ├── seedDatabase.js       # Database seeding  }



7. **Blog Section**│   │   ├── createAdmin.js        # Admin user creation}

   - Technical articles

   - Industry insights│   │   └── migrateEnhancedSchemas.js```

   - Personal thoughts

│   ├── 📂 uploads/               # File storage directory

8. **Contact Section**

   - Contact form│   ├── 📂 utils/                 # Utility functions#### POST `/auth/register`

   - Contact information

   - Location details│   │   ├── auth.js               # Authentication utilitiesRegister a new user (admin only).

   - Social media links

│   │   ├── dataManager.js        # Data management

## 💻 Development

│   │   └── fileUpload.js         # File upload utilities#### GET `/auth/profile`

### Available Scripts

│   ├── .env                      # Environment variablesGet current user profile (requires authentication).

#### **Root Directory**

```bash│   ├── server.js                 # Main server file

npm run dev          # Start both frontend and backend

npm run dev:backend  # Start backend only│   └── package.json              # Backend dependencies### Public Endpoints

npm run dev:frontend # Start frontend only

npm run build        # Build frontend for production├── 📂 frontend/                   # React Frontend

npm run test         # Run backend tests

npm run seed         # Seed database with sample data│   ├── 📂 public/                # Static assets#### GET `/profile`

```

│   ├── 📂 src/Get portfolio owner's profile information.

#### **Backend Directory**

```bash│   │   ├── 📂 components/        # React components

npm run start        # Start production server

npm run dev          # Start development server with nodemon│   │   │   ├── AdminLogin.jsx    # Admin authentication#### GET `/projects`

npm run seed         # Seed database with sample data

npm run test         # Run API tests│   │   │   ├── ContactsList.jsx  # Contact messages listGet all public projects.

```

│   │   │   ├── Login.jsx         # User login

#### **Frontend Directory**

```bash│   │   │   ├── Navigation.jsx    # Navigation component#### GET `/skills`

npm run dev          # Start development server (Vite)

npm run build        # Build for production│   │   │   ├── PortfolioSite.jsx # Main portfolio componentGet all skills.

npm run preview      # Preview production build

npm run lint         # Run ESLint│   │   │   ├── RegistrationPage.jsx

```

│   │   │   └── UserRegistration.jsx#### GET `/portfolio`

### Development Workflow

│   │   ├── 📂 context/Get complete portfolio data (profile, projects, skills).

1. **Setup Environment**

   ```bash│   │   │   └── AuthContext.jsx   # Authentication context

   # Clone and install

   git clone <repository-url>│   │   ├── 📂 pages/             # Portfolio section pages### Protected Endpoints

   cd portfolio

   npm install│   │   │   ├── AchievementsPage.jsx

   cd backend && npm install

   cd ../frontend && npm install│   │   │   ├── BlogsPage.jsx#### GET `/admin/*`

   ```

│   │   │   ├── CertificationsPage.jsxAdmin-only endpoints (requires admin role).

2. **Configure Environment**

   ```bash│   │   │   ├── EducationPage.jsx

   cd backend

   cp .env.example .env│   │   │   ├── ExperiencePage.jsx#### POST `/admin/*`

   # Edit .env with your secure configuration

   ```│   │   │   ├── GalleryPage.jsxAdmin creation endpoints (requires appropriate permissions).



3. **Generate Secure Credentials**│   │   │   ├── ProjectsPage.jsx

   ```bash

   # Generate JWT secret│   │   │   ├── ServicesPage.jsx### Health Check

   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

   ```│   │   │   ├── SkillsPage.jsx



4. **Seed Database**│   │   │   ├── StatisticsPage.jsx#### GET `/health`

   ```bash

   npm run seed│   │   │   ├── TestimonialsPage.jsxServer health status.

   ```

│   │   │   └── VlogsPage.jsx

5. **Start Development**

   ```bash│   │   ├── 📂 assets/            # Images, fonts, etc.**Response:**

   npm run dev

   ```│   │   ├── App.jsx               # Main App component```json



### Code Style Guidelines│   │   ├── App.css               # Global styles{



- **ESLint**: Follow configured rules│   │   ├── index.css             # Base styles  "status": "OK",

- **Commits**: Use conventional commit messages

- **Testing**: Write tests for new API endpoints│   │   └── main.jsx              # Entry point  "timestamp": "2025-10-06T09:01:05.248Z",

- **Security**: Never commit sensitive data

│   ├── 📂 Admin/                 # Admin Panel  "environment": "development",

## 🚀 Deployment

│   │   ├── AdminPanel.jsx        # Main admin interface  "database": "connected"

### Backend Deployment

│   │   └── AdminPanel.css        # Admin panel styling}

1. **Environment Setup**

   ```bash│   ├── eslint.config.js          # ESLint configuration```

   # Production environment variables

   NODE_ENV=production│   ├── vite.config.js            # Vite build configuration

   MONGODB_URI=<your-production-mongodb-uri>

   JWT_SECRET=<your-secure-production-secret>│   └── package.json              # Frontend dependencies## 🔐 Authentication

   ```

├── .gitignore                    # Git ignore rules

2. **Build and Deploy**

   ```bash├── package.json                  # Workspace configuration### Default Admin Credentials

   cd backend

   npm install --production└── README.md                     # This documentation- **Email:** `admin@portfolio.com`

   npm start

   ``````- **Password:** `admin123`



### Frontend Deployment



1. **Build for Production**## 🔌 API Documentation⚠️ **Important:** Change the default admin password after first login!

   ```bash

   cd frontend

   npm run build

   ```### Base URL### User Roles



2. **Deploy Built Files**- **Development**: `http://localhost:5000/api`

   - Deploy contents of `frontend/dist` directory

   - Configure web server to serve static files- **Production**: `https://your-domain.com/api`#### Admin

   - Set up proper routing for SPA

- Full access to all features

### Production Considerations

### Authentication Endpoints- User management

- **HTTPS**: Use SSL/TLS certificates

- **Environment Variables**: Secure configuration- Content creation, editing, and deletion

- **Database**: Use MongoDB Atlas or secured instance

- **Monitoring**: Implement logging and health checks#### POST `/auth/login`- File uploads

- **Backup**: Regular database backups

- **CDN**: Use CDN for static assetsUser authentication with email and password.



## 🔧 Environment Configuration#### Editor



### Backend (.env)**Request:**- Content creation and editing

```bash

# Server Configuration```json- File uploads

PORT=5000

NODE_ENV=development{- Limited user management

FRONTEND_URL=http://localhost:5173

  "email": "admin@portfolio.com",

# Database - Replace with your MongoDB connection string

MONGODB_URI=mongodb://localhost:27017/portfolio  "password": "admin123"#### Viewer



# Authentication - Generate using crypto.randomBytes(64).toString('hex')}- Read-only access

JWT_SECRET=<generate-secure-random-string>

```- Cannot modify content

# Admin User - Set your own secure credentials

ADMIN_EMAIL=<your-admin-email>

ADMIN_PASSWORD=<your-secure-password>

ADMIN_NAME=<your-admin-name>**Response:**### JWT Configuration



# File Upload```json- **Expiration:** 7 days (configurable in .env)

MAX_FILE_SIZE=5000000

UPLOAD_PATH=uploads/{- **Algorithm:** HS256



# Email (optional - if using email services)  "success": true,- **Secret:** Set in JWT_SECRET environment variable

EMAIL_HOST=smtp.example.com

EMAIL_PORT=587  "message": "Login successful",

EMAIL_USER=<your-email@example.com>

EMAIL_PASS=<your-email-password>  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",## 🧪 Testing

```

  "user": {

### Security Commands

    "id": "...",### Backend API Tests

#### Generate Secure JWT Secret

```bash    "email": "admin@portfolio.com",```bash

# Use this command to generate a secure 64-byte hex string

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"    "name": "Portfolio Admin",cd backend

```

    "role": "admin"npm run test

#### Generate Strong Password

```bash  }```

# Generate a strong random password

node -e "console.log(require('crypto').randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + '!' + Math.floor(Math.random() * 100))"}

```

```### Manual Testing

#### Check Environment Configuration

```bash1. **API Test Page:** `http://localhost:5000/test-page`

# Verify your environment setup

node -e "require('dotenv').config(); console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 'NOT SET'); console.log('MongoDB URI set:', !!process.env.MONGODB_URI); console.log('Admin email set:', !!process.env.ADMIN_EMAIL);"#### POST `/auth/register`2. **Health Check:** `http://localhost:5000/api/health`

```

Register new user (admin only).3. **Frontend:** `http://localhost:5173`

### Security Best Practices



1. **Strong Passwords**

   - Use a combination of uppercase, lowercase, numbers, and symbols#### GET `/auth/profile`### Test Coverage

   - Minimum 12 characters

   - Never use default passwords in productionGet current user profile (requires authentication).The test suite covers:



2. **Secure Secrets**- ✅ Server health check

   - Use crypto.randomBytes for JWT secrets

   - Never commit `.env` files to version control### Portfolio Endpoints- ✅ Public API endpoints

   - Use different secrets for development and production

   - Regularly rotate JWT secrets and passwords- ✅ Authentication flow



3. **Environment Security**#### GET `/profile`- ✅ Protected routes

   - Set NODE_ENV=production in production

   - Use HTTPS in productionGet portfolio owner's profile information.- ✅ Database connectivity

   - Configure proper CORS origins

   - Implement proper logging and monitoring



## 📜 Scripts#### GET `/projects`## 💻 Development



### Database ScriptsGet all portfolio projects.

```bash

# Seed database with initial data### Available Scripts

node scripts/seedDatabase.js

#### GET `/services`

# Create admin user manually

node scripts/createAdmin.jsGet all services offered.#### Root Directory



# Migrate database schemas```bash

node scripts/migrateEnhancedSchemas.js

```#### GET `/experiences`npm run dev          # Start both frontend and backend



### Utility ScriptsGet work experience data.npm run dev:backend  # Start backend only

```bash

# Reset profile datanpm run dev:frontend # Start frontend only

node scripts/cleanupAndResetProfile.js

#### GET `/education`npm run build        # Build frontend for production

# Validate profile records

node scripts/checkProfileRecords.jsGet educational background.npm run test         # Run backend tests



# Test contact info functionalitynpm run seed         # Seed database with sample data

node scripts/testContactInfoSingleRecord.js

```#### GET `/blogs````



### Development ScriptsGet blog posts.

```bash

# Check for security issues#### Backend Directory

npm audit

#### GET `/contact-info````bash

# Fix security vulnerabilities

npm audit fixGet contact information.npm run dev    # Start development server with nodemon



# Update dependenciesnpm run start  # Start production server

npm update

```#### POST `/contact`npm run seed   # Seed database



## 🤝 ContributingSubmit contact form message.npm run test   # Run API tests



1. **Fork the repository**```

2. **Create feature branch**

   ```bash### Admin Endpoints (Protected)

   git checkout -b feature/amazing-feature

   ```#### Frontend Directory

3. **Make changes and commit**

   ```bash#### GET `/admin/dashboard````bash

   git commit -m 'Add amazing feature'

   ```Get admin dashboard data.npm run dev    # Start development server

4. **Push to branch**

   ```bashnpm run build  # Build for production

   git push origin feature/amazing-feature

   ```#### POST `/admin/profile`npm run preview # Preview production build

5. **Open Pull Request**

Update profile information.```

### Development Guidelines

- Follow existing code style

- Write clear commit messages

- Add tests for new features#### POST `/admin/projects`### Environment Variables

- Update documentation as needed

- Never commit sensitive informationCreate new project.



## 📄 License#### Backend (.env)



This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.#### PUT `/admin/projects/:id````env



## 🆘 Support & TroubleshootingUpdate existing project.# Server Configuration



### Common IssuesPORT=5000



1. **Port already in use**#### DELETE `/admin/projects/:id`NODE_ENV=development

   ```bash

   # Kill existing processesDelete project.FRONTEND_URL=http://localhost:5173

   npx kill-port 5000

   npx kill-port 5173

   ```

### File Upload Endpoints# Database

2. **MongoDB connection issues**

   ```bashMONGODB_URI=mongodb://localhost:27017/my-portfolio

   # Check if MongoDB is running

   mongosh --eval "db.adminCommand('ping')"#### POST `/upload/image`

   

   # Check connection string formatUpload and process images.# Authentication

   echo $MONGODB_URI

   ```JWT_SECRET=your-super-secret-jwt-key



3. **Authentication issues**#### POST `/upload/file`

   ```bash

   # Check JWT secret length (should be 128 characters for 64-byte hex)Upload files to GridFS storage.# Admin User (for seeding)

   node -e "console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length)"

   ADMIN_EMAIL=admin@portfolio.com

   # Verify admin credentials are set

   node -e "require('dotenv').config(); console.log('Admin email:', !!process.env.ADMIN_EMAIL);"### Health CheckADMIN_PASSWORD=admin123

   ```

ADMIN_NAME=Admin User

4. **File upload issues**

   ```bash#### GET `/health````

   # Check upload directory permissions

   ls -la backend/uploads/Server health status and database connectivity.

   

   # Verify Sharp installation### Development Guidelines

   npm list sharp

   ```## 🗄️ Database Models



5. **Build issues**1. **Code Style:** Follow ESLint configuration

   ```bash

   # Clear node_modules and reinstall### Core Models2. **Commits:** Use conventional commit messages

   rm -rf node_modules package-lock.json

   npm install3. **Testing:** Write tests for new API endpoints

   ```

#### **Profile**4. **Security:** Never commit sensitive data to version control

### Health Check Commands

```javascript

```bash

# Check API health{## 🚀 Deployment

curl http://localhost:5000/api/health

  name: String,

# Check if MongoDB is accessible

mongosh $MONGODB_URI --eval "db.adminCommand('ping')"  title: String,### Backend Deployment



# Check if ports are available  bio: String,

netstat -ano | findstr :5000

netstat -ano | findstr :5173  email: String,1. **Environment Setup**



# Test environment variables  phone: String,   - Set production environment variables

node -e "require('dotenv').config(); console.log('Config check passed:', !!process.env.JWT_SECRET && !!process.env.MONGODB_URI);"

```  location: String,   - Use MongoDB Atlas for database



### Environment Validation  profileImage: String,   - Configure proper JWT secret



```bash  socialLinks: {

# Validate all required environment variables

cd backend    linkedin: String,2. **Build & Deploy**

node -e "

require('dotenv').config();    github: String,   ```bash

const required = ['JWT_SECRET', 'MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

const missing = required.filter(key => !process.env[key]);    twitter: String,   npm run start

if (missing.length) {

  console.error('Missing required environment variables:', missing);    website: String   ```

  process.exit(1);

} else {  }

  console.log('✅ All required environment variables are set');

  console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);}### Frontend Deployment

  console.log('MongoDB URI format:', process.env.MONGODB_URI.startsWith('mongodb'));

}```

"

```1. **Build for Production**



### Getting Help#### **Project**   ```bash

- Check [Issues](../../issues) page

- Review API documentation```javascript   cd frontend

- Test endpoints with health check

- Validate environment configuration{   npm run build



---  title: String,   ```



## 🎯 Project Highlights  description: String,



✅ **Full-stack Architecture** - Complete MERN stack implementation    technologies: [String],2. **Deploy** built files from `frontend/dist` directory

✅ **Professional Design** - Modern UI/UX with animations  

✅ **Admin Panel** - Comprehensive content management    liveUrl: String,

✅ **Database Integration** - MongoDB with proper schema design  

✅ **Authentication** - Secure JWT-based auth system    githubUrl: String,### Production Considerations

✅ **File Management** - Image upload and processing  

✅ **Responsive Design** - Mobile-first approach    imageUrl: String,

✅ **SEO Ready** - Optimized for search engines  

✅ **Production Ready** - Deployment-ready configuration    category: String,- Use HTTPS in production

✅ **Security Focused** - Best practices implemented  

  featured: Boolean,- Set secure CORS origins

---

  createdAt: Date- Implement proper logging

**🎉 Happy coding! Your professional portfolio is ready to showcase your amazing work.**

}- Set up monitoring and health checks

**🔒 Remember**: Always use secure credentials and never commit sensitive information to version control.

```- Use environment-specific configurations

---

- Implement database backups

*Built with ❤️ using React, Node.js, and MongoDB*
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