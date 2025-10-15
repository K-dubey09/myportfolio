import React, { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Star, Quote } from 'lucide-react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../config/api'

const TestimonialsPage = () => {
  const { user, isEditor, token } = useAuth()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', position: '', company: '', content: '', rating: 5, featured: false, imageUrl: '' })

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      
      const response = await fetch(`${API_BASE_URL}/testimonials`, { headers })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch testimonials: ${response.status}`)
      }
      
      const data = await response.json()
      setTestimonials(data || [])
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      const errorMessage = error.message || 'Failed to load testimonials'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const filteredTestimonials = testimonials.filter(testimonial => {
    if (filter === 'all') return true
    if (filter === 'featured') return testimonial.featured
    if (filter === '5-star') return testimonial.rating === 5
    if (filter === '4-star') return testimonial.rating === 4
    return true
  })

  if (loading) {
    return (
      <div className="dedicated-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading testimonials...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dedicated-page">
        <div className="page-error">
          <Quote size={64} />
          <h2>Error Loading Testimonials</h2>
          <p>{error}</p>
          <button onClick={fetchTestimonials} className="retry-btn">
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
        <h1>Client Testimonials</h1>
        <p>What my clients and colleagues say about working with me</p>
        
        {!user && (
          <div className="login-notice">
            <p>Showing featured testimonials. <a href="/login">Login</a> to see all testimonials.</p>
          </div>
        )}
      </motion.div>

      <motion.div 
        className="page-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Testimonials</option>
            <option value="featured">Featured</option>
            <option value="5-star">5 Star Reviews</option>
            <option value="4-star">4 Star Reviews</option>
          </select>
        </div>
        {/* Editor-only add testimonial form toggle/area */}
        {user && isEditor() && (
          <div style={{marginLeft: '16px'}}>
            <button className="submit-btn" onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Close' : 'Add Testimonial / Feedback'}</button>
          </div>
        )}
      </motion.div>

      <motion.div 
        className="testimonials-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredTestimonials.length === 0 ? (
          <div className="no-results">
            <p>No testimonials found matching your criteria.</p>
          </div>
        ) : (
          filteredTestimonials.map((testimonial, index) => (
            <motion.div 
              key={testimonial._id} 
              className="testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
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
          ))
        )}
      </motion.div>
      {/* Add Testimonial Modal / Form (editor only) */}
      {user && isEditor() && showAdd && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Testimonial / Feedback</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              // submit new testimonial
              const payload = { name: addForm.name, position: addForm.position, company: addForm.company, content: addForm.content, rating: Number(addForm.rating || 5), featured: !!addForm.featured, imageUrl: addForm.imageUrl };
              try {
                  const res = await fetch(`${API_BASE_URL.replace('/api', '')}/api/admin/testimonials`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({ error: 'Submission failed' }));
                  toast.error(err.error || 'Failed to add testimonial');
                  return;
                }
                toast.success('Testimonial added');
                setShowAdd(false);
                setAddForm({ name: '', position: '', company: '', content: '', rating: 5, featured: false, imageUrl: '' });
                await fetchTestimonials();
              } catch (err) {
                console.error('Add testimonial failed', err);
                toast.error('Failed to submit testimonial');
              }
            }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-input" value={addForm.name} onChange={(e) => setAddForm(prev => ({...prev, name: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input className="form-input" value={addForm.position} onChange={(e) => setAddForm(prev => ({...prev, position: e.target.value}))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  <input className="form-input" value={addForm.company} onChange={(e) => setAddForm(prev => ({...prev, company: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Rating</label>
                  <select className="form-input" value={addForm.rating} onChange={(e) => setAddForm(prev => ({...prev, rating: e.target.value}))}>
                    <option value={5}>5</option>
                    <option value={4}>4</option>
                    <option value={3}>3</option>
                    <option value={2}>2</option>
                    <option value={1}>1</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea rows={4} className="form-input" value={addForm.content} onChange={(e) => setAddForm(prev => ({...prev, content: e.target.value}))} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input className="form-input" value={addForm.imageUrl} onChange={(e) => setAddForm(prev => ({...prev, imageUrl: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Featured</label>
                  <input type="checkbox" checked={addForm.featured} onChange={(e) => setAddForm(prev => ({...prev, featured: e.target.checked}))} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">Submit</button>
                <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestimonialsPage