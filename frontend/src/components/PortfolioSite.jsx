import React, { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Eye, Calendar, MapPin, Mail, Phone, ExternalLink, Github, Play, Star, Quote, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'
import '../pages/PagesStyles.css'

// ensure bundler/linter recognizes framer-motion import usage in environments with aggressive unused detection
// (motion is used extensively in JSX tags below)
const __motionRef = typeof motion === 'undefined' ? null : motion;

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
  const [services, setServices] = useState([])
  const [achievements, setAchievements] = useState([])
  const [certifications, setCertifications] = useState([])
  const [statistics, setStatistics] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [submitStatus, setSubmitStatus] = useState('')
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [selectedVlog, setSelectedVlog] = useState(null)
  
  // Auth context for role-based content
  const { user } = useContext(AuthContext) || { 
    user: null
  }

  // Navigate to protected full pages; redirect unauthenticated users to login
  const handleViewAll = (path) => {
    if (!user) {
      toast.error('Please login to view full content')
      navigate('/login')
      return
    }
    navigate(path)
  }

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      
      // Base data that's always available
      const baseRequests = [
        fetch(`${API_BASE_URL}/api/profile`),
        fetch(`${API_BASE_URL}/api/projects`),
        fetch(`${API_BASE_URL}/api/skills`),
        fetch(`${API_BASE_URL}/api/contact`),
        fetch(`${API_BASE_URL}/api/services`),
        fetch(`${API_BASE_URL}/api/achievements`),
        fetch(`${API_BASE_URL}/api/statistics`)
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
          fetch(`${API_BASE_URL}/api/education`),
          fetch(`${API_BASE_URL}/api/certifications`)
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
      const [profileData, projectsData, skillsData, contactData, servicesData, achievementsData, statisticsData] = await Promise.all(
        responses.slice(0, 7).map(res => res.json())
      )
      
      setProfile(profileData)
      setProjects(projectsData.projects || [])
      setSkills(skillsData.skills || [])
      setContactInfo(contactData)
      setServices(servicesData.services || [])
      setAchievements(achievementsData.achievements || [])
      setStatistics(statisticsData.statistics || [])
      
      // Parse additional responses
      if (additionalRequests.length > 0) {
        const additionalData = await Promise.all(
          responses.slice(7).map(res => res.json())
        )
        
        if (user) {
          // Full access for authenticated users
          const [blogsData, vlogsData, galleryData, testimonialsData, experienceData, educationData, certificationsData] = additionalData
          setBlogs(blogsData.blogs || [])
          setVlogs(vlogsData.vlogs || [])
          setGallery(galleryData.gallery || [])
          setTestimonials(testimonialsData.testimonials || [])
          setExperience(experienceData.experience || [])
          setEducation(educationData.education || [])
          setCertifications(certificationsData.certifications || [])
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
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
    <div className="portfolio-site">
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
                
                {user && (
                  <motion.div 
                    className="skills-view-all"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <motion.button 
                      onClick={() => handleViewAll('/skills')}
                      className="btn btn-outline view-all-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All Skills & Technologies
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Skills Highlights Section */}
      {skills.length > 0 && (
        <motion.section 
          id="skills-highlights" 
          className="section skills-highlights-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <div className="section-header">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Skills Highlights
              </motion.h2>
              {skills.length > (user ? 12 : 6) && (
                <button className="header-view-all" onClick={() => handleViewAll('/skills')}>View All</button>
              )}
            </div>
            <div className="skills-highlights-grid">
              {skills.slice(0, user ? 12 : 6).map((skill, index) => (
                <motion.div 
                  key={skill._id || index} 
                  className="skill-highlight-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="skill-icon">
                    {skill.icon || '⚡'}
                  </div>
                  <h3>{skill.name}</h3>
                  {skill.level && (
                    <div className="skill-progress">
                      <div className="progress-bar">
                        <motion.div 
                          className="progress-fill"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.proficiency || 75}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <span className="skill-level">{skill.level}</span>
                    </div>
                  )}
                  {skill.description && (
                    <p className="skill-description">{skill.description}</p>
                  )}
                  {skill.experience && (
                    <span className="skill-experience">{skill.experience} experience</span>
                  )}
                </motion.div>
              ))}
            </div>
            {!user && (
              <motion.p 
                className="limited-access-notice"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Showing featured skills. <button onClick={() => navigate('/login')} className="link-btn">Login</button> to see complete skills portfolio.
              </motion.p>
            )}
          </div>
        </motion.section>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <motion.section 
          id="services" 
          className="section services-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <div className="section-header">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Services I Offer
              </motion.h2>
              {services.length > (user ? 12 : 6) && (
                <button className="header-view-all" onClick={() => handleViewAll('/services')}>View All</button>
              )}
            </div>
            <div className="services-grid">
              {services.slice(0, user ? 12 : 6).map((service, index) => (
                <motion.div 
                  key={service._id} 
                  className="service-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                >
                  <div className="service-icon">
                    {service.icon || '🔧'}
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  {service.features && service.features.length > 0 && (
                    <ul className="service-features">
                      {service.features.slice(0, 3).map((feature, featIndex) => (
                        <li key={featIndex}>{feature}</li>
                      ))}
                    </ul>
                  )}
                  {service.price && (
                    <div className="service-price">
                      Starting at ${service.price}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Footer View All removed in favor of header button */}
          </div>
        </motion.section>
      )}

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <motion.section 
          id="achievements" 
          className="section achievements-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <div className="section-header">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Key Achievements
              </motion.h2>
              {achievements.length > (user ? 8 : 4) && (
                <button className="header-view-all" onClick={() => handleViewAll('/achievements')}>View All</button>
              )}
            </div>
            <div className="achievements-grid">
              {achievements.slice(0, user ? 8 : 4).map((achievement, index) => (
                <motion.div 
                  key={achievement._id} 
                  className="achievement-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="achievement-icon">
                    {achievement.icon || '🏆'}
                  </div>
                  <div className="achievement-number">
                    {achievement.number || achievement.value}
                  </div>
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  {achievement.date && (
                    <div className="achievement-date">
                      {new Date(achievement.date).getFullYear()}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Footer View All removed */}
          </div>
        </motion.section>
      )}

      {/* Statistics Section */}
      <motion.section 
        id="statistics" 
        className="section statistics-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="section-header">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              By the Numbers
            </motion.h2>
            {statistics.length > (user ? 8 : 4) && (
              <button className="header-view-all" onClick={() => handleViewAll('/statistics')}>View All</button>
            )}
          </div>
          <div className="statistics-grid">
            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="stat-icon">💼</div>
              <div className="stat-number">{experience.length}</div>
              <div className="stat-label">Years Experience</div>
            </motion.div>
            
            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="stat-icon">🚀</div>
              <div className="stat-number">{projects.length}</div>
              <div className="stat-label">Projects Completed</div>
            </motion.div>
            
            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="stat-icon">⭐</div>
              <div className="stat-number">{testimonials.length}</div>
              <div className="stat-label">Happy Clients</div>
            </motion.div>
            
            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="stat-icon">🛠️</div>
              <div className="stat-number">{skills.length}</div>
              <div className="stat-label">Technologies</div>
            </motion.div>
            
            {user && certifications.length > 0 && (
              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="stat-icon">🎓</div>
                <div className="stat-number">{certifications.length}</div>
                <div className="stat-label">Certifications</div>
              </motion.div>
            )}
            
            {user && achievements.length > 0 && (
              <motion.div 
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="stat-icon">🏆</div>
                <div className="stat-number">{achievements.length}</div>
                <div className="stat-label">Achievements</div>
              </motion.div>
            )}
          </div>
          
          {/* Custom Statistics from Database */}
          {statistics.length > 0 && (
            <div className="custom-statistics">
              <h3>Key Metrics</h3>
              <div className="custom-stats-grid">
                {statistics.slice(0, user ? 8 : 4).map((stat, index) => (
                  <motion.div 
                    key={stat._id} 
                    className="custom-stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="custom-stat-icon">{stat.icon || '📊'}</div>
                    <div className="custom-stat-number">
                      {stat.value}
                      {stat.unit && <span className="unit">{stat.unit}</span>}
                    </div>
                    <div className="custom-stat-label">{stat.label}</div>
                    {stat.description && (
                      <div className="custom-stat-description">{stat.description}</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
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
            <div className="section-header">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Experience
              </motion.h2>
              {user && experience.length > 10 && (
                <button className="header-view-all" onClick={() => handleViewAll('/experience')}>View All</button>
              )}
            </div>
            {!user && (
              <motion.p 
                className="limited-access-notice"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Showing recent experience. <button onClick={() => navigate('/login')} className="link-btn">Login</button> to see complete professional history.
              </motion.p>
            )}
            <div className="experience-timeline">
              {experience.slice(0, user ? 10 : 2).map((exp, index) => (
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
            
            {/* Footer View All removed */}
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
            <div className="section-header">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Education
              </motion.h2>
              {user && education.length > 10 && (
                <button className="header-view-all" onClick={() => handleViewAll('/education')}>View All</button>
              )}
            </div>
            {!user && (
              <motion.p 
                className="limited-access-notice"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Showing latest education. <button onClick={() => navigate('/login')} className="link-btn">Login</button> to see complete academic background.
              </motion.p>
            )}
            <div className="education-grid">
              {education.slice(0, user ? 10 : 1).map((edu, index) => (
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
            
            {/* Footer View All removed */}
          </div>
        </motion.section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
      <motion.section 
        id="projects" 
        className="section projects-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="section-header">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              My Projects
            </motion.h2>
            {projects.length > (user ? 12 : 6) && (
              <button className="header-view-all" onClick={() => handleViewAll('/projects')}>View All</button>
            )}
          </div>
          <div className="projects-grid">
            {projects.slice(0, user ? 12 : 6).map((project, index) => (
              <motion.div 
                key={project._id || project.id} 
                className="project-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {project.imageUrl && (
                  <motion.img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="project-image"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
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
                  )}
                  <div className="project-links">
                    {project.githubUrl && (
                      <motion.a 
                        href={project.githubUrl} 
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
                    {project.liveUrl && (
                      <motion.a 
                        href={project.liveUrl} 
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
          
          {/* Footer View All removed */}
        </div>
      </motion.section>
      )}

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
            <div className="section-header">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Latest Blogs
              </motion.h2>
              {blogs.length > (user ? 8 : 3) && (
                <button className="header-view-all" onClick={() => handleViewAll('/blogs')}>View All</button>
              )}
            </div>
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
              {blogs.slice(0, user ? 8 : 3).map((blog, index) => (
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
                  {blog.coverImage && (
                    <motion.img 
                      src={blog.coverImage} 
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
                        {new Date(blog.publishedDate || blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-excerpt">{blog.excerpt}</p>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="blog-tags">
                        {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="blog-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="blog-stats">
                      <span>
                        <Eye size={14} />
                        {blog.views || 0} views
                      </span>
                      <span>{blog.readTime || '5'} min read</span>
                      {blog.featured && <span className="featured-badge">Featured</span>}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
            
            {/* Footer View All removed */}
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
            <div className="section-header">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Video Content
              </motion.h2>
              {vlogs.length > 0 && (
                <button className="header-view-all" onClick={() => handleViewAll('/vlogs')}>View All</button>
              )}
            </div>
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
            
            {/* Footer View All removed */}
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
            <div className="section-header">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Gallery
              </motion.h2>
              {gallery.length > 0 && (
                <button className="header-view-all" onClick={() => handleViewAll('/gallery')}>View All</button>
              )}
            </div>
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
            
            {/* Footer View All removed */}
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
            <div className="section-header">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                What People Say
              </motion.h2>
              {testimonials.length > (user ? 9 : 3) && (
                <button className="header-view-all" onClick={() => handleViewAll('/testimonials')}>View All</button>
              )}
            </div>
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
              {testimonials.slice(0, user ? 9 : 3).map((testimonial, index) => (
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
                    <p className="testimonial-text">{testimonial.content || testimonial.testimonial}</p>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="gold" className="star" />
                      ))}
                    </div>
                    {testimonial.featured && (
                      <div className="featured-badge">Featured</div>
                    )}
                  </div>
                  <div className="testimonial-author">
                    {testimonial.imageUrl && (
                      <img src={testimonial.imageUrl} alt={testimonial.name} className="author-avatar" />
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
            
            {/* Footer View All removed */}
          </div>
        </motion.section>
      )}

      {/* Certifications Section - Only for authenticated users */}
      {user && certifications.length > 0 && (
        <motion.section 
          id="certifications" 
          className="section certifications-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <div className="section-header">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Professional Certifications
              </motion.h2>
              {certifications.length > 8 && (
                <button className="header-view-all" onClick={() => handleViewAll('/certifications')}>View All</button>
              )}
            </div>
            <div className="certifications-grid">
              {certifications.slice(0, 8).map((cert, index) => (
                <motion.div 
                  key={cert._id} 
                  className="certification-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  {cert.logo && (
                    <div className="cert-logo">
                      <img src={cert.logo} alt={cert.issuer} />
                    </div>
                  )}
                  <div className="cert-content">
                    <h3>{cert.name}</h3>
                    <p className="cert-issuer">{cert.issuer}</p>
                    <div className="cert-meta">
                      <span className="cert-date">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </span>
                      {cert.expiryDate && (
                        <span className="cert-expiry">
                          Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {cert.credentialId && (
                      <div className="cert-credential">
                        ID: {cert.credentialId}
                      </div>
                    )}
                    {cert.verificationUrl && (
                      <a 
                        href={cert.verificationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="cert-verify-btn"
                      >
                        Verify Credential
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Footer View All removed */}
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
    </div>
  )
}

export default PortfolioSite;