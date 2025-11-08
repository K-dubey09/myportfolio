import admin from 'firebase-admin';
import firebaseConfig from './config/firebase.js';

// Sample data for testing
const sampleData = {
  users: [
    {
      email: "kushagradubey5002@gmail.com",
      password: "Dubey@5002",
      username: "admin",
      role: "admin",
      permissions: {
        canCreatePosts: true,
        canEditPosts: true,
        canDeletePosts: true,
        canManageUsers: true,
        canEditProfile: true,
        canUploadFiles: true,
        canViewAnalytics: true
      },
      isVerified: true,
      isActive: true
    },
    {
      email: "editor@portfolio.com",
      password: "Editor123!@#",
      username: "editor",
      role: "editor",
      permissions: {
        canCreatePosts: true,
        canEditPosts: true,
        canDeletePosts: false,
        canManageUsers: false,
        canEditProfile: true,
        canUploadFiles: true,
        canViewAnalytics: false
      },
      isVerified: true,
      isActive: true
    },
    {
      email: "viewer@portfolio.com",
      password: "Viewer123!@#",
      username: "viewer",
      role: "viewer",
      permissions: {
        canCreatePosts: false,
        canEditPosts: false,
        canDeletePosts: false,
        canManageUsers: false,
        canEditProfile: false,
        canUploadFiles: false,
        canViewAnalytics: false
      },
      isVerified: true,
      isActive: true
    }
  ],

  profile: {
    name: "John Doe",
    title: "Full Stack Developer",
    email: "john.doe@example.com",
    phone: "+1234567890",
    bio: "Passionate developer with 5+ years of experience in web development",
    location: "San Francisco, CA",
    avatar: "https://picsum.photos/150/150?random=1",
    socialLinks: {
      github: "https://github.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe"
    }
  },

  skills: [
    { name: "JavaScript", category: "Frontend", level: "expert", percentage: 95, featured: true },
    { name: "React", category: "Frontend", level: "advanced", percentage: 90, featured: true },
    { name: "Node.js", category: "Backend", level: "advanced", percentage: 85, featured: true },
    { name: "MongoDB", category: "Database", level: "intermediate", percentage: 75 },
    { name: "Firebase", category: "Backend", level: "advanced", percentage: 80, featured: true },
    { name: "TypeScript", category: "Frontend", level: "intermediate", percentage: 70 },
    { name: "Python", category: "Backend", level: "beginner", percentage: 60 },
    { name: "Docker", category: "DevOps", level: "intermediate", percentage: 65 }
  ],

  projects: [
    {
      title: "E-Commerce Platform",
      description: "Full-stack e-commerce platform with React and Node.js",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      url: "https://github.com/johndoe/ecommerce",
      imageUrl: "https://picsum.photos/400/300?random=2",
      featured: true,
      status: "completed",
      startDate: "2023-01-01",
      endDate: "2023-06-30"
    },
    {
      title: "Task Management App",
      description: "Collaborative task management application",
      technologies: ["React", "Firebase", "Material-UI"],
      url: "https://github.com/johndoe/taskapp",
      imageUrl: "https://picsum.photos/400/300?random=3",
      featured: true,
      status: "completed",
      startDate: "2023-07-01",
      endDate: "2023-09-30"
    },
    {
      title: "Portfolio Website",
      description: "Personal portfolio website with admin panel",
      technologies: ["React", "Node.js", "Firebase"],
      url: "https://johndoe.dev",
      imageUrl: "https://picsum.photos/400/300?random=4",
      featured: true,
      status: "ongoing",
      startDate: "2024-01-01"
    }
  ],

  experiences: [
    {
      company: "Tech Corp",
      position: "Senior Full Stack Developer",
      location: "San Francisco, CA",
      startDate: "2021-01-01",
      endDate: "2023-12-31",
      current: false,
      description: "Led development of customer-facing web applications",
      achievements: [
        "Improved application performance by 40%",
        "Mentored junior developers",
        "Implemented CI/CD pipeline"
      ]
    },
    {
      company: "StartupXYZ",
      position: "Full Stack Developer",
      location: "Remote",
      startDate: "2024-01-01",
      current: true,
      description: "Building scalable web applications for SaaS platform",
      achievements: [
        "Architected microservices infrastructure",
        "Reduced API response time by 50%"
      ]
    }
  ],

  education: [
    {
      institution: "University of California",
      degree: "Bachelor of Science",
      field: "Computer Science",
      location: "Berkeley, CA",
      startDate: "2015-09-01",
      endDate: "2019-06-30",
      gpa: "3.8",
      achievements: [
        "Dean's List",
        "Computer Science Honor Society"
      ]
    },
    {
      institution: "Online Bootcamp",
      degree: "Certificate",
      field: "Full Stack Web Development",
      location: "Online",
      startDate: "2019-07-01",
      endDate: "2019-12-31"
    }
  ],

  blogs: [
    {
      title: "Introduction to React Hooks",
      content: "React Hooks revolutionized how we write React components...",
      excerpt: "Learn the basics of React Hooks and how to use them effectively",
      author: "John Doe",
      tags: ["React", "JavaScript", "Frontend"],
      imageUrl: "https://picsum.photos/800/400?random=5",
      featured: true,
      status: "published",
      views: 1500,
      likes: 120
    },
    {
      title: "Building RESTful APIs with Node.js",
      content: "A comprehensive guide to building RESTful APIs...",
      excerpt: "Step-by-step guide to creating robust REST APIs with Express",
      author: "John Doe",
      tags: ["Node.js", "Backend", "API"],
      imageUrl: "https://picsum.photos/800/400?random=6",
      featured: true,
      status: "published",
      views: 2200,
      likes: 180
    }
  ],

  vlogs: [
    {
      title: "Day in the Life of a Developer",
      description: "Follow me through a typical day as a full-stack developer",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://picsum.photos/640/360?random=7",
      duration: "15:30",
      featured: true,
      status: "published",
      views: 5000,
      likes: 450
    }
  ],

  gallery: [
    {
      title: "Project Screenshot 1",
      description: "Homepage of e-commerce platform",
      imageUrl: "https://picsum.photos/800/600?random=8",
      category: "projects",
      tags: ["e-commerce", "frontend"]
    },
    {
      title: "Project Screenshot 2",
      description: "Dashboard of task management app",
      imageUrl: "https://picsum.photos/800/600?random=9",
      category: "projects",
      tags: ["dashboard", "ui"]
    }
  ],

  testimonials: [
    {
      name: "Jane Smith",
      position: "Product Manager",
      company: "Tech Corp",
      message: "John is an exceptional developer who consistently delivers high-quality work",
      avatar: "https://picsum.photos/100/100?random=10",
      rating: 5,
      featured: true
    },
    {
      name: "Bob Johnson",
      position: "CTO",
      company: "StartupXYZ",
      message: "Working with John has been a pleasure. His technical skills are outstanding",
      avatar: "https://picsum.photos/100/100?random=11",
      rating: 5,
      featured: true
    }
  ],

  services: [
    {
      title: "Web Development",
      description: "Full-stack web application development using modern technologies",
      icon: "code",
      price: 5000,
      features: [
        "Responsive design",
        "RESTful API development",
        "Database design",
        "Deployment & hosting"
      ],
      featured: true
    },
    {
      title: "API Development",
      description: "Scalable and secure REST API development",
      icon: "api",
      price: 3000,
      features: [
        "RESTful architecture",
        "Authentication & authorization",
        "Documentation",
        "Testing"
      ],
      featured: true
    },
    {
      title: "Consulting",
      description: "Technical consulting and code review services",
      icon: "consulting",
      price: 150,
      duration: "per hour",
      features: [
        "Architecture review",
        "Code review",
        "Performance optimization",
        "Best practices guidance"
      ]
    }
  ],

  contactInfo: {
    email: "john.doe@example.com",
    phone: "+1234567890",
    address: "123 Main St, San Francisco, CA 94102",
    socialLinks: {
      github: "https://github.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe",
      instagram: "https://instagram.com/johndoe"
    },
    availability: "Available for freelance projects",
    timezone: "PST (UTC-8)"
  },

  achievements: [
    {
      title: "AWS Certified Developer",
      description: "Associate level certification for AWS cloud services",
      date: "2023-06-15",
      issuer: "Amazon Web Services",
      certificateUrl: "https://aws.amazon.com/certification",
      icon: "award",
      featured: true
    },
    {
      title: "Hackathon Winner",
      description: "First place in Bay Area Hackathon 2023",
      date: "2023-03-20",
      issuer: "TechHub SF",
      icon: "trophy",
      featured: true
    },
    {
      title: "Open Source Contributor",
      description: "500+ contributions to open source projects",
      date: "2024-01-01",
      issuer: "GitHub",
      icon: "code",
      featured: false
    }
  ]
};

// Initialize Firebase
async function initializeSampleData() {
  try {
    console.log('🔥 Starting Firebase sample data initialization...\n');

    // Initialize Firebase first
    await firebaseConfig.initialize();
    
    const db = firebaseConfig.getFirestore();
    const auth = firebaseConfig.getAuth();
    const collections = firebaseConfig.collections;

    // Add timestamps to all data
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // 1. Create Users with Firebase Authentication
    console.log('👥 Creating users...');
    const bcrypt = (await import('bcrypt')).default;
    
    for (const userData of sampleData.users) {
      try {
        // Create Firebase Auth user
        const userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          emailVerified: userData.isVerified,
          disabled: !userData.isActive,
          displayName: userData.username
        });

        // Hash password for Firestore
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Store user data in Firestore
        await collections.users.doc(userRecord.uid).set({
          email: userData.email,
          password: hashedPassword,
          username: userData.username,
          role: userData.role,
          permissions: userData.permissions,
          isVerified: userData.isVerified,
          isActive: userData.isActive,
          createdAt: timestamp,
          updatedAt: timestamp
        });

        console.log(`   ✓ Created user: ${userData.email} (${userData.role})`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`   ⚠ User ${userData.email} already exists, skipping...`);
        } else {
          console.error(`   ✗ Error creating user ${userData.email}:`, error.message);
        }
      }
    }
    console.log(`✅ ${sampleData.users.length} users processed\n`);

    // 2. Create Profile
    console.log('📝 Creating profile...');
    await collections.profiles.add({
      ...sampleData.profile,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    console.log('✅ Profile created\n');

    // 3. Create Skills
    console.log('🛠️ Creating skills...');
    for (const skill of sampleData.skills) {
      await collections.skills.add({
        ...skill,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log(`✅ ${sampleData.skills.length} skills created\n`);

    // 4. Create Projects
    console.log('🚀 Creating projects...');
    for (const project of sampleData.projects) {
      await collections.projects.add({
        ...project,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log(`✅ ${sampleData.projects.length} projects created\n`);

    // 5. Create Experiences
    console.log('💼 Creating experiences...');
    for (const experience of sampleData.experiences) {
      await collections.experiences.add({
        ...experience,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log(`✅ ${sampleData.experiences.length} experiences created\n`);

    // 6. Create Education
    console.log('🎓 Creating education...');
    for (const education of sampleData.education) {
      await collections.education.add({
        ...education,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log(`✅ ${sampleData.education.length} education entries created\n`);

    // 7. Create Blogs
    console.log('📰 Creating blogs...');
    for (const blog of sampleData.blogs) {
      await collections.blogs.add({
        ...blog,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log(`✅ ${sampleData.blogs.length} blogs created\n`);

    // 8. Create Vlogs
    console.log('🎥 Creating vlogs...');
    for (const vlog of sampleData.vlogs) {
      await collections.vlogs.add({
        ...vlog,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log(`✅ ${sampleData.vlogs.length} vlogs created\n`);

    // 9. Create Gallery
    console.log('🖼️ Creating gallery items...');
    for (const item of sampleData.gallery) {
      await collections.gallery.add({
        ...item,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log(`✅ ${sampleData.gallery.length} gallery items created\n`);

    // 10. Create Testimonials
    console.log('💬 Creating testimonials...');
    for (const testimonial of sampleData.testimonials) {
      await collections.testimonials.add({
        ...testimonial,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log(`✅ ${sampleData.testimonials.length} testimonials created\n`);

    // 11. Create Services
    console.log('⚙️ Creating services...');
    for (const service of sampleData.services) {
      await collections.services.add({
        ...service,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log(`✅ ${sampleData.services.length} services created\n`);

    // 12. Create Contact Info
    console.log('📞 Creating contact info...');
    await collections.contactInfo.add({
      ...sampleData.contactInfo,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    console.log('✅ Contact info created\n');

    // 13. Create Achievements
    console.log('🏆 Creating achievements...');
    for (const achievement of sampleData.achievements) {
      await collections.achievements.add({
        ...achievement,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log(`✅ ${sampleData.achievements.length} achievements created\n`);

    console.log('🎉 Sample data initialization complete!\n');
    console.log('📊 Summary:');
    console.log(`   - ${sampleData.users.length} users (admin, editor, viewer)`);
    console.log(`   - 1 profile`);
    console.log(`   - ${sampleData.skills.length} skills`);
    console.log(`   - ${sampleData.projects.length} projects`);
    console.log(`   - ${sampleData.experiences.length} experiences`);
    console.log(`   - ${sampleData.education.length} education entries`);
    console.log(`   - ${sampleData.blogs.length} blogs`);
    console.log(`   - ${sampleData.vlogs.length} vlogs`);
    console.log(`   - ${sampleData.gallery.length} gallery items`);
    console.log(`   - ${sampleData.testimonials.length} testimonials`);
    console.log(`   - ${sampleData.services.length} services`);
    console.log(`   - 1 contact info`);
    console.log(`   - ${sampleData.achievements.length} achievements`);
    console.log('\n✨ Your portfolio is ready to go!');
    console.log('\n🔑 Test User Credentials:');
    console.log('   Admin:  admin@portfolio.com / Admin123!@#');
    console.log('   Editor: editor@portfolio.com / Editor123!@#');
    console.log('   Viewer: viewer@portfolio.com / Viewer123!@#');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
    process.exit(1);
  }
}

// Run initialization
initializeSampleData();
