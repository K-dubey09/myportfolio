import firebaseConfig from '../config/firebase.js';
import { admin } from '../config/firebase.js';
import cron from 'node-cron';

/**
 * Email Notification Service
 * Sends email alerts for low content warnings to admins
 */

class EmailNotificationService {
  constructor() {
    this.isRunning = false;
    this.lastNotificationSent = {};
    this.NOTIFICATION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Start the email notification service
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Email Notification Service already running');
      return;
    }

    console.log('📧 Starting Email Notification Service...');
    this.isRunning = true;

    // Check for low content warnings daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('📊 Running daily content check for email notifications...');
      await this.checkAndSendWarnings();
    });

    console.log('✅ Email Notification Service started');
  }

  /**
   * Check all sections and send warning emails if needed
   */
  async checkAndSendWarnings() {
    try {
      await firebaseConfig.initialize();
      const db = firebaseConfig.getFirestore();

      // Fetch all portfolio data
      const sections = ['skills', 'projects', 'experiences', 'education', 'blogs', 'vlogs', 'gallery', 'services', 'testimonials'];
      const lowContentSections = [];

      for (const section of sections) {
        const snapshot = await db.collection(section).get();
        const count = snapshot.size;

        if (count > 0 && count < 3) {
          lowContentSections.push({
            name: section,
            displayName: this.getSectionDisplayName(section),
            count: count,
            needed: 3 - count
          });
        }
      }

      if (lowContentSections.length > 0) {
        await this.sendWarningEmail(lowContentSections);
      } else {
        console.log('✅ All sections have adequate content (≥3 items)');
      }

    } catch (error) {
      console.error('❌ Error checking content warnings:', error);
    }
  }

  /**
   * Send warning email to all admin users
   */
  async sendWarningEmail(lowContentSections) {
    try {
      await firebaseConfig.initialize();
      const db = firebaseConfig.getFirestore();
      const auth = firebaseConfig.getAuth();

      // Get all admin users
      const usersSnapshot = await db.collection('users')
        .where('role', '==', 'admin')
        .get();

      if (usersSnapshot.empty) {
        console.log('⚠️  No admin users found to notify');
        return;
      }

      const admins = [];
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        if (userData.email) {
          // Check if we've sent notification recently
          const lastSent = this.lastNotificationSent[userData.email];
          if (!lastSent || Date.now() - lastSent > this.NOTIFICATION_COOLDOWN) {
            admins.push({
              email: userData.email,
              name: userData.name || 'Admin',
              uid: doc.id
            });
          }
        }
      }

      if (admins.length === 0) {
        console.log('⏳ All admins were notified recently (within 24h cooldown)');
        return;
      }

      // Generate email content
      const emailSubject = '⚠️ Portfolio Content Warning - Low Item Count Detected';
      const emailBody = this.generateEmailBody(lowContentSections);

      // Send emails using Firebase Auth action code settings
      for (const admin of admins) {
        try {
          // Get the auth user to send email
          const authUser = await auth.getUser(admin.uid);
          
          if (authUser && authUser.email) {
            // Send email using Firebase Admin SDK
            // Note: Firebase doesn't have built-in email sending for custom content
            // You'll need to integrate with a service like SendGrid, Mailgun, or Nodemailer
            
            // For now, we'll log to console and create a notification in Firestore
            await this.createNotificationRecord(admin, lowContentSections);
            
            console.log(`📧 Notification created for admin: ${admin.email}`);
            
            // Update last notification sent timestamp
            this.lastNotificationSent[admin.email] = Date.now();
          }
        } catch (error) {
          console.error(`❌ Error sending notification to ${admin.email}:`, error);
        }
      }

      console.log(`✅ Email notifications created for ${admins.length} admin(s)`);

    } catch (error) {
      console.error('❌ Error sending warning emails:', error);
    }
  }

  /**
   * Create notification record in Firestore
   */
  async createNotificationRecord(admin, lowContentSections) {
    try {
      await firebaseConfig.initialize();
      const db = firebaseConfig.getFirestore();

      await db.collection('adminNotifications').add({
        type: 'low_content_warning',
        recipient: {
          uid: admin.uid,
          email: admin.email,
          name: admin.name
        },
        sections: lowContentSections,
        message: this.generateEmailBody(lowContentSections),
        read: false,
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        sentAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      });

    } catch (error) {
      console.error('Error creating notification record:', error);
    }
  }

  /**
   * Generate email body HTML
   */
  generateEmailBody(lowContentSections) {
    const sectionsHtml = lowContentSections.map(section => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
          <strong>${section.displayName}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
          <span style="color: #f59e0b; font-weight: bold;">${section.count}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
          <span style="color: #10b981; font-weight: bold;">+${section.needed}</span>
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portfolio Content Warning</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; color: white; font-size: 28px;">⚠️ Content Warning</h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Low Item Count Detected
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 30px 20px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                      Hello Admin,
                    </p>
                    
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                      Your portfolio has <strong>${lowContentSections.length}</strong> section(s) with insufficient content. 
                      Each section should have at least <strong>3 items</strong> for optimal presentation.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                      <thead>
                        <tr style="background-color: #f8f9fa;">
                          <th style="padding: 12px; text-align: left; font-weight: 600; color: #555;">Section</th>
                          <th style="padding: 12px; text-align: center; font-weight: 600; color: #555;">Current</th>
                          <th style="padding: 12px; text-align: center; font-weight: 600; color: #555;">Needed</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${sectionsHtml}
                      </tbody>
                    </table>

                    <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 14px; color: #78350f;">
                        <strong>💡 Recommendation:</strong> A complete portfolio with 3+ items per section improves 
                        visitor engagement and showcases your professional breadth.
                      </p>
                    </div>

                    <p style="margin: 20px 0 0 0; text-align: center;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); 
                                color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; 
                                font-weight: 600; font-size: 16px;">
                        Go to Admin Panel
                      </a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      This is an automated notification from your Portfolio Management System.
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">
                      You receive this email once daily when content is below threshold.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Get display name for section
   */
  getSectionDisplayName(section) {
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

  /**
   * Manually trigger warning check (for testing or immediate notification)
   */
  async triggerManualCheck() {
    console.log('🔔 Manually triggering content warning check...');
    await this.checkAndSendWarnings();
  }

  /**
   * Stop the service
   */
  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      console.log('🛑 Email Notification Service stopped');
    }
  }
}

// Export singleton instance
const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;
