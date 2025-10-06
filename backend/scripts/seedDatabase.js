import dotenv from 'dotenv';
import database from '../config/database.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Experience from '../models/Experience.js';
import Education from '../models/Education.js';
import Blog from '../models/Blog.js';
import Vlog from '../models/Vlog.js';
import Gallery from '../models/Gallery.js';
import Testimonial from '../models/Testimonial.js';
import Service from '../models/Service.js';

// Load environment variables
dotenv.config();

const sampleData = {
  profile: {
    name: "John Doe",
    title: "Full Stack Developer",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Passionate full-stack developer with 5+ years of experience building scalable web applications. I love creating innovative solutions and working with cutting-edge technologies.",
    profilePicture: "/uploads/profile-picture.jpg",
    socialLinks: {
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      twitter: "https://twitter.com/johndoe",
      instagram: "https://instagram.com/johndoe",
      youtube: "https://youtube.com/c/johndoe"
    },
    professionalContacts: {
      github: "https://github.com/johndoe",
      gitlab: "https://gitlab.com/johndoe",
      stackoverflow: "https://stackoverflow.com/users/12345/johndoe",
      leetcode: "https://leetcode.com/johndoe",
      codepen: "https://codepen.io/johndoe",
      behance: "https://behance.net/johndoe",
      dribbble: "https://dribbble.com/johndoe",
      medium: "https://medium.com/@johndoe",
      devto: "https://dev.to/johndoe",
      website: "https://johndoe.dev",
      portfolio: "https://portfolio.johndoe.dev",
      blog: "https://blog.johndoe.dev",
      resume: "https://johndoe.dev/resume.pdf"
    },
    resume: "/uploads/john-doe-resume.pdf"
  },

  services: [
    {
      title: "Full Stack Web Development",
      description: "Complete web application development from frontend to backend using modern technologies like React, Node.js, and MongoDB.",
      icon: "🌐",
      price: "5000",
      duration: "4-8 weeks",
      featured: true,
      category: "Development",
      features: [
        "Responsive Design",
        "Database Integration",
        "User Authentication",
        "Payment Integration",
        "Admin Dashboard",
        "SEO Optimization"
      ],
      isActive: true
    },
    {
      title: "Frontend Development",
      description: "Beautiful, responsive, and interactive user interfaces using React, Vue.js, or Angular with modern CSS frameworks.",
      icon: "🎨",
      price: "3000",
      duration: "2-4 weeks",
      featured: true,
      category: "Development",
      features: [
        "Responsive Design",
        "Component-based Architecture",
        "State Management",
        "Performance Optimization",
        "Cross-browser Compatibility"
      ],
      isActive: true
    },
    {
      title: "Backend API Development",
      description: "Robust and scalable REST APIs with Node.js, Express, and database integration for your applications.",
      icon: "⚙️",
      price: "2500",
      duration: "2-3 weeks",
      featured: true,
      category: "Development",
      features: [
        "RESTful API Design",
        "Database Integration",
        "Authentication & Authorization",
        "Data Validation",
        "API Documentation",
        "Performance Optimization"
      ],
      isActive: true
    },
    {
      title: "E-commerce Solutions",
      description: "Complete e-commerce platforms with shopping carts, payment processing, inventory management, and admin panels.",
      icon: "🛒",
      price: "8000",
      duration: "6-10 weeks",
      featured: true,
      category: "E-commerce",
      features: [
        "Product Catalog",
        "Shopping Cart",
        "Payment Gateway Integration",
        "Order Management",
        "Inventory Tracking",
        "Admin Dashboard",
        "Customer Portal",
        "Analytics & Reporting"
      ],
      isActive: true
    },
    {
      title: "Database Design & Optimization",
      description: "Professional database design, optimization, and migration services for MongoDB, MySQL, and PostgreSQL.",
      icon: "🗄️",
      price: "1500",
      duration: "1-2 weeks",
      featured: false,
      category: "Database",
      features: [
        "Schema Design",
        "Query Optimization",
        "Index Strategies",
        "Data Migration",
        "Backup Solutions",
        "Performance Tuning"
      ],
      isActive: true
    },
    {
      title: "Mobile App Development",
      description: "Cross-platform mobile applications using React Native for iOS and Android platforms.",
      icon: "📱",
      price: "6000",
      duration: "6-8 weeks",
      featured: false,
      category: "Mobile",
      features: [
        "Cross-platform Development",
        "Native Performance",
        "Push Notifications",
        "Offline Capability",
        "App Store Deployment",
        "Backend Integration"
      ],
      isActive: true
    },
    {
      title: "Technical Consultation",
      description: "Expert technical consultation for architecture decisions, technology stack selection, and project planning.",
      icon: "💡",
      price: "150",
      duration: "Per hour",
      featured: false,
      category: "Consultation",
      features: [
        "Architecture Review",
        "Technology Assessment",
        "Performance Analysis",
        "Security Audit",
        "Code Review",
        "Best Practices Guidance"
      ],
      isActive: true
    },
    {
      title: "DevOps & Deployment",
      description: "CI/CD pipeline setup, cloud deployment, and infrastructure management using AWS, Docker, and Kubernetes.",
      icon: "🚀",
      price: "2000",
      duration: "1-3 weeks",
      featured: false,
      category: "DevOps",
      features: [
        "CI/CD Pipeline Setup",
        "Cloud Deployment",
        "Container Orchestration",
        "Monitoring & Logging",
        "Security Configuration",
        "Automated Testing"
      ],
      isActive: true
    }
  ],

  skills: [
    { name: "JavaScript", category: "Programming Languages", level: "Expert", percentage: 95, icon: "js", description: "Expert in ES6+, async/await, and modern JS frameworks" },
    { name: "React", category: "Frontend Frameworks", level: "Expert", percentage: 90, icon: "react", description: "Building complex SPAs with hooks, context, and state management" },
    { name: "Node.js", category: "Backend Technologies", level: "Advanced", percentage: 88, icon: "nodejs", description: "RESTful APIs, microservices, and server-side development" },
    { name: "MongoDB", category: "Databases", level: "Advanced", percentage: 85, icon: "mongodb", description: "NoSQL database design, aggregation pipelines, and optimization" },
    { name: "TypeScript", category: "Programming Languages", level: "Advanced", percentage: 82, icon: "typescript", description: "Type-safe development for large-scale applications" },
    { name: "Docker", category: "DevOps", level: "Intermediate", percentage: 78, icon: "docker", description: "Containerization and deployment automation" },
    { name: "AWS", category: "Cloud Platforms", level: "Intermediate", percentage: 75, icon: "aws", description: "EC2, S3, Lambda, and cloud architecture" },
    { name: "GraphQL", category: "APIs", level: "Advanced", percentage: 80, icon: "graphql", description: "Schema design and efficient data fetching" }
  ],

  projects: [
    {
      title: "E-commerce Platform",
      description: "Full-stack e-commerce solution with React, Node.js, and MongoDB",
      longDescription: "A comprehensive e-commerce platform featuring user authentication, product catalog, shopping cart, payment integration, order management, and admin dashboard. Built with modern technologies and best practices.",
      technologies: ["React", "Node.js", "MongoDB", "Stripe", "JWT", "Redux"],
      images: ["/uploads/ecommerce-1.jpg", "/uploads/ecommerce-2.jpg"],
      liveUrl: "https://ecommerce-demo.johndoe.dev",
      githubUrl: "https://github.com/johndoe/ecommerce-platform",
      category: "Web Development",
      featured: true,
      status: "Completed",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-04-30"),
      challenges: "Implementing real-time inventory management and handling concurrent orders",
      solutions: "Used MongoDB transactions and Redis for caching to ensure data consistency"
    },
    {
      title: "Task Management App",
      description: "Collaborative task management application with real-time updates",
      longDescription: "A Trello-like task management application with drag-and-drop functionality, real-time collaboration, team management, and progress tracking.",
      technologies: ["Vue.js", "Express.js", "Socket.io", "PostgreSQL", "JWT"],
      images: ["/uploads/taskapp-1.jpg"],
      liveUrl: "https://taskmanager.johndoe.dev",
      githubUrl: "https://github.com/johndoe/task-manager",
      category: "Web Development",
      featured: true,
      status: "Completed",
      startDate: new Date("2023-08-01"),
      endDate: new Date("2023-11-15")
    },
    {
      title: "Weather Dashboard",
      description: "React-based weather dashboard with beautiful UI and animations",
      longDescription: "An elegant weather dashboard that provides detailed weather information, forecasts, and interactive maps with smooth animations and responsive design.",
      technologies: ["React", "OpenWeather API", "Chart.js", "CSS3", "Framer Motion"],
      images: ["/uploads/weather-1.jpg"],
      liveUrl: "https://weather.johndoe.dev",
      githubUrl: "https://github.com/johndoe/weather-dashboard",
      category: "Frontend",
      featured: false,
      status: "Completed",
      startDate: new Date("2023-06-01"),
      endDate: new Date("2023-07-15")
    }
  ],

  experiences: [
    {
      position: "Senior Full Stack Developer",
      company: "TechCorp Solutions",
      location: "San Francisco, CA",
      startDate: new Date("2022-03-01"),
      current: true,
      description: "Leading development of scalable web applications and mentoring junior developers",
      responsibilities: [
        "Architected and developed microservices using Node.js and Docker",
        "Led a team of 4 developers in building customer-facing applications",
        "Implemented CI/CD pipelines reducing deployment time by 60%",
        "Mentored 3 junior developers and conducted code reviews"
      ],
      technologies: ["React", "Node.js", "AWS", "Docker", "MongoDB", "TypeScript"],
      achievements: [
        "Increased application performance by 40% through optimization",
        "Successfully delivered 5 major projects on time and under budget"
      ],
      companyLogo: "/uploads/techcorp-logo.png"
    },
    {
      position: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Remote",
      startDate: new Date("2020-06-01"),
      endDate: new Date("2022-02-28"),
      description: "Developed and maintained full-stack applications for early-stage startup",
      responsibilities: [
        "Built responsive web applications using React and Express.js",
        "Designed and implemented RESTful APIs",
        "Collaborated with UI/UX designers to implement pixel-perfect designs",
        "Optimized database queries improving response time by 50%"
      ],
      technologies: ["React", "Express.js", "PostgreSQL", "AWS", "Git"],
      achievements: [
        "Helped grow user base from 1K to 50K users",
        "Reduced server costs by 30% through optimization"
      ],
      companyLogo: "/uploads/startupxyz-logo.png"
    }
  ],

  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California, Berkeley",
      location: "Berkeley, CA",
      startDate: new Date("2016-09-01"),
      endDate: new Date("2020-05-15"),
      gpa: 3.8,
      description: "Focused on software engineering, algorithms, and data structures",
      courses: [
        "Data Structures and Algorithms",
        "Software Engineering",
        "Database Systems",
        "Computer Networks",
        "Machine Learning"
      ],
      achievements: [
        "Dean's List for 6 semesters",
        "President of Computer Science Club",
        "Winner of Annual Hackathon 2019"
      ],
      logo: "/uploads/ucb-logo.png"
    },
    {
      degree: "Full Stack Web Development Certificate",
      institution: "FreeCodeCamp",
      location: "Online",
      startDate: new Date("2019-01-01"),
      endDate: new Date("2019-08-01"),
      description: "Comprehensive web development bootcamp covering modern technologies",
      courses: [
        "Responsive Web Design",
        "JavaScript Algorithms and Data Structures",
        "Front End Libraries",
        "Data Visualization",
        "APIs and Microservices"
      ],
      achievements: [
        "Completed all 300+ coding challenges",
        "Built 5 full-stack projects"
      ],
      logo: "/uploads/freecodecamp-logo.png"
    }
  ],

  blogs: [
    {
      title: "Building Scalable Microservices with Node.js",
      slug: "building-scalable-microservices-nodejs",
      excerpt: "Learn how to architect and implement microservices that can handle millions of requests",
      content: `# Building Scalable Microservices with Node.js

Microservices architecture has become the gold standard for building scalable, maintainable applications. In this comprehensive guide, we'll explore how to build robust microservices using Node.js.

## Why Microservices?

Microservices offer several advantages:
- **Scalability**: Scale individual services based on demand
- **Technology Diversity**: Use different technologies for different services
- **Team Independence**: Teams can work independently on different services
- **Fault Isolation**: Failures in one service don't bring down the entire system

## Getting Started

Let's start by setting up our first microservice...`,
      author: "John Doe",
      publishDate: new Date("2024-09-15"),
      published: true,
      featured: true,
      tags: ["Node.js", "Microservices", "Architecture", "Scalability"],
      category: "Backend Development",
      readTime: 8,
      image: "/uploads/microservices-blog.jpg",
      views: 1250,
      likes: 89,
      seoTitle: "Building Scalable Microservices with Node.js - Complete Guide",
      seoDescription: "Comprehensive guide to building scalable microservices with Node.js. Learn architecture patterns, best practices, and implementation strategies."
    },
    {
      title: "React Performance Optimization Techniques",
      slug: "react-performance-optimization",
      excerpt: "Discover advanced techniques to make your React applications lightning fast",
      content: `# React Performance Optimization Techniques

Performance is crucial for user experience. Let's explore techniques to optimize React applications...`,
      author: "John Doe",
      publishDate: new Date("2024-08-20"),
      published: true,
      featured: true,
      tags: ["React", "Performance", "Optimization", "Frontend"],
      category: "Frontend Development",
      readTime: 6,
      image: "/uploads/react-performance-blog.jpg",
      views: 980,
      likes: 67
    },
    {
      title: "MongoDB Aggregation Pipeline Mastery",
      slug: "mongodb-aggregation-pipeline",
      excerpt: "Master complex data transformations with MongoDB's powerful aggregation framework",
      content: `# MongoDB Aggregation Pipeline Mastery

The aggregation pipeline is one of MongoDB's most powerful features...`,
      author: "John Doe",
      publishDate: new Date("2024-07-10"),
      published: true,
      featured: false,
      tags: ["MongoDB", "Database", "Aggregation", "NoSQL"],
      category: "Database",
      readTime: 10,
      image: "/uploads/mongodb-blog.jpg",
      views: 756,
      likes: 45
    }
  ],

  vlogs: [
    {
      title: "Day in the Life of a Full Stack Developer",
      slug: "day-in-life-fullstack-developer",
      description: "Follow me through a typical day as a full stack developer working remotely",
      videoUrl: "/uploads/day-in-life.mp4",
      thumbnail: "/uploads/day-in-life-thumb.jpg",
      duration: 720, // 12 minutes
      publishDate: new Date("2024-09-01"),
      published: true,
      featured: true,
      tags: ["Lifestyle", "Programming", "Remote Work", "Productivity"],
      category: "Lifestyle",
      views: 15600,
      likes: 892,
      seoTitle: "Day in the Life of a Full Stack Developer - Remote Work Reality",
      seoDescription: "Get an inside look at what it's really like working as a remote full stack developer. Daily routines, challenges, and tips for success."
    },
    {
      title: "Building a React App from Scratch",
      slug: "building-react-app-from-scratch",
      description: "Complete tutorial on building a modern React application with hooks and context",
      videoUrl: "/uploads/react-tutorial.mp4",
      thumbnail: "/uploads/react-tutorial-thumb.jpg",
      duration: 1800, // 30 minutes
      publishDate: new Date("2024-08-15"),
      published: true,
      featured: true,
      tags: ["React", "Tutorial", "JavaScript", "Frontend"],
      category: "Tutorial",
      views: 23400,
      likes: 1450
    },
    {
      title: "My Home Office Setup Tour 2024",
      slug: "home-office-setup-tour-2024",
      description: "Tour of my home office setup including desk, monitors, and development tools",
      videoUrl: "/uploads/office-setup.mp4",
      thumbnail: "/uploads/office-setup-thumb.jpg",
      duration: 480, // 8 minutes
      publishDate: new Date("2024-07-20"),
      published: true,
      featured: false,
      tags: ["Office Setup", "Productivity", "Tech", "Workspace"],
      category: "Tech",
      views: 8900,
      likes: 567
    }
  ],

  gallery: [
    {
      title: "Project Screenshots Collection",
      description: "Screenshots from various projects I've worked on",
      imageUrl: "/uploads/gallery-projects.jpg",
      category: "Projects",
      featured: true,
      order: 1,
      tags: ["Projects", "Screenshots", "Portfolio"]
    },
    {
      title: "Conference Speaking",
      description: "Speaking at React Conference 2024",
      imageUrl: "/uploads/gallery-speaking.jpg",
      category: "Events",
      featured: true,
      order: 2,
      tags: ["Speaking", "Conference", "React"]
    },
    {
      title: "Team Building Event",
      description: "Fun team building activities with colleagues",
      imageUrl: "/uploads/gallery-team.jpg",
      category: "Team",
      featured: false,
      order: 3,
      tags: ["Team", "Events", "Fun"]
    },
    {
      title: "Coding Setup",
      description: "My development environment and workspace",
      imageUrl: "/uploads/gallery-setup.jpg",
      category: "Workspace",
      featured: true,
      order: 4,
      tags: ["Setup", "Workspace", "Development"]
    }
  ],

  testimonials: [
    {
      name: "Sarah Johnson",
      position: "Product Manager",
      company: "TechCorp Solutions",
      content: "John is an exceptional developer who consistently delivers high-quality solutions. His ability to understand complex requirements and translate them into elegant code is impressive. He's also a great team player and mentor.",
      rating: 5,
      imageUrl: "/uploads/testimonial-sarah.jpg",
      approved: true,
      featured: true,
      date: new Date("2024-08-15"),
      relationship: "colleague",
      project: "E-commerce Platform Redesign"
    },
    {
      name: "Mike Chen",
      position: "CTO",
      company: "StartupXYZ",
      content: "Working with John was a game-changer for our startup. He helped us build a scalable architecture that grew with our user base. His technical expertise and problem-solving skills are top-notch.",
      rating: 5,
      imageUrl: "/uploads/testimonial-mike.jpg",
      approved: true,
      featured: true,
      date: new Date("2024-07-22"),
      relationship: "manager",
      project: "Platform Scalability Improvements"
    },
    {
      name: "Emily Rodriguez",
      position: "UI/UX Designer",
      company: "DesignStudio Pro",
      content: "John brings designs to life with pixel-perfect precision. His attention to detail and understanding of user experience makes him a pleasure to collaborate with. Highly recommended!",
      rating: 5,
      imageUrl: "/uploads/testimonial-emily.jpg",
      approved: true,
      featured: true,
      date: new Date("2024-06-10"),
      relationship: "collaborator",
      project: "Mobile App Interface"
    },
    {
      name: "David Park",
      position: "Senior Developer",
      company: "CodeCraft Inc",
      content: "John's mentorship helped me grow tremendously as a developer. His code reviews are insightful and his willingness to share knowledge is amazing. A true professional.",
      rating: 5,
      imageUrl: "/uploads/testimonial-david.jpg",
      approved: true,
      featured: false,
      date: new Date("2024-05-18"),
      relationship: "mentee",
      project: "Development Mentorship"
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await database.connect();

    // Clear existing data (except users)
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      Profile.deleteMany({}),
      Skill.deleteMany({}),
      Project.deleteMany({}),
      Experience.deleteMany({}),
      Education.deleteMany({}),
      Blog.deleteMany({}),
      Vlog.deleteMany({}),
      Gallery.deleteMany({}),
      Testimonial.deleteMany({}),
      Service.deleteMany({})
    ]);

    // Seed Profile
    console.log('👤 Creating profile...');
    const profile = new Profile(sampleData.profile);
    await profile.save();
    console.log('✅ Profile created');

    // Seed Services
    console.log('🛠️ Creating services...');
    for (const serviceData of sampleData.services) {
      const service = new Service(serviceData);
      await service.save();
    }
    console.log(`✅ ${sampleData.services.length} services created`);

    // Seed Skills
    console.log('🎯 Creating skills...');
    for (const skillData of sampleData.skills) {
      const skill = new Skill(skillData);
      await skill.save();
    }
    console.log(`✅ ${sampleData.skills.length} skills created`);

    // Seed Projects
    console.log('💼 Creating projects...');
    for (const projectData of sampleData.projects) {
      const project = new Project(projectData);
      await project.save();
    }
    console.log(`✅ ${sampleData.projects.length} projects created`);

    // Seed Experience
    console.log('💼 Creating experience...');
    for (const experienceData of sampleData.experiences) {
      const experience = new Experience(experienceData);
      await experience.save();
    }
    console.log(`✅ ${sampleData.experiences.length} experiences created`);

    // Seed Education
    console.log('🎓 Creating education...');
    for (const educationData of sampleData.education) {
      const education = new Education(educationData);
      await education.save();
    }
    console.log(`✅ ${sampleData.education.length} education entries created`);

    // Seed Blogs
    console.log('📝 Creating blogs...');
    for (const blogData of sampleData.blogs) {
      const blog = new Blog(blogData);
      await blog.save();
    }
    console.log(`✅ ${sampleData.blogs.length} blogs created`);

    // Seed Vlogs
    console.log('🎥 Creating vlogs...');
    for (const vlogData of sampleData.vlogs) {
      const vlog = new Vlog(vlogData);
      await vlog.save();
    }
    console.log(`✅ ${sampleData.vlogs.length} vlogs created`);

    // Seed Gallery
    console.log('🖼️ Creating gallery...');
    for (const galleryData of sampleData.gallery) {
      const gallery = new Gallery(galleryData);
      await gallery.save();
    }
    console.log(`✅ ${sampleData.gallery.length} gallery items created`);

    // Seed Testimonials
    console.log('💬 Creating testimonials...');
    for (const testimonialData of sampleData.testimonials) {
      const testimonial = new Testimonial(testimonialData);
      await testimonial.save();
    }
    console.log(`✅ ${sampleData.testimonials.length} testimonials created`);

    // Create sample users
    console.log('👥 Creating sample users...');
    
    // Create admin user if not exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const adminUser = new User({
        email: process.env.ADMIN_EMAIL || 'admin@portfolio.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        name: 'Administrator',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create sample editor user
    const existingEditor = await User.findOne({ email: 'editor@portfolio.com' });
    if (!existingEditor) {
      const editorUser = new User({
        email: 'editor@portfolio.com',
        password: 'editor123',
        name: 'Content Editor',
        role: 'editor'
      });
      await editorUser.save();
      console.log('✅ Editor user created');
    }

    // Create sample viewer user
    const existingViewer = await User.findOne({ email: 'viewer@portfolio.com' });
    if (!existingViewer) {
      const viewerUser = new User({
        email: 'viewer@portfolio.com',
        password: 'viewer123',
        name: 'Portfolio Viewer',
        role: 'viewer'
      });
      await viewerUser.save();
      console.log('✅ Viewer user created');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`✅ Profile: ${await Profile.countDocuments()} entries`);
    console.log(`✅ Services: ${await Service.countDocuments()} entries`);
    console.log(`✅ Skills: ${await Skill.countDocuments()} entries`);
    console.log(`✅ Projects: ${await Project.countDocuments()} entries`);
    console.log(`✅ Experience: ${await Experience.countDocuments()} entries`);
    console.log(`✅ Education: ${await Education.countDocuments()} entries`);
    console.log(`✅ Blogs: ${await Blog.countDocuments()} entries`);
    console.log(`✅ Vlogs: ${await Vlog.countDocuments()} entries`);
    console.log(`✅ Gallery: ${await Gallery.countDocuments()} entries`);
    console.log(`✅ Testimonials: ${await Testimonial.countDocuments()} entries`);
    console.log(`✅ Users: ${await User.countDocuments()} entries`);

    console.log('\n🔐 User Accounts:');
    console.log('👑 Admin: admin@portfolio.com / admin123');
    console.log('✏️  Editor: editor@portfolio.com / editor123');
    console.log('👁️  Viewer: viewer@portfolio.com / viewer123');

    console.log('\n🚀 You can now start the admin panel and see all this data!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

seedDatabase();