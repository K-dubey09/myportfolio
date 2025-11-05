import firebaseConfig from '../config/firebase.js';

const db = firebaseConfig.getFirestore();

/**
 * Conversions Controller
 * Tracks conversion events and analytics
 */

// Get all conversions
export const getAllConversions = async (req, res) => {
  try {
    const conversionsRef = db.collection('conversions');
    const snapshot = await conversionsRef.orderBy('timestamp', 'desc').limit(100).get();
    
    const conversions = [];
    snapshot.forEach(doc => {
      conversions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Calculate statistics
    const stats = {
      total: conversions.length,
      byType: {},
      bySource: {},
      recentConversions: conversions.slice(0, 10)
    };

    conversions.forEach(conversion => {
      // Count by type
      stats.byType[conversion.type] = (stats.byType[conversion.type] || 0) + 1;
      
      // Count by source
      stats.bySource[conversion.source || 'direct'] = (stats.bySource[conversion.source || 'direct'] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        conversions,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching conversions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversions',
      message: error.message
    });
  }
};

// Track a new conversion
export const trackConversion = async (req, res) => {
  try {
    const { type, value, source, metadata } = req.body;

    const newConversion = {
      type: type || 'unknown',
      value: value || 1,
      source: source || 'direct',
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      userId: req.user?.userId || null,
      ip: req.ip || req.connection.remoteAddress
    };

    const docRef = await db.collection('conversions').add(newConversion);

    res.json({
      success: true,
      data: {
        id: docRef.id,
        ...newConversion
      },
      message: 'Conversion tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking conversion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track conversion',
      message: error.message
    });
  }
};

// Get conversion statistics
export const getConversionStats = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    let query = db.collection('conversions');
    
    // Filter by date range
    if (startDate) {
      query = query.where('timestamp', '>=', startDate);
    }
    if (endDate) {
      query = query.where('timestamp', '<=', endDate);
    }
    
    // Filter by type
    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.get();
    
    const conversions = [];
    snapshot.forEach(doc => {
      conversions.push(doc.data());
    });

    // Calculate detailed statistics
    const stats = {
      total: conversions.length,
      totalValue: conversions.reduce((sum, c) => sum + (c.value || 0), 0),
      byType: {},
      bySource: {},
      byDay: {},
      averageValue: 0
    };

    conversions.forEach(conversion => {
      // Count by type
      stats.byType[conversion.type] = (stats.byType[conversion.type] || 0) + 1;
      
      // Count by source
      stats.bySource[conversion.source || 'direct'] = (stats.bySource[conversion.source || 'direct'] || 0) + 1;
      
      // Count by day
      const day = conversion.timestamp.split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    stats.averageValue = stats.total > 0 ? stats.totalValue / stats.total : 0;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching conversion stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversion stats',
      message: error.message
    });
  }
};

// Delete a conversion record
export const deleteConversion = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('conversions').doc(id).delete();

    res.json({
      success: true,
      message: 'Conversion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversion',
      message: error.message
    });
  }
};

export const ConversionsController = {
  getAllConversions,
  trackConversion,
  getConversionStats,
  deleteConversion
};

export default ConversionsController;
