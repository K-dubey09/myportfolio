import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Calendar, Eye, Filter, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

const BlogsPage = () => {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBlog, setSelectedBlog] = useState(null)

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const headers = user ? { 'Authorization': `Bearer ${user.token}` } : {}
      
      const response = await fetch('http://localhost:5000/api/blogs', { headers })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`)
      }
      
      const json = await response.json()
      // Handle both direct array and wrapped response formats
      const data = Array.isArray(json) ? json : (json.data || json.blogs || [])
      setBlogs(data)
    } catch (error) {
      console.error('Error fetching blogs:', error)
      const errorMessage = error.message || 'Failed to load blogs'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = searchTerm === '' || 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.tags && blog.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    
    const matchesFilter = filter === 'all' || 
      (filter === 'featured' && blog.featured) ||
      (filter === 'published' && blog.status === 'published') ||
      (filter === 'draft' && blog.status === 'draft')
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dedicated-page">
        <div className="page-error">
          <Calendar size={64} />
          <h2>Error Loading Blogs</h2>
          <p>{error}</p>
          <button onClick={fetchBlogs} className="retry-btn">
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
        <h1>All Blogs</h1>
        <p>Read my thoughts on technology, development, and more</p>
        
        {!user && (
          <div className="login-notice">
            <p>Some blogs may be hidden. <a href="/login">Login</a> to see all blogs.</p>
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
            placeholder="Search blogs, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <Filter size={16} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Blogs</option>
            <option value="featured">Featured</option>
            <option value="published">Published</option>
            {user && <option value="draft">Drafts</option>}
          </select>
        </div>
      </motion.div>

      <motion.div 
        className="blogs-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredBlogs.length === 0 ? (
          <div className="no-results">
            <p>No blogs found matching your criteria.</p>
          </div>
        ) : (
          filteredBlogs.map((blog, index) => (
            <motion.article 
              key={blog._id} 
              className="blog-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
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
                  <span className="blog-status">{blog.status}</span>
                  <span className="blog-date">
                    <Calendar size={14} />
                    {new Date(blog.publishedDate || blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-excerpt">{blog.excerpt}</p>
                
                {blog.tags && blog.tags.length > 0 && (
                  <div className="blog-tags">
                    <Tag size={14} />
                    {blog.tags.slice(0, 4).map((tag, tagIndex) => (
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
          ))
        )}
      </motion.div>

      {/* Blog Modal */}
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
            {selectedBlog.coverImage && (
              <img src={selectedBlog.coverImage} alt={selectedBlog.title} className="modal-image" />
            )}
            <div className="modal-body">
              <div className="blog-meta">
                <span className="blog-status">{selectedBlog.status}</span>
                <span className="blog-date">
                  <Calendar size={14} />
                  {new Date(selectedBlog.publishedDate || selectedBlog.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2>{selectedBlog.title}</h2>
              <div className="blog-content" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
              
              {/* Document Attachments */}
              {selectedBlog.documents && selectedBlog.documents.length > 0 && (
                <div className="blog-attachments" style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📎 Attachments
                  </h3>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {selectedBlog.documents.map((doc, index) => (
                      <li key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <div style={{flex: 1, minWidth: 0}}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#333',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            📄 {doc.name}
                          </div>
                          {doc.size && (
                            <div style={{fontSize: '12px', color: '#666'}}>
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          )}
                        </div>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download
                          style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div className="blog-tags">
                  {selectedBlog.tags.map((tag, index) => (
                    <span key={index} className="blog-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default BlogsPage