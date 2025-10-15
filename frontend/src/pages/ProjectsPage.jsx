import React, { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Github, ExternalLink, Star, Calendar, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../config/api'

const ProjectsPage = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const headers = user ? { 'Authorization': `Bearer ${user.token}` } : {}
      
      const response = await fetch(`${API_BASE_URL}/projects`, { headers })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`)
      }
      
      const data = await response.json()
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      const errorMessage = error.message || 'Failed to load projects'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.technologies && project.technologies.some(tech => 
        tech.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    
    const matchesFilter = filter === 'all' || 
      (filter === 'featured' && project.featured) ||
      (project.technologies && project.technologies.some(tech => 
        tech.toLowerCase().includes(filter.toLowerCase())
      ))
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dedicated-page">
        <div className="page-error">
          <Github size={64} />
          <h2>Error Loading Projects</h2>
          <p>{error}</p>
          <button onClick={fetchProjects} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>All Projects</h1>
        <p>Explore my complete portfolio of projects and applications</p>
        
        {!user && (
          <div className="login-notice">
            <p>Some projects may be hidden. <a href="/login">Login</a> to see all projects.</p>
          </div>
        )}
      </motion.div>

      <motion.div 
        className="page-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search projects, technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <Filter size={16} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Projects</option>
            <option value="featured">Featured</option>
            <option value="react">React</option>
            <option value="node">Node.js</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
          </select>
        </div>
      </motion.div>

      <motion.div 
        className="projects-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredProjects.length === 0 ? (
          <div className="no-results">
            <p>No projects found matching your criteria.</p>
          </div>
        ) : (
          filteredProjects.map((project, index) => (
            <motion.div 
              key={project._id || project.id} 
              className="project-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
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
                <div className="project-header">
                  <h3 className="project-title">{project.title}</h3>
                  {project.featured && (
                    <div className="project-featured">
                      <Star size={16} fill="gold" />
                      Featured
                    </div>
                  )}
                </div>
                <p className="project-description">{project.description}</p>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="project-tech">
                    {project.technologies.map((tech, techIndex) => (
                      <motion.span 
                        key={techIndex} 
                        className="tech-tag"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: techIndex * 0.05 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                )}
                
                <div className="project-meta">
                  {project.createdAt && (
                    <span className="project-date">
                      <Calendar size={14} />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
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
                      className="project-link primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ExternalLink size={16} />
                      Live Demo
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}

export default ProjectsPage