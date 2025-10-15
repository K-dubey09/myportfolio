import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../config/api'

// reference to satisfy certain static analyzers about usage
const __motionStatsRef = typeof motion === 'undefined' ? null : motion;

const StatisticsPage = () => {
  const { user } = useAuth()
  const [statistics, setStatistics] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true)
      const headers = user ? { 'Authorization': `Bearer ${user.token}` } : {}
      const response = await fetch(`${API_BASE_URL}/statistics`, { headers })
      const data = await response.json()
      setStatistics(data.statistics || data || [])
    } catch (error) {
      console.error('Error fetching statistics:', error)
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>All Statistics & Metrics</h1>
        <p>Comprehensive view of key performance metrics and accomplishments</p>
      </motion.div>

      <motion.div 
        className="custom-statistics"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div 
          className="custom-stats-grid"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          {statistics.map((stat, index) => (
            <motion.div
              key={stat._id || index}
              className="custom-stat-card"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="custom-stat-icon">{stat.icon || '📊'}</div>
              <div className="custom-stat-number">
                {stat.value}
                {stat.unit && <span className="unit">{stat.unit}</span>}
              </div>
              <div className="custom-stat-label">{stat.label}</div>
              {stat.description && <div className="custom-stat-description">{stat.description}</div>}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default StatisticsPage
