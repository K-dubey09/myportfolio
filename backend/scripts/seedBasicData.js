import mongoose from 'mongoose';
import database from '../config/database.js';

// Import models
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import Service from '../models/Service.js';
import Blog from '../models/Blog.js';
import Gallery from '../models/Gallery.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Education from '../models/Education.js';

// Simple sample data without images
const portfolioData = {
  profile: {
    name: "John Doe",
    title: "Full Stack Developer & UI/UX Designer",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Passionate full-stack developer with 5+ years of experience in creating modern web applications. Specialized in React, Node.js, and cloud technologies.",
    socialLinks: {
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      twitter: "https://twitter.com/johndoe",
      instagram: "https://instagram.com/johndoe"
    }
  },

  services: [
    {
      title: "Web Development",
      description: "Custom web applications built with modern technologies like React, Vue.js, and Angular.",
      price: "Starting at $2,500",
      duration: "2-4 weeks",
      featured: true,
      category: "Development",
      features: [
        "Responsive Design",
        "Performance Optimization",
        "SEO Friendly",
        "Cross-browser Compatibility",
        "Modern Framework Integration"
      ],
      order: 1
    },
    {
      title: "Mobile App Development", 
      description: "Native and cross-platform mobile applications for iOS and Android.",
      price: "Starting at $5,000",
      duration: "6-8 weeks",
      featured: false,
      category: "Development",
      features: [
        "React Native Development",
        "Flutter Development",
        "Native iOS/Android",
        "App Store Deployment",
        "Push Notifications"
      ],
      order: 2
    },
    {
      title: "UI/UX Design",
      description: "User-centered design solutions that enhance user experience and drive conversions.",
      price: "Starting at $1,500",
      duration: "1-2 weeks",
      featured: true,
      category: "Design",
      features: [
        "User Research",
        "Wireframing & Prototyping",
        "Visual Design",
        "Usability Testing",
        "Design Systems"
      ],
      order: 3
    }
  ],

  projects: [
    {
      title: "E-commerce Platform",
      description: "A modern e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, payment processing, inventory management, and admin dashboard.",
      technologies: ["React", "Node.js", "MongoDB", "Stripe", "AWS"],
      githubUrl: "https://github.com/johndoe/ecommerce-platform",
      liveUrl: "https://ecommerce-demo.com",
      featured: true,
      status: "Completed",
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-20')
    },
    {
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates, team collaboration features, and project tracking capabilities.",
      technologies: ["Vue.js", "Express.js", "PostgreSQL", "Socket.io", "Docker"],
      githubUrl: "https://github.com/johndoe/task-manager",
      liveUrl: "https://taskmanager-demo.com",
      featured: false,
      status: "Completed",
      startDate: new Date('2023-09-01'),
      endDate: new Date('2023-11-15')
    },
    {
      title: "Portfolio Website",
      description: "A responsive portfolio website showcasing projects, blogs, and professional information with modern animations and optimized performance.",
      technologies: ["React", "Framer Motion", "Node.js", "MongoDB", "GridFS"],
      githubUrl: "https://github.com/johndoe/portfolio",
      liveUrl: "https://johndoe-portfolio.com",
      featured: true,
      status: "Completed",
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-07-30')
    }
  ],

  blogs: [
    {
      title: "Getting Started with React 18",
      slug: "getting-started-with-react-18",
      excerpt: "Learn about the new features and improvements in React 18, including concurrent rendering and automatic batching.",
      content: `# Getting Started with React 18

React 18 introduces several new features that improve the user experience and developer productivity. In this article, we'll explore the key features and how to upgrade your existing applications.

## Key Features

### Concurrent Rendering
Concurrent rendering allows React to prepare multiple versions of the UI at the same time...

### Automatic Batching
React 18 extends batching to more scenarios, improving performance...

## Conclusion
React 18 brings powerful new features that make applications more responsive and performant.`,
      tags: ["React", "JavaScript", "Frontend", "Web Development"],
      category: "Tutorial",
      published: true,
      featured: true,
      readTime: 8,
      views: 245,
      likes: 23
    },
    {
      title: "Building Scalable APIs with Node.js",
      slug: "building-scalable-apis-nodejs",
      excerpt: "Best practices for designing and building scalable REST APIs using Node.js, Express, and MongoDB.",
      content: `# Building Scalable APIs with Node.js

Creating scalable APIs is crucial for modern web applications. This guide covers essential patterns and practices...

## Architecture Patterns

### Layered Architecture
Organize your code into distinct layers for better maintainability...

### Error Handling
Implement comprehensive error handling strategies...

## Performance Optimization
Learn techniques to optimize your API performance...`,
      tags: ["Node.js", "API", "Backend", "MongoDB"],
      category: "Development",
      published: true,
      featured: false,
      readTime: 12,
      views: 189,
      likes: 31
    }
  ],

  skills: [
    { name: "JavaScript", level: 95, category: "Programming" },
    { name: "React", level: 90, category: "Frontend" },
    { name: "Node.js", level: 88, category: "Backend" },
    { name: "MongoDB", level: 85, category: "Database" },
    { name: "Python", level: 80, category: "Programming" },
    { name: "AWS", level: 75, category: "Cloud" },
    { name: "Docker", level: 70, category: "DevOps" },
    { name: "UI/UX Design", level: 85, category: "Design" }
  ],

  experiences: [
    {
      title: "Senior Full Stack Developer",
      company: "Tech Solutions Inc.",
      location: "San Francisco, CA",
      startDate: new Date('2022-01-15'),
      endDate: null, // Current job
      current: true,
      description: "Lead development of scalable web applications using modern technologies. Mentor junior developers and collaborate with cross-functional teams.",
      technologies: ["React", "Node.js", "AWS", "MongoDB", "Docker"],
      achievements: [
        "Improved application performance by 40%",
        "Led a team of 4 developers",
        "Implemented CI/CD pipelines"
      ]
    },
    {
      title: "Frontend Developer",
      company: "Digital Agency Co.",
      location: "Los Angeles, CA", 
      startDate: new Date('2020-03-01'),
      endDate: new Date('2021-12-31'),
      current: false,
      description: "Developed responsive web applications and collaborated with designers to create engaging user interfaces.",
      technologies: ["React", "Vue.js", "SASS", "JavaScript"],
      achievements: [
        "Delivered 15+ client projects",
        "Reduced page load times by 60%",
        "Implemented responsive design patterns"
      ]
    }
  ],

  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California, Berkeley",
      location: "Berkeley, CA",
      startDate: new Date('2016-09-01'),
      endDate: new Date('2020-05-15'),
      gpa: "3.8/4.0",
      description: "Focused on software engineering, algorithms, and web technologies. Active member of the Computer Science Student Association.",
      courses: [
        "Data Structures and Algorithms",
        "Database Systems",
        "Software Engineering",
        "Web Development",
        "Computer Networks"
      ]
    }
  ]
};

// Seed the database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting basic database seeding...');

    // Connect to database
    await database.connect();

    // Clear existing data
    await Promise.all([
      Profile.deleteMany({}),
      Project.deleteMany({}),
      Service.deleteMany({}),
      Blog.deleteMany({}),
      Gallery.deleteMany({}),
      Skill.deleteMany({}),
      Experience.deleteMany({}),
      Education.deleteMany({})
    ]);

    // Seed Profile
    const profile = new Profile(portfolioData.profile);
    await profile.save();
    console.log('✅ Profile seeded');

    // Seed Services
    await Service.insertMany(portfolioData.services);
    console.log('✅ Services seeded');

    // Seed Projects
    await Project.insertMany(portfolioData.projects);
    console.log('✅ Projects seeded');

    // Seed Blogs
    await Blog.insertMany(portfolioData.blogs);
    console.log('✅ Blogs seeded');

    // Seed Skills
    await Skill.insertMany(portfolioData.skills);
    console.log('✅ Skills seeded');

    // Seed Experience
    await Experience.insertMany(portfolioData.experiences);
    console.log('✅ Experience seeded');

    // Seed Education
    await Education.insertMany(portfolioData.education);
    console.log('✅ Education seeded');

    console.log('🎉 Basic database seeding completed successfully!');
    console.log('📊 Seeded data summary:');
    console.log(`   - Profile: 1 record`);
    console.log(`   - Services: ${portfolioData.services.length} records`);
    console.log(`   - Projects: ${portfolioData.projects.length} records`);
    console.log(`   - Blogs: ${portfolioData.blogs.length} records`);
    console.log(`   - Skills: ${portfolioData.skills.length} records`);
    console.log(`   - Experience: ${portfolioData.experiences.length} records`);
    console.log(`   - Education: ${portfolioData.education.length} records`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;