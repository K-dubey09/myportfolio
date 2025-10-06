import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Star, Quote } from 'lucide-react'
import toast from 'react-hot-toast'

const TestimonialsPage = () => {
  const { user } = useAuth()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true)
      const headers = user ? { 'Authorization': `Bearer ${user.token}` } : {}
      
      const response = await fetch('http://localhost:5000/api/testimonials', { headers })
      const data = await response.json()
      
      setTestimonials(data || [])
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }, [user])

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
      <div className="page-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading testimonials...</p>
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
    </div>
  )
}

export default TestimonialsPage