import React, { useContext } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

const PortfolioSite = () => {
  const navigate = useNavigate()
  
  // Auth context for role-based content
  const { user } = useContext(AuthContext) || { 
    user: null
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
            Welcome to My Portfolio
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Full Stack Developer & Creative Problem Solver
          </motion.p>
          <motion.div 
            className="hero-buttons"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
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
              I'm a passionate full-stack developer with expertise in modern web technologies. I love creating efficient, scalable solutions and bringing ideas to life through code.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Placeholder Sections for Navigation Links */}
      <motion.section 
        id="services" 
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
            Services
          </motion.h2>
          <p>Services content will be displayed here.</p>
        </div>
      </motion.section>

      <motion.section 
        id="projects" 
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
            Projects
          </motion.h2>
          <p>Projects content will be displayed here.</p>
        </div>
      </motion.section>

      <motion.section 
        id="experience" 
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
            Experience
          </motion.h2>
          <p>Experience content will be displayed here.</p>
        </div>
      </motion.section>

      <motion.section 
        id="education" 
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
            Education
          </motion.h2>
          <p>Education content will be displayed here.</p>
        </div>
      </motion.section>

      <motion.section 
        id="blogs" 
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
            Blogs
          </motion.h2>
          <p>Blog content will be displayed here.</p>
        </div>
      </motion.section>

      <motion.section 
        id="contact" 
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
            Contact
          </motion.h2>
          <p>Contact content will be displayed here.</p>
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
          <p>&copy; 2025 My Portfolio. Built with React & Express.</p>
        </div>
      </motion.footer>
    </div>
  )
}

export default PortfolioSite