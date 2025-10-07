import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000'

const PortfolioSite = () => {
  // State for each section's data
  const [services, setServices] = useState([])
  const [projects, setProjects] = useState([])
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch data from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [servicesRes, projectsRes, experienceRes, educationRes, blogsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/services`),
          fetch(`${API_BASE_URL}/api/projects`),
          fetch(`${API_BASE_URL}/api/experiences`),
          fetch(`${API_BASE_URL}/api/education`),
          fetch(`${API_BASE_URL}/api/blogs`)
        ])

        const [servicesData, projectsData, experienceData, educationData, blogsData] = await Promise.all([
          servicesRes.json(),
          projectsRes.json(),
          experienceRes.json(),
          educationRes.json(),
          blogsRes.json()
        ])

        // Set data, limiting to 2-3 items per section
        setServices(Array.isArray(servicesData) ? servicesData.slice(0, 3) : (servicesData.services?.slice(0, 3) || []))
        setProjects(Array.isArray(projectsData) ? projectsData.slice(0, 3) : (projectsData.projects?.slice(0, 3) || []))
        setExperience(Array.isArray(experienceData) ? experienceData.slice(0, 2) : (experienceData.experience?.slice(0, 2) || []))
        setEducation(Array.isArray(educationData) ? educationData.slice(0, 2) : (educationData.education?.slice(0, 2) || []))
        setBlogs(Array.isArray(blogsData) ? blogsData.slice(0, 3) : (blogsData.blogs?.slice(0, 3) || []))
        
        console.log('Services data:', servicesData)
        console.log('Projects data:', projectsData)
        console.log('Experience data:', experienceData)
        console.log('Education data:', educationData)
        console.log('Blogs data:', blogsData)
        
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
          <h1>Welcome to My Portfolio</h1>
          <p>This is the home section.</p>
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
          <h2>Contact</h2>
          <p>This is the contact section.</p>
        </div>
      </section>
    </div>
  )
}

export default PortfolioSite