import firebaseConfig from '../config/firebase.js';
import { admin } from '../config/firebase.js';
import cron from 'node-cron';

/**
 * Automated User Consistency Service
 * Runs periodic checks and cleanup tasks
 */

class UserConsistencyService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start automated consistency checks
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  User Consistency Service already running');
      return;
    }

    console.log('🤖 Starting User Consistency Service...');
    this.isRunning = true;

    // Run full consistency check daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('🔍 Running daily user consistency check...');
      await this.runFullConsistencyCheck();
    });

    // Check for expired suspensions every hour
    cron.schedule('0 * * * *', async () => {
      console.log('⏰ Checking for expired suspensions...');
      await this.checkExpiredSuspensions();
    });

    // Clean up old logs monthly
    cron.schedule('0 3 1 * *', async () => {
      console.log('🧹 Cleaning up old logs...');
      await this.cleanupOldLogs();
    });

    console.log('✅ User Consistency Service started');
  }

  /**
   * Run full consistency check on all users
   */
  async runFullConsistencyCheck() {
    try {
      await firebaseConfig.initialize();
      const db = firebaseConfig.getFirestore();
      const auth = firebaseConfig.getAuth();

      console.log('🔄 Starting full user consistency check...');

      const usersSnapshot = await db.collection('users').get();
      let checkedCount = 0;
      let issuesFound = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        try {
          // Check if auth record exists
          let authUser;
          try {
            authUser = await auth.getUser(userId);
          } catch (error) {
            // Auth record missing
            await this.handleMissingAuthRecord(userId, userData);
            issuesFound++;
            continue;
          }

          // Check for inconsistencies
          const inconsistencies = [];
          const missingFields = [];

          // Email mismatch
          if (authUser.email !== userData.email) {
            inconsistencies.push({
              field: 'email',
              authValue: authUser.email,
              firestoreValue: userData.email
            });
          }

          // Role mismatch
          const customClaims = authUser.customClaims || {};
          if (customClaims.role !== userData.role) {
            inconsistencies.push({
              field: 'role',
              authValue: customClaims.role,
              firestoreValue: userData.role
            });
          }

          // Missing required fields
          ['email', 'name', 'role'].forEach(field => {
            if (!userData[field] || userData[field].toString().trim() === '') {
              missingFields.push(field);
            }
          });

          // If issues found and not already suspended
          if ((inconsistencies.length > 0 || missingFields.length > 0) && !userData.isTemporarilySuspended) {
            await this.suspendUserForInconsistency(userId, userData, inconsistencies, missingFields);
            issuesFound++;
          }

          checkedCount++;
        } catch (error) {
          console.error(`Error checking user ${userId}:`, error);
        }
      }

      console.log(`✅ Consistency check complete: ${checkedCount} users checked, ${issuesFound} issues found`);

      // Log the check run
      await db.collection('systemLogs').add({
        type: 'consistency_check',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        stats: {
          totalChecked: checkedCount,
          issuesFound: issuesFound
        }
      });

    } catch (error) {
      console.error('❌ Error in full consistency check:', error);
    }
  }

  /**
   * Check and delete expired suspended accounts
   */
  async checkExpiredSuspensions() {
    try {
      await firebaseConfig.initialize();
      const db = firebaseConfig.getFirestore();
      const auth = firebaseConfig.getAuth();

      const now = new Date().toISOString();
      
      const expiredSnapshot = await db.collection('users')
        .where('isTemporarilySuspended', '==', true)
        .where('suspensionExpiresAt', '<=', now)
        .get();

      let deletedCount = 0;

      for (const userDoc of expiredSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        try {
          // Log deletion
          await db.collection('deletedAccounts').add({
            userId,
            userData,
            reason: 'Suspension expired - incomplete data',
            deletedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Log inconsistency
          await db.collection('userInconsistencyLogs').add({
            userId,
            type: 'account_deleted',
            details: {
              reason: 'Suspension expired',
              userData,
              deletedAt: new Date().toISOString()
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            resolved: true
          });

          // Delete from Firestore
          await db.collection('users').doc(userId).delete();

          // Delete from Auth
          try {
            await auth.deleteUser(userId);
          } catch (error) {
            console.error(`Error deleting auth for user ${userId}:`, error);
          }

          deletedCount++;
          console.log(`🗑️  Deleted expired account: ${userId}`);
        } catch (error) {
          console.error(`Error deleting user ${userId}:`, error);
        }
      }

      if (deletedCount > 0) {
        console.log(`✅ Deleted ${deletedCount} expired accounts`);
      }

    } catch (error) {
      console.error('❌ Error checking expired suspensions:', error);
    }
  }

  /**
   * Clean up old logs (older than 90 days)
   */
  async cleanupOldLogs() {
    try {
      await firebaseConfig.initialize();
      const db = firebaseConfig.getFirestore();

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Clean up old inconsistency logs
      const oldLogsSnapshot = await db.collection('userInconsistencyLogs')
        .where('timestamp', '<', ninetyDaysAgo)
        .where('resolved', '==', true)
        .get();

      const batch = db.batch();
      let count = 0;

      oldLogsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });

      if (count > 0) {
        await batch.commit();
        console.log(`🧹 Cleaned up ${count} old logs`);
      }

    } catch (error) {
      console.error('❌ Error cleaning up old logs:', error);
    }
  }

  /**
   * Handle missing auth record
   */
  async handleMissingAuthRecord(userId, userData) {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();

    await db.collection('userInconsistencyLogs').add({
      userId,
      type: 'missing_auth_record',
      details: {
        firestoreData: userData,
        timestamp: new Date().toISOString()
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      resolved: false
    });

    // Mark user as suspended
    await db.collection('users').doc(userId).update({
      isTemporarilySuspended: true,
      suspensionReason: 'Auth record missing',
      suspendedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * Suspend user for inconsistency
   */
  async suspendUserForInconsistency(userId, userData, inconsistencies, missingFields) {
    await firebaseConfig.initialize();
    const db = firebaseConfig.getFirestore();

    const suspensionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await db.collection('users').doc(userId).update({
      isTemporarilySuspended: true,
      suspensionReason: 'Data inconsistency detected',
      suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
      suspensionExpiresAt: suspensionExpiresAt,
      dataIncomplete: missingFields.length > 0,
      missingFields: missingFields,
      inconsistencies: inconsistencies,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection('userInconsistencyLogs').add({
      userId,
      type: 'data_mismatch',
      details: {
        userData,
        inconsistencies,
        missingFields,
        suspensionExpiresAt
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      resolved: false
    });
  }

  /**
   * Stop the service
   */
  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      console.log('🛑 User Consistency Service stopped');
    }
  }
}

// Export singleton instance
const userConsistencyService = new UserConsistencyService();
export default userConsistencyService;
