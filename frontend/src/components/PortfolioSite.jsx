import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import { API_URL } from '../config/env'

const PortfolioSite = () => {
  const { theme, isAnimated } = useTheme()
  const { user } = useAuth()
  const { t } = useTranslation()
  
  // State for each section's data
  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState([])
  const [projects, setProjects] = useState([])
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [blogs, setBlogs] = useState([])
  const [vlogs, setVlogs] = useState([])
  const [gallery, setGallery] = useState([])
  const [contactInfo, setContactInfo] = useState(null)
  const [testimonialsPreview, setTestimonialsPreview] = useState([])
  const [achievementsPreview, setAchievementsPreview] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch data from Firebase via backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel - using featured endpoints for home page
        const [profileRes, servicesRes, projectsRes, experienceRes, educationRes, blogsRes, vlogsRes, galleryRes, contactInfoRes] = await Promise.all([
          fetch(`${API_URL}/profile`),
          fetch(`${API_URL}/services/featured?limit=3`),
          fetch(`${API_URL}/projects/featured?limit=3`),
          fetch(`${API_URL}/experiences/featured?limit=2`),
          fetch(`${API_URL}/education/featured?limit=2`),
          fetch(`${API_URL}/blogs/featured?limit=3`),
          fetch(`${API_URL}/vlogs/featured?limit=3`),
          fetch(`${API_URL}/gallery/featured?limit=3`),
          fetch(`${API_URL}/contact-info`)
        ])

        const [profileJson, servicesJson, projectsJson, experienceJson, educationJson, blogsJson, vlogsJson, galleryJson, contactInfoJson] = await Promise.all([
          profileRes.json(),
          servicesRes.json(),
          projectsRes.json(),
          experienceRes.json(),
          educationRes.json(),
          blogsRes.json(),
          vlogsRes.json(),
          galleryRes.json(),
          contactInfoRes.json()
        ])

        // Extract data from backend response format { success, count, data: [] }
        const servicesData = Array.isArray(servicesJson) ? servicesJson : (servicesJson.data || servicesJson.services || [])
        const projectsData = Array.isArray(projectsJson) ? projectsJson : (projectsJson.data || projectsJson.projects || [])
        const experienceData = Array.isArray(experienceJson) ? experienceJson : (experienceJson.data || experienceJson.experience || [])
        const educationData = Array.isArray(educationJson) ? educationJson : (educationJson.data || educationJson.education || [])
        const blogsData = Array.isArray(blogsJson) ? blogsJson : (blogsJson.data || blogsJson.blogs || [])
        const vlogsData = Array.isArray(vlogsJson) ? vlogsJson : (vlogsJson.data || vlogsJson.vlogs || [])
        const galleryData = Array.isArray(galleryJson) ? galleryJson : (galleryJson.data || galleryJson.gallery || [])

        // Set data - featured endpoints already return limited items
        setProfile(profileJson.data || profileJson)
        setServices(servicesData)
        setProjects(projectsData)
        setExperience(experienceData)
        setEducation(educationData)
        setBlogs(blogsData)
        setVlogs(vlogsData)
        setGallery(galleryData)
        
        // Handle contact info - could be array or single object
        const contactInfoData = contactInfoJson.data || contactInfoJson
        if (Array.isArray(contactInfoData) && contactInfoData.length > 0) {
          setContactInfo(contactInfoData[0])
        } else if (contactInfoData && !Array.isArray(contactInfoData)) {
          setContactInfo(contactInfoData)
        } else {
          setContactInfo(null)
        }
        
        // Fetch achievements preview - using featured endpoint
        try {
          const aRes = await fetch(`${API_URL}/achievements/featured?limit=3`)
          if (aRes.ok) {
            const aJson = await aRes.json()
            const items = Array.isArray(aJson) ? aJson : (aJson.data || aJson.achievements || [])
            setAchievementsPreview(items)
          }
        } catch (err) {
          console.warn('Could not fetch achievements preview', err)
        }
        
        console.log('Services data:', servicesData)
        console.log('Projects data:', projectsData)
        console.log('Experience data:', experienceData)
        console.log('Education data:', educationData)
        console.log('Blogs data:', blogsData)
        console.log('Vlogs data:', vlogsData)
        console.log('Gallery data:', galleryData)
        console.log('Contact info data:', contactInfoData)
        // Fetch testimonials - using featured endpoint
        try {
          const tRes = await fetch(`${API_URL}/testimonials/featured?limit=3`)
          if (tRes.ok) {
            const tJson = await tRes.json()
            const testimonialsData = Array.isArray(tJson) ? tJson : (tJson.data || tJson.testimonials || [])
            setTestimonialsPreview(testimonialsData)
          }
        } catch (err) {
          console.warn('Could not fetch testimonials preview', err)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle contact form input changes
  const handleContactInputChange = (e) => {
    const { name, value } = e.target
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setContactStatus({ type: '', message: '' })

    try {
      const response = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      })

      if (response.ok) {
        setContactStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully. I\'ll get back to you soon.'
        })
        setContactForm({ name: '', email: '', subject: '', message: '' })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setContactStatus({
        type: 'error',
        message: 'Sorry, there was an error sending your message. Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="portfolio-site">
        <div className="loading">Loading...</div>
      </div>
    )
  }
  return (
    <div className={`portfolio-site ${isAnimated ? 'animations-enabled' : 'animations-disabled'}`} data-theme={theme}>
      {/* Modern Hero Section */}
      <section id="top" className={`section home-section ${isAnimated ? 'fade-in' : ''}`}>
        <div className="container">
          {/* Floating Elements Background */}
          <div className="hero-background-elements">
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
          </div>

          <div className="hero-content-modern">
            {/* Left Side - Profile Card */}
            <div className={`profile-card-modern ${isAnimated ? 'scale-in' : ''}`}>
              {profile?.profilePicture && (
                <div className="profile-image-wrapper">
                  <div className="profile-image-glow"></div>
                  <img 
                    src={profile.profilePicture} 
                    alt={profile.name || 'Profile'} 
                    className="profile-pic-modern"
                  />
                  <div className="profile-badge">
                    <span className="badge-icon">✨</span>
                    <span className="badge-text">Available for Work</span>
                  </div>
                </div>
              )}
              
              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat-item">
                  <span className="stat-number">{projects.length}+</span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{experience.length}+</span>
                  <span className="stat-label">Years Exp</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{achievementsPreview.length}+</span>
                  <span className="stat-label">Awards</span>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Content */}
            <div className={`hero-text-modern ${isAnimated ? 'slide-in-right' : ''}`}>
              <div className="hero-intro">
                <span className="greeting-text">👋 Hello, I'm</span>
                <h1 className="hero-name">
                  {profile?.name || 'Your Name'}
                  <span className="name-underline"></span>
                </h1>
                <h2 className="hero-title">{profile?.title || 'Full Stack Developer'}</h2>
              </div>

              <p className="hero-description">
                {profile?.bio || t('home.description')}
              </p>

              {/* CTA Buttons */}
              <div className="hero-cta-group">
                <a href="#contact" className="cta-btn primary-cta">
                  <span className="cta-icon">💼</span>
                  <span>Hire Me</span>
                </a>
                {profile?.resume && (
                  <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="cta-btn secondary-cta">
                    <span className="cta-icon">�</span>
                    <span>Download CV</span>
                  </a>
                )}
                <a href="#projects" className="cta-btn tertiary-cta">
                  <span>View Work</span>
                  <span className="cta-arrow">→</span>
                </a>
              </div>

              {/* Social Links - Minimalist */}
              {profile?.socialLinks && Object.values(profile.socialLinks).some(value => value && value.trim() !== '') && (
                <div className="social-links-modern">
                  <span className="social-label">Connect:</span>
                  <div className="social-icons-group">
                    {profile.socialLinks.github && (
                      <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="GitHub">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="LinkedIn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="Twitter">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                        </svg>
                      </a>
                    )}
                    {profile.socialLinks.youtube && (
                      <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="YouTube">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tech Stack Preview */}
              {profile?.skills && profile.skills.length > 0 && (
                <div className="tech-stack-preview">
                  <span className="tech-label">Tech Stack:</span>
                  <div className="tech-tags-scroll">
                    {profile.skills.slice(0, 6).map((skill, index) => (
                      <span key={index} className="tech-tag-mini">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="scroll-indicator">
            <span className="scroll-text">Scroll to explore</span>
            <div className="scroll-mouse">
              <div className="scroll-wheel"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Preview Section - placed just after Home as requested */}
      <section id="achievements" className={`section achievements-section ${isAnimated ? 'fade-in' : ''}`}>
        {/* Floating Background Shapes */}
        <div className="floating-shape shape-achievement-1"></div>
        <div className="floating-shape shape-achievement-2"></div>
        <div className="floating-shape shape-achievement-3"></div>
        
        <div className="container">
          <div className="section-header">
            <h2>{t('achievements.title')}</h2>
            <a href="/achievements" className="view-all-link">{t('common.viewAll')}</a>
          </div>

          <div className="achievements-grid">
            {achievementsPreview && achievementsPreview.length > 0 ? (
              achievementsPreview.map((a, idx) => (
                <div 
                  key={a._id || a.id || idx} 
                  className="achievement-card"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="achievement-icon-glow">
                    <div className="icon-pulse"></div>
                    <span className="achievement-icon">{a.icon || '🏆'}</span>
                  </div>
                  {(a.number || a.value) && (
                    <div className="achievement-number">
                      {a.number || a.value}
                      {a.unit && <span className="unit">{a.unit}</span>}
                    </div>
                  )}
                  <h3>{a.title}</h3>
                  {a.description && <p>{a.description}</p>}
                  <div className="achievement-meta">
                    {a.category && <span className="achievement-category">{a.category}</span>}
                    {a.date && <span className="achievement-date"> • {new Date(a.date).toLocaleDateString()}</span>}
                  </div>
                  <div className="card-shine"></div>
                </div>
              ))
            ) : (
              <p>{t('achievements.noData')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className={`section services-section ${isAnimated ? 'fade-in' : ''}`}>
        {/* Floating Background Shapes */}
        <div className="floating-shape shape-service-1"></div>
        <div className="floating-shape shape-service-2"></div>
        
        <div className="container">
          <div className="section-header">
            <h2>{t('services.title')}</h2>
            <a href="/services" className="view-all-link">{t('common.viewAll')}</a>
          </div>
          <div className={`services-grid ${isAnimated ? 'slide-in-left' : ''}`}>
            {services.length > 0 ? (
              services.map((service, index) => (
                <div 
                  key={service._id || index} 
                  className="service-card"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="service-icon-wrapper">
                    <div className="icon-bg-pulse"></div>
                    <div className="service-icon">{service.icon || '🚀'}</div>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  {service.price && <div className="service-price">${service.price}</div>}
                  <div className="service-hover-effect"></div>
                </div>
              ))
            ) : (
              <p>{t('services.noData')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className={`section projects-section ${isAnimated ? 'fade-in' : ''}`}>
        {/* Floating Background Shapes */}
        <div className="floating-shape shape-project-1"></div>
        <div className="floating-shape shape-project-2"></div>
        
        <div className="container">
          <div className="section-header">
            <h2>{t('projects.title')}</h2>
            <a href="/projects" className="view-all-link">{t('common.viewAll')}</a>
          </div>
          <div className={`projects-grid ${isAnimated ? 'slide-in-right' : ''}`}>
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <div 
                  key={project._id || index} 
                  className="project-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {project.image && (
                    <div className="project-image-wrapper">
                      <img src={project.image} alt={project.title} className="project-image" />
                      <div className="image-overlay">
                        <div className="overlay-icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="project-content">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    {project.technologies && (
                      <div className="project-tech">
                        {project.technologies.slice(0, 3).map((tech, techIndex) => (
                          <span key={techIndex} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                    <div className="project-links">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                          {t('projects.viewGithub')}
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                          {t('projects.viewLive')}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="card-shine"></div>
                </div>
              ))
            ) : (
              <p>{t('projects.noData')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="section experience-section">
        {/* Floating Background Shapes */}
        <div className="floating-shape shape-experience-1"></div>
        <div className="floating-shape shape-experience-2"></div>
        
        <div className="container">
          <div className="section-header">
            <h2>{t('experience.title')}</h2>
            <a href="/experience" className="view-all-link">{t('common.viewAll')}</a>
          </div>
          <div className="experience-list">
            {experience.length > 0 ? (
              experience.map((exp, index) => (
                <div 
                  key={exp._id || index} 
                  className="experience-item"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="experience-timeline-dot">
                    <div className="dot-pulse"></div>
                  </div>
                  <div className="experience-content">
                    <h3>{exp.position}</h3>
                    <h4>{exp.company}</h4>
                    <div className="experience-meta">
                      <span className="experience-dates">
                        {exp.startDate} - {exp.endDate || t('experience.present')}
                      </span>
                      {exp.location && (
                        <span className="experience-location">{exp.location}</span>
                      )}
                    </div>
                    <p>{exp.description}</p>
                    {exp.technologies && (
                      <div className="experience-tech">
                        {exp.technologies.slice(0, 4).map((tech, techIndex) => (
                          <span key={techIndex} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>{t('experience.noData')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="section education-section">
        {/* Floating Background Shapes */}
        <div className="floating-shape shape-education-1"></div>
        <div className="floating-shape shape-education-2"></div>
        
        <div className="container">
          <div className="section-header">
            <h2>{t('education.title')}</h2>
            <a href="/education" className="view-all-link">{t('common.viewAll')}</a>
          </div>
          <div className="education-grid">
            {education.length > 0 ? (
              education.map((edu, index) => (
                <div 
                  key={edu._id || index} 
                  className="education-card"
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  <div className="education-icon-wrapper">
                    <div className="icon-bg-shine"></div>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                  </div>
                  <h3>{edu.degree}</h3>
                  <h4>{edu.institution}</h4>
                  <div className="education-meta">
                    <span>{edu.startYear} - {edu.endYear || t('experience.present')}</span>
                    {edu.grade && <span>{t('education.grade')}: {edu.grade}</span>}
                  </div>
                  {edu.description && <p>{edu.description}</p>}
                  <div className="card-shine"></div>
                </div>
              ))
            ) : (
              <p>{t('education.noData')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="section blogs-section">
        {/* Floating Background Shapes */}
        <div className="floating-shape shape-blog-1"></div>
        <div className="floating-shape shape-blog-2"></div>
        
        <div className="container">
          <div className="section-header">
            <h2>{t('blogs.title')}</h2>
            <a href="/blogs" className="view-all-link">{t('common.viewAll')}</a>
          </div>
          <div className="blogs-grid">
            {blogs.map((blog, index) => (
              <div 
                key={blog._id || index} 
                className="blog-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {blog.image && (
                  <div className="blog-image-wrapper">
                    <img src={blog.image} alt={blog.title} className="blog-image" />
                    <div className="blog-image-overlay">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                  </div>
                )}
                <div className="blog-content">
                  <div className="blog-meta">
                    {blog.category && (
                      <span className="blog-category">{blog.category}</span>
                    )}
                    <span className="blog-date">
                      {new Date(blog.publishDate || blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3>{blog.title}</h3>
                  <p>{blog.excerpt || blog.description}</p>
                  {blog.tags && (
                    <div className="blog-tags">
                      {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="blog-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vlogs Section - Modern Design */}
      {user && (user.role === 'admin' || user.role === 'editor') && vlogs && vlogs.length > 0 && (
        <section id="vlogs" className={`section vlogs-section ${isAnimated ? 'fade-in' : ''}`}>
          {/* Floating Background Shapes */}
          <div className="floating-shape shape-vlog-1"></div>
          <div className="floating-shape shape-vlog-2"></div>
          
          <div className="container">
            <div className="section-header">
              <h2>
                <span className="section-icon">🎥</span>
                Video Blogs
              </h2>
              <a href="/vlogs" className="view-all-link">View All</a>
            </div>
            <div className="vlogs-grid">
              {vlogs.map((vlog, index) => (
                <div key={vlog._id || vlog.id || index} className="vlog-card">
                  {vlog.thumbnailUrl && (
                    <div className="vlog-thumbnail">
                      <img src={vlog.thumbnailUrl} alt={vlog.title} className="vlog-image" />
                      <div className="vlog-play-overlay">
                        <div className="play-button">
                          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="30" fill="rgba(255, 255, 255, 0.9)" />
                            <path d="M24 18L42 30L24 42V18Z" fill="var(--accent-primary)" />
                          </svg>
                        </div>
                      </div>
                      {vlog.duration && (
                        <span className="vlog-duration">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {vlog.duration}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="vlog-content">
                    <h3>{vlog.title}</h3>
                    <p>{vlog.description}</p>
                    <div className="vlog-meta">
                      {vlog.platform && (
                        <span className="vlog-platform">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          {vlog.platform}
                        </span>
                      )}
                      {vlog.publishedDate && (
                        <span className="vlog-date">
                          {new Date(vlog.publishedDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      )}
                    </div>
                    {vlog.videoUrl && (
                      <a href={vlog.videoUrl} target="_blank" rel="noopener noreferrer" className="vlog-watch-btn">
                        <span>Watch Now</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section - Modern Masonry Grid */}
      <section id="gallery" className={`section gallery-section ${isAnimated ? 'fade-in' : ''}`}>
        {/* Floating Background Shapes */}
        <div className="floating-shape shape-gallery-1"></div>
        <div className="floating-shape shape-gallery-2"></div>
        <div className="floating-shape shape-gallery-3"></div>
        
        <div className="container">
          <div className="section-header">
            <h2>
              <span className="section-icon">🎨</span>
              Gallery
            </h2>
            {user && (user.role === 'admin' || user.role === 'editor') && (
              <a href="/gallery" className="view-all-link">View All</a>
            )}
          </div>
          <div className="gallery-grid-modern">
            {gallery && gallery.length > 0 ? (
              gallery.map((item, index) => (
                <div 
                  key={item._id || item.id || index} 
                  className={`gallery-item-modern ${index % 3 === 0 ? 'tall' : ''}`}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="gallery-image" />
                  ) : item.imageUrls && item.imageUrls.length > 0 ? (
                    <img src={item.imageUrls[0]} alt={item.title} className="gallery-image" />
                  ) : null}
                  <div className="gallery-overlay-modern">
                    <div className="gallery-info">
                      <h3>{item.title}</h3>
                      <div className="gallery-tags">
                        {item.category && (
                          <span className="gallery-tag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                              <line x1="7" y1="7" x2="7.01" y2="7"></line>
                            </svg>
                            {item.category}
                          </span>
                        )}
                        {item.location && (
                          <span className="gallery-tag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="gallery-zoom">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>No gallery items available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Modern Quote Cards */}
      <section id="testimonials" className={`section testimonials-section ${isAnimated ? 'fade-in' : ''}`}>
        {/* Floating Background Shapes */}
        <div className="floating-shape shape-testimonial-1"></div>
        <div className="floating-shape shape-testimonial-2"></div>
        
        <div className="container">
          <div className="section-header">
            <h2>
              <span className="section-icon">💬</span>
              Testimonials
            </h2>
            <a href="/testimonials" className="view-all-link">View All</a>
          </div>

          <div className="testimonials-grid-modern">
            {testimonialsPreview && testimonialsPreview.length > 0 ? (
              testimonialsPreview.map((t, index) => (
                <div 
                  key={t._id || t.id} 
                  className={`testimonial-card-modern ${index % 2 === 0 ? 'accent-left' : 'accent-right'}`}
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  <div className="quote-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <path d="M10 20C10 13.3726 13.3726 10 20 10V13.3333C15.3976 13.3333 13.3333 15.3976 13.3333 20H20V30H10V20Z" fill="currentColor" opacity="0.3"/>
                      <path d="M20 20C20 13.3726 23.3726 10 30 10V13.3333C25.3976 13.3333 23.3333 15.3976 23.3333 20H30V30H20V20Z" fill="currentColor" opacity="0.3"/>
                    </svg>
                  </div>
                  <p className="testimonial-text-modern">{t.content || t.testimonial}</p>
                  <div className="testimonial-meta-modern">
                    <div className="testimonial-author-modern">
                      {t.imageUrl && (
                        <div className="testimonial-avatar-modern">
                          <img src={t.imageUrl} alt={t.name} />
                        </div>
                      )}
                      <div className="testimonial-info">
                        <strong className="author-name">{t.name}</strong>
                        <div className="author-role">{t.position}{t.company ? ` • ${t.company}` : ''}</div>
                      </div>
                    </div>
                    {t.rating && (
                      <div className="testimonial-rating">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < t.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>No testimonials available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Contact Section - Modern Form & Info Cards */}
      <section id="contact" className={`section contact-section ${isAnimated ? 'fade-in' : ''}`}>
        {/* Floating Background Shapes */}
        <div className="floating-shape shape-contact-1"></div>
        <div className="floating-shape shape-contact-2"></div>
        <div className="floating-shape shape-contact-3"></div>
        
        <div className="container">
          <div className="section-header">
            <h2>
              <span className="section-icon">✉️</span>
              Get In Touch
            </h2>
            <p className="section-subtitle">Let's discuss your project or just say hi!</p>
          </div>
          
          <div className={`contact-cards-grid-modern ${isAnimated ? 'bounce-in' : ''}`}>
            {/* Contact Information Card */}
            <div className="contact-info-card-modern">
              <div className="card-header-modern">
                <div className="header-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <h3>Contact Information</h3>
                  <p>Feel free to reach out through any of these channels</p>
                </div>
              </div>
              <div className="card-content-modern">
                {contactInfo ? (
                  <div className="contact-info-list-modern">
                    {contactInfo.email && (
                      <div className="contact-item-modern">
                        <div className="contact-icon-modern">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                        <div className="contact-details-modern">
                          <strong>Email</strong>
                          <a href={`mailto:${contactInfo.email}`} className="contact-link-modern">
                            {contactInfo.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {contactInfo.phone && (
                      <div className="contact-item-modern">
                        <div className="contact-icon-modern">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                        </div>
                        <div className="contact-details-modern">
                          <strong>Phone</strong>
                          <a href={`tel:${contactInfo.phone}`} className="contact-link-modern">
                            {contactInfo.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {contactInfo.address && (
                      <div className="contact-item-modern">
                        <div className="contact-icon-modern">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <div className="contact-details-modern">
                          <strong>Location</strong>
                          <span>
                            {contactInfo.address.city && contactInfo.address.state
                              ? `${contactInfo.address.city}, ${contactInfo.address.state}`
                              : contactInfo.address.city || contactInfo.address.state || 'Location not specified'
                            }
                          </span>
                        </div>
                      </div>
                    )}
                    {contactInfo.website && (
                      <div className="contact-item-modern">
                        <div className="contact-icon-modern">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                          </svg>
                        </div>
                        <div className="contact-details-modern">
                          <strong>Website</strong>
                          <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="contact-link-modern">
                            Visit Website
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="no-data-modern">No contact information available.</p>
                )}
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="contact-form-card-modern">
              <div className="card-header-modern">
                <div className="header-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3>Send a Message</h3>
                  <p>I'll get back to you as soon as possible</p>
                </div>
              </div>
              <div className="card-content-modern">
                <form onSubmit={handleContactSubmit} className="contact-form-modern">
                  <div className="form-group-modern">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={contactForm.name}
                        onChange={handleContactInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group-modern">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        value={contactForm.email}
                        onChange={handleContactInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group-modern">
                    <label htmlFor="subject">Subject</label>
                    <div className="input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <input
                        id="subject"
                        type="text"
                        name="subject"
                        placeholder="Project Discussion"
                        value={contactForm.subject}
                        onChange={handleContactInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group-modern">
                    <label htmlFor="message">Your Message</label>
                    <div className="input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <textarea
                        id="message"
                        name="message"
                        placeholder="Tell me about your project..."
                        rows="5"
                        value={contactForm.message}
                        onChange={handleContactInputChange}
                        required
                      ></textarea>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="submit-btn-modern"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-modern"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </>
                    )}
                  </button>
                  
                  {contactStatus.message && (
                    <div className={`status-message-modern ${contactStatus.type}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {contactStatus.type === 'success' ? (
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        ) : (
                          <circle cx="12" cy="12" r="10"></circle>
                        )}
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      {contactStatus.message}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PortfolioSite