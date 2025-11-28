import firebaseConfig from '../config/firebase.js';
import { admin } from '../config/firebase.js';
import emailNotificationService from '../services/emailNotificationService.js';

/**
 * Get all admin notifications
 */
export const getAllNotifications = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();

    const { status = 'all' } = req.query;

    let query = db.collection('adminNotifications')
      .orderBy('createdAt', 'desc')
      .limit(100);

    if (status === 'unread') {
      query = query.where('read', '==', false);
    } else if (status === 'read') {
      query = query.where('read', '==', true);
    }

    const snapshot = await query.get();
    const notifications = [];

    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      count: notifications.length,
      notifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      message: error.message
    });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();

    const { notificationId } = req.params;

    await db.collection('adminNotifications').doc(notificationId).update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();

    const snapshot = await db.collection('adminNotifications')
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `${snapshot.size} notifications marked as read`
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
      message: error.message
    });
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();

    const { notificationId } = req.params;

    await db.collection('adminNotifications').doc(notificationId).delete();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
      message: error.message
    });
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();

    const snapshot = await db.collection('adminNotifications')
      .where('read', '==', false)
      .get();

    res.json({
      success: true,
      unreadCount: snapshot.size
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
      message: error.message
    });
  }
};

/**
 * Manually trigger content warning check
 */
export const triggerWarningCheck = async (req, res) => {
  try {
    await emailNotificationService.triggerManualCheck();

    res.json({
      success: true,
      message: 'Content warning check triggered successfully'
    });

  } catch (error) {
    console.error('Error triggering warning check:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger warning check',
      message: error.message
    });
  }
};

/**
 * Get current content status for all sections
 */
export const getContentStatus = async (req, res) => {
  try {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();

    const sections = ['skills', 'projects', 'experiences', 'education', 'blogs', 'vlogs', 'gallery', 'services', 'testimonials'];
    const status = [];

    for (const section of sections) {
      const snapshot = await db.collection(section).get();
      const count = snapshot.size;
      
      status.push({
        section,
        displayName: getSectionDisplayName(section),
        count,
        hasWarning: count > 0 && count < 3,
        needed: count < 3 ? 3 - count : 0
      });
    }

    const lowContentSections = status.filter(s => s.hasWarning);

    res.json({
      success: true,
      sections: status,
      hasWarnings: lowContentSections.length > 0,
      warningCount: lowContentSections.length,
      lowContentSections
    });

  } catch (error) {
    console.error('Error getting content status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content status',
      message: error.message
    });
  }
};

/**
 * Helper function to get display name
 */
function getSectionDisplayName(section) {
  const displayNames = {
    skills: 'Skills',
    projects: 'Projects',
    experiences: 'Experience',
    education: 'Education',
    blogs: 'Blogs',
    vlogs: 'Vlogs',
    gallery: 'Gallery',
    services: 'Services',
    testimonials: 'Testimonials'
  };
  return displayNames[section] || section;
}
