import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000'

const PortfolioSite = () => {
  // State for each section's data
  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState([])
  const [projects, setProjects] = useState([])
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [blogs, setBlogs] = useState([])
  const [contactInfo, setContactInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch data from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [profileRes, servicesRes, projectsRes, experienceRes, educationRes, blogsRes, contactInfoRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/profile`),
          fetch(`${API_BASE_URL}/api/services`),
          fetch(`${API_BASE_URL}/api/projects`),
          fetch(`${API_BASE_URL}/api/experiences`),
          fetch(`${API_BASE_URL}/api/education`),
          fetch(`${API_BASE_URL}/api/blogs`),
          fetch(`${API_BASE_URL}/api/contact-info`)
        ])

        const [profileData, servicesData, projectsData, experienceData, educationData, blogsData, contactInfoData] = await Promise.all([
          profileRes.json(),
          servicesRes.json(),
          projectsRes.json(),
          experienceRes.json(),
          educationRes.json(),
          blogsRes.json(),
          contactInfoRes.json()
        ])

        // Set data, limiting to 2-3 items per section
        setProfile(profileData)
        setServices(Array.isArray(servicesData) ? servicesData.slice(0, 3) : (servicesData.services?.slice(0, 3) || []))
        setProjects(Array.isArray(projectsData) ? projectsData.slice(0, 3) : (projectsData.projects?.slice(0, 3) || []))
        setExperience(Array.isArray(experienceData) ? experienceData.slice(0, 2) : (experienceData.experience?.slice(0, 2) || []))
        setEducation(Array.isArray(educationData) ? educationData.slice(0, 2) : (educationData.education?.slice(0, 2) || []))
        setBlogs(Array.isArray(blogsData) ? blogsData.slice(0, 3) : (blogsData.blogs?.slice(0, 3) || []))
        setContactInfo(contactInfoData)
        
        console.log('Services data:', servicesData)
        console.log('Projects data:', projectsData)
        console.log('Experience data:', experienceData)
        console.log('Education data:', educationData)
        console.log('Blogs data:', blogsData)
        console.log('Contact info data:', contactInfoData)
        
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="portfolio-site">
        <div className="loading">Loading...</div>
      </div>
    )
  }
  return (
    <div className="portfolio-site">
      {/* Home Section */}
      <section id="top" className="section home-section">
        <div className="container">
          <div className="hero-content">
            {profile?.profilePicture && (
              <div className="profile-image">
                <img 
                  src={profile.profilePicture} 
                  alt={profile.name || 'Profile'} 
                  className="profile-pic"
                />
              </div>
            )}
            <div className="hero-text">
              <h1>Welcome to My Portfolio</h1>
              {profile?.name && <h2>I'm {profile.name}</h2>}
              {profile?.title && <h3>{profile.title}</h3>}
              {profile?.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <p>This is the home section.</p>
              )}
              
              {/* Key Social Links */}
              {profile?.socialLinks && Object.values(profile.socialLinks).some(value => value && value.trim() !== '') && (
                <div className="social-links-home">
                  {profile.socialLinks.linkedin && profile.socialLinks.linkedin.trim() !== '' && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-btn linkedin" title="LinkedIn">
                      <span className="social-icon">💼</span>
                      <span className="social-text">LinkedIn</span>
                    </a>
                  )}
                  {profile.socialLinks.github && profile.socialLinks.github.trim() !== '' && (
                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-btn github" title="GitHub">
                      <span className="social-icon">🐙</span>
                      <span className="social-text">GitHub</span>
                    </a>
                  )}
                  {profile.socialLinks.twitter && profile.socialLinks.twitter.trim() !== '' && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-btn twitter" title="Twitter">
                      <span className="social-icon">🐦</span>
                      <span className="social-text">Twitter</span>
                    </a>
                  )}
                  {profile.socialLinks.youtube && profile.socialLinks.youtube.trim() !== '' && (
                    <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-btn youtube" title="YouTube">
                      <span className="social-icon">📺</span>
                      <span className="social-text">YouTube</span>
                    </a>
                  )}
                </div>
              )}

              {/* Key Professional Platforms */}
              {profile?.professionalContacts && Object.values(profile.professionalContacts).some(value => value && value.trim() !== '') && (
                <div className="professional-links-home">
                  <h4>Professional Platforms</h4>
                  <div className="professional-links-grid">
                    {profile.professionalContacts.stackoverflow && profile.professionalContacts.stackoverflow.trim() !== '' && (
                      <a href={profile.professionalContacts.stackoverflow} target="_blank" rel="noopener noreferrer" className="platform-btn stackoverflow" title="Stack Overflow">
                        <span className="platform-icon">🔧</span>
                        <span className="platform-text">Stack Overflow</span>
                      </a>
                    )}
                    {profile.professionalContacts.leetcode && profile.professionalContacts.leetcode.trim() !== '' && (
                      <a href={profile.professionalContacts.leetcode} target="_blank" rel="noopener noreferrer" className="platform-btn leetcode" title="LeetCode">
                        <span className="platform-icon">💻</span>
                        <span className="platform-text">LeetCode</span>
                      </a>
                    )}
                    {profile.professionalContacts.medium && profile.professionalContacts.medium.trim() !== '' && (
                      <a href={profile.professionalContacts.medium} target="_blank" rel="noopener noreferrer" className="platform-btn medium" title="Medium">
                        <span className="platform-icon">📝</span>
                        <span className="platform-text">Medium</span>
                      </a>
                    )}
                    {profile.professionalContacts.devto && profile.professionalContacts.devto.trim() !== '' && (
                      <a href={profile.professionalContacts.devto} target="_blank" rel="noopener noreferrer" className="platform-btn devto" title="Dev.to">
                        <span className="platform-icon">👨‍💻</span>
                        <span className="platform-text">Dev.to</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Actions */}
              <div className="hero-actions">
                {contactInfo?.email && (
                  <a href={`mailto:${contactInfo.email}`} className="cta-button primary">
                    📧 Get In Touch
                  </a>
                )}
                {profile?.resume && (
                  <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="cta-button secondary">
                    📄 View Resume
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section services-section">
        <div className="container">
          <div className="section-header">
            <h2>Services</h2>
            <a href="/services" className="view-all-link">View All</a>
          </div>
          <div className="services-grid">
            {services.length > 0 ? (
              services.map((service, index) => (
                <div key={service._id || index} className="service-card">
                  <div className="service-icon">{service.icon || '🚀'}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  {service.price && <div className="service-price">${service.price}</div>}
                </div>
              ))
            ) : (
              <p>No services data available. Services array length: {services.length}</p>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section projects-section">
        <div className="container">
          <div className="section-header">
            <h2>Projects</h2>
            <a href="/projects" className="view-all-link">View All</a>
          </div>
          <div className="projects-grid">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <div key={project._id || index} className="project-card">
                  {project.image && (
                    <img src={project.image} alt={project.title} className="project-image" />
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
                          GitHub
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No projects data available. Projects array length: {projects.length}</p>
            )}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="section experience-section">
        <div className="container">
          <div className="section-header">
            <h2>Experience</h2>
            <a href="/experience" className="view-all-link">View All</a>
          </div>
          <div className="experience-list">
            {experience.length > 0 ? (
              experience.map((exp, index) => (
                <div key={exp._id || index} className="experience-item">
                  <div className="experience-content">
                    <h3>{exp.position}</h3>
                    <h4>{exp.company}</h4>
                    <div className="experience-meta">
                      <span className="experience-dates">
                        {exp.startDate} - {exp.endDate || 'Present'}
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
              <p>No experience data available. Experience array length: {experience.length}</p>
            )}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="section education-section">
        <div className="container">
          <div className="section-header">
            <h2>Education</h2>
            <a href="/education" className="view-all-link">View All</a>
          </div>
          <div className="education-grid">
            {education.map((edu, index) => (
              <div key={edu._id || index} className="education-card">
                <h3>{edu.degree}</h3>
                <h4>{edu.institution}</h4>
                <div className="education-meta">
                  <span>{edu.startYear} - {edu.endYear || 'Present'}</span>
                  {edu.grade && <span>Grade: {edu.grade}</span>}
                </div>
                {edu.description && <p>{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="section blogs-section">
        <div className="container">
          <div className="section-header">
            <h2>Blogs</h2>
            <a href="/blogs" className="view-all-link">View All</a>
          </div>
          <div className="blogs-grid">
            {blogs.map((blog, index) => (
              <div key={blog._id || index} className="blog-card">
                {blog.image && (
                  <img src={blog.image} alt={blog.title} className="blog-image" />
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <div className="section-header">
            <h2>Contact</h2>
            <p className="section-subtitle">This section is currently empty.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PortfolioSite