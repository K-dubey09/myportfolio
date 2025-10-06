import React, { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Eye, Calendar, MapPin, Mail, Phone, ExternalLink, Github, Play, Star, Quote, Shield, LogIn, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'

const API_BASE_URL = 'http://localhost:5000'

const PortfolioSite = () => {
  const navigate = useNavigate()
  // State management
  const [profile, setProfile] = useState({})
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [blogs, setBlogs] = useState([])
  const [vlogs, setVlogs] = useState([])
  const [gallery, setGallery] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [contactInfo, setContactInfo] = useState({})
  const [loading, setLoading] = useState(true)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [submitStatus, setSubmitStatus] = useState('')
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [selectedVlog, setSelectedVlog] = useState(null)
  
  // Auth context for role-based content
  const { user, hasPermission, isAdmin, logout, isAuthenticated } = useContext(AuthContext) || { 
    user: null, 
    hasPermission: () => false, 
    isAdmin: () => false, 
    logout: () => {}, 
    isAuthenticated: false 
  }

  useEffect(() => {
    fetchData()
  }, [user]) // Add user as dependency to refetch when user changes

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Base data that's always available
      const baseRequests = [
        fetch(`${API_BASE_URL}/api/profile`),
        fetch(`${API_BASE_URL}/api/projects`),
        fetch(`${API_BASE_URL}/api/skills`),
        fetch(`${API_BASE_URL}/api/contact`)
      ]
      
      // Additional data based on user permissions
      const additionalRequests = []
      
      // Authenticated users can see more content
      if (user) {
        additionalRequests.push(
          fetch(`${API_BASE_URL}/api/blogs`, {
            headers: user ? { Authorization: `Bearer ${user.token}` } : {}
          }),
          fetch(`${API_BASE_URL}/api/vlogs`, {
            headers: user ? { Authorization: `Bearer ${user.token}` } : {}
          }),
          fetch(`${API_BASE_URL}/api/gallery`, {
            headers: user ? { Authorization: `Bearer ${user.token}` } : {}
          }),
          fetch(`${API_BASE_URL}/api/testimonials`),
          fetch(`${API_BASE_URL}/api/experience`),
          fetch(`${API_BASE_URL}/api/education`)
        )
      } else {
        // Public users get limited content
        additionalRequests.push(
          fetch(`${API_BASE_URL}/api/blogs?limit=2`), // Only first 2 blogs
          fetch(`${API_BASE_URL}/api/testimonials?limit=3`), // Only featured testimonials
          fetch(`${API_BASE_URL}/api/experience?limit=2`), // Recent experience only
          fetch(`${API_BASE_URL}/api/education?limit=1`) // Latest education only
        )
      }
      
      const allRequests = [...baseRequests, ...additionalRequests]
      const responses = await Promise.all(allRequests)
      
      // Parse base responses
      const [profileData, projectsData, skillsData, contactData] = await Promise.all(
        responses.slice(0, 4).map(res => res.json())
      )
      
      setProfile(profileData)
      setProjects(projectsData.projects || [])
      setSkills(skillsData.skills || [])
      setContactInfo(contactData)
      
      // Parse additional responses
      if (additionalRequests.length > 0) {
        const additionalData = await Promise.all(
          responses.slice(4).map(res => res.json())
        )
        
        if (user) {
          // Full access for authenticated users
          const [blogsData, vlogsData, galleryData, testimonialsData, experienceData, educationData] = additionalData
          setBlogs(blogsData.blogs || [])
          setVlogs(vlogsData.vlogs || [])
          setGallery(galleryData.gallery || [])
          setTestimonials(testimonialsData.testimonials || [])
          setExperience(experienceData.experience || [])
          setEducation(educationData.education || [])
        } else {
          // Limited access for public users
          const [blogsData, testimonialsData, experienceData, educationData] = additionalData
          setBlogs(blogsData.blogs || [])
          setTestimonials(testimonialsData.testimonials || [])
          setExperience(experienceData.experience || [])
          setEducation(educationData.education || [])
          setVlogs([]) // No vlogs for public
          setGallery([]) // No gallery for public
        }
      }
      
      // Show success notification
      if (user) {
        toast.success('Portfolio loaded with full access!')
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('sending')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSubmitStatus('success')
        setContactForm({ name: '', email: '', message: '' })
        toast.success('Message sent successfully! I\'ll get back to you soon.')
      } else {
        setSubmitStatus('error')
        toast.error('Failed to send message. Please try again.')
        console.error('Contact form error:', result)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
      toast.error('Network error. Please check your connection and try again.')
    }
  }

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <motion.div 
        className="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading portfolio...
        </motion.p>
      </motion.div>
    )
  }

  return (
    <>
      {/* Header */}
      <motion.header 
        className="header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="nav">
          <div className="nav-brand">
            <h2>{profile.name || 'My Portfolio'}</h2>
          </div>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#projects">Projects</a></li>
            {user && <li><a href="#blogs">Blogs</a></li>}
            {user && <li><a href="#vlogs">Vlogs</a></li>}
            {user && <li><a href="#gallery">Gallery</a></li>}
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#contact">Contact</a></li>
            
            {/* Admin Panel - Only visible to admin users */}
            {user && user.role === 'admin' && (
              <li><a href="/admin" className="admin-link">
                <Shield size={16} />
                Admin Panel
              </a></li>
            )}
            
            {/* Authentication Controls */}
            {!user ? (
              <li>
                <button 
                  onClick={() => navigate('/login')}
                  className="nav-login-btn"
                >
                  <LogIn size={16} />
                  Login
                </button>
              </li>
            ) : (
              <li className="user-menu">
                <div className="user-info">
                  <span className={`user-badge ${user.role}`}>{user.role}</span>
                  <span className="user-name">{user.name}</span>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    toast.success('Logged out successfully');
                  }}
                  className="nav-logout-btn"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {profile.heroTitle || 'Welcome to My Portfolio'}
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {profile.heroSubtitle || 'Full Stack Developer & Creative Problem Solver'}
          </motion.p>
          <motion.div 
            className="hero-buttons"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <a href="#projects" className="btn btn-primary">View My Work</a>
            <a href="#contact" className="btn btn-secondary">Get In Touch</a>
            {!user && (
              <button 
                onClick={() => navigate('/login')}
                className="btn btn-outline"
              >
                <LogIn size={16} />
                Login for Full Access
              </button>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section 
        id="about" 
        className="section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            About Me
          </motion.h2>
          <div className="about-content">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {profile.aboutText || "I'm a passionate full-stack developer with expertise in modern web technologies. I love creating efficient, scalable solutions and bringing ideas to life through code."}
            </motion.p>
            {skills.length > 0 && (
              <motion.div 
                className="skills"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3>Skills & Technologies</h3>
                <div className="skill-tags">
                  {skills.map((skill, index) => (
                    <motion.span 
                      key={index} 
                      className="skill-tag"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {skill.name} {skill.level && `(${skill.level})`}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Experience Section */}
      {experience.length > 0 && (
        <motion.section 
          id="experience" 
          className="section experience-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Experience
            </motion.h2>
            <div className="experience-timeline">
              {experience.map((exp, index) => (
                <motion.div 
                  key={exp._id} 
                  className="experience-item"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="experience-content">
                    <h3>{exp.position}</h3>
                    <h4>{exp.company}</h4>
                    <div className="experience-meta">
                      <span className="experience-dates">
                        <Calendar size={16} />
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                      {exp.location && (
                        <span className="experience-location">
                          <MapPin size={16} />
                          {exp.location}
                        </span>
                      )}
                    </div>
                    <p className="experience-description">{exp.description}</p>
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="tech-tags">
                        {exp.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <motion.section 
          id="education" 
          className="section education-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Education
            </motion.h2>
            <div className="education-grid">
              {education.map((edu, index) => (
                <motion.div 
                  key={edu._id} 
                  className="education-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                >
                  <h3>{edu.degree}</h3>
                  <h4>{edu.institution}</h4>
                  <div className="education-meta">
                    <span>{edu.startYear} - {edu.endYear}</span>
                    {edu.grade && <span>Grade: {edu.grade}</span>}
                  </div>
                  {edu.description && <p>{edu.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Projects Section */}
      <motion.section 
        id="projects" 
        className="section projects-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            My Projects
          </motion.h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <motion.div 
                key={project.id} 
                className="project-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {project.image && (
                  <motion.img 
                    src={project.image} 
                    alt={project.title} 
                    className="project-image"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    {project.technologies.map((tech, techIndex) => (
                      <motion.span 
                        key={techIndex} 
                        className="tech-tag"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: techIndex * 0.05 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.github && (
                      <motion.a 
                        href={project.github} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="project-link"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Github size={16} />
                        GitHub
                      </motion.a>
                    )}
                    {project.demo && (
                      <motion.a 
                        href={project.demo} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="project-link"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink size={16} />
                        Live Demo
                      </motion.a>
                    )}
                  </div>
                  {project.featured && (
                    <motion.div 
                      className="project-featured"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Star size={16} />
                      Featured
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Blogs Section */}
      {blogs.length > 0 && (
        <motion.section 
          id="blogs" 
          className="section blogs-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Latest Blogs
            </motion.h2>
            {!user && (
              <motion.p 
                className="limited-access-notice"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Showing limited content. <a href="/admin">Login</a> to see all blogs.
              </motion.p>
            )}
            <div className="blogs-grid">
              {blogs.map((blog, index) => (
                <motion.article 
                  key={blog._id} 
                  className="blog-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  onClick={() => setSelectedBlog(blog)}
                >
                  {blog.featuredImage && (
                    <motion.img 
                      src={blog.featuredImage} 
                      alt={blog.title} 
                      className="blog-image"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <div className="blog-content">
                    <div className="blog-meta">
                      <span className="blog-category">{blog.category}</span>
                      <span className="blog-date">
                        <Calendar size={14} />
                        {new Date(blog.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-excerpt">{blog.excerpt}</p>
                    <div className="blog-tags">
                      {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="blog-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="blog-stats">
                      <span>
                        <Eye size={14} />
                        {blog.views || 0} views
                      </span>
                      <span>{blog.readTime || '5'} min read</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Vlogs Section - Only for authenticated users */}
      {user && vlogs.length > 0 && (
        <motion.section 
          id="vlogs" 
          className="section vlogs-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Video Content
            </motion.h2>
            <div className="vlogs-grid">
              {vlogs.map((vlog, index) => (
                <motion.div 
                  key={vlog._id} 
                  className="vlog-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => setSelectedVlog(vlog)}
                >
                  <div className="vlog-thumbnail">
                    {vlog.thumbnail && (
                      <motion.img 
                        src={vlog.thumbnail} 
                        alt={vlog.title}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <div className="play-button">
                      <Play size={32} fill="white" />
                    </div>
                    <div className="vlog-duration">{vlog.duration}</div>
                  </div>
                  <div className="vlog-content">
                    <h3 className="vlog-title">{vlog.title}</h3>
                    <p className="vlog-description">{vlog.description}</p>
                    <div className="vlog-meta">
                      <span className="vlog-date">
                        <Calendar size={14} />
                        {new Date(vlog.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="vlog-views">
                        <Eye size={14} />
                        {vlog.views || 0} views
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Gallery Section - Only for authenticated users */}
      {user && gallery.length > 0 && (
        <motion.section 
          id="gallery" 
          className="section gallery-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Gallery
            </motion.h2>
            <div className="gallery-grid">
              {gallery.map((item, index) => (
                <motion.div 
                  key={item._id} 
                  className="gallery-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  layout
                >
                  <img src={item.imageUrl} alt={item.title} />
                  <div className="gallery-overlay">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <span className="gallery-category">{item.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <motion.section 
          id="testimonials" 
          className="section testimonials-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              What People Say
            </motion.h2>
            {!user && (
              <motion.p 
                className="limited-access-notice"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Showing featured testimonials. <a href="/admin">Login</a> to see all testimonials.
              </motion.p>
            )}
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <motion.div 
                  key={testimonial._id} 
                  className="testimonial-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                >
                  <div className="testimonial-content">
                    <Quote className="quote-icon" size={24} />
                    <p className="testimonial-text">{testimonial.testimonial}</p>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="gold" className="star" />
                      ))}
                    </div>
                  </div>
                  <div className="testimonial-author">
                    {testimonial.avatar && (
                      <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                    )}
                    <div className="author-info">
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.position}</p>
                      <span>{testimonial.company}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Contact Section */}
      <motion.section 
        id="contact" 
        className="section contact-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Get In Touch
          </motion.h2>
          <div className="contact-content">
            <motion.div 
              className="contact-info"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3>Let's Connect</h3>
              <p>I'm always interested in new opportunities and collaborations.</p>
              <div className="contact-links">
                {contactInfo.email && (
                  <motion.a 
                    href={`mailto:${contactInfo.email}`} 
                    className="contact-link"
                    whileHover={{ scale: 1.05, x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mail size={18} />
                    {contactInfo.email}
                  </motion.a>
                )}
                {contactInfo.linkedin && (
                  <motion.a 
                    href={contactInfo.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="contact-link"
                    whileHover={{ scale: 1.05, x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink size={18} />
                    LinkedIn
                  </motion.a>
                )}
                {contactInfo.github && (
                  <motion.a 
                    href={contactInfo.github} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="contact-link"
                    whileHover={{ scale: 1.05, x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Github size={18} />
                    GitHub
                  </motion.a>
                )}
                {contactInfo.phone && (
                  <motion.a 
                    href={`tel:${contactInfo.phone}`} 
                    className="contact-link"
                    whileHover={{ scale: 1.05, x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Phone size={18} />
                    {contactInfo.phone}
                  </motion.a>
                )}
                {contactInfo.location && (
                  <motion.div 
                    className="contact-link"
                    whileHover={{ scale: 1.05, x: 10 }}
                  >
                    <MapPin size={18} />
                    {contactInfo.location}
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            <motion.form 
              className="contact-form" 
              onSubmit={handleContactSubmit}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3>Send a Message</h3>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows="5"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitStatus === 'sending'}
              >
                {submitStatus === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              
              {submitStatus === 'success' && (
                <p className="status-message success">Message sent successfully!</p>
              )}
              {submitStatus === 'error' && (
                <p className="status-message error">Failed to send message. Please try again.</p>
              )}
            </motion.form>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="footer"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <p>&copy; 2025 {profile.name || 'My Portfolio'}. Built with React & Express.</p>
        </div>
      </motion.footer>

      {/* Blog Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBlog(null)}
          >
            <motion.div 
              className="modal-content blog-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedBlog(null)}>×</button>
              {selectedBlog.featuredImage && (
                <img src={selectedBlog.featuredImage} alt={selectedBlog.title} className="modal-image" />
              )}
              <div className="modal-body">
                <div className="blog-meta">
                  <span className="blog-category">{selectedBlog.category}</span>
                  <span className="blog-date">
                    <Calendar size={14} />
                    {new Date(selectedBlog.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h2>{selectedBlog.title}</h2>
                <div className="blog-content" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
                <div className="blog-tags">
                  {selectedBlog.tags.map((tag, index) => (
                    <span key={index} className="blog-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vlog Modal */}
      <AnimatePresence>
        {selectedVlog && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVlog(null)}
          >
            <motion.div 
              className="modal-content vlog-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedVlog(null)}>×</button>
              <div className="vlog-player">
                {selectedVlog.videoUrl ? (
                  <video controls width="100%">
                    <source src={selectedVlog.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="vlog-placeholder">
                    <Play size={64} />
                    <p>Video not available</p>
                  </div>
                )}
              </div>
              <div className="modal-body">
                <h2>{selectedVlog.title}</h2>
                <p>{selectedVlog.description}</p>
                <div className="vlog-meta">
                  <span className="vlog-date">
                    <Calendar size={14} />
                    {new Date(selectedVlog.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="vlog-duration">{selectedVlog.duration}</span>
                  <span className="vlog-views">
                    <Eye size={14} />
                    {selectedVlog.views || 0} views
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default PortfolioSite