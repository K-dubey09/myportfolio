import bcrypt from 'bcryptjs';
import firebaseConfig, { admin } from '../config/firebase.js';

const SALT_ROUNDS = 12;

const defaultPermissions = {
  admin: {
    canCreatePosts: true,
    canEditPosts: true,
    canDeletePosts: true,
    canManageUsers: true,
    canUploadFiles: true,
    canEditProfile: true,
    canViewAnalytics: true
  },
  editor: {
    canCreatePosts: true,
    canEditPosts: true,
    canDeletePosts: false,
    canManageUsers: false,
    canUploadFiles: true,
    canEditProfile: true,
    canViewAnalytics: false
  },
  viewer: {
    canCreatePosts: false,
    canEditPosts: false,
    canDeletePosts: false,
    canManageUsers: false,
    canUploadFiles: false,
    canEditProfile: true,
    canViewAnalytics: false
  }
};

export const UserHelpers = {
  async createUser(userData) {
    const db = firebaseConfig.getFirestore();
    const auth = firebaseConfig.getAuth();
    
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    const usersCollection = db.collection('users');
    const snapshot = await usersCollection.count().get();
    const totalUsers = snapshot.data().count;
    const isFirstUser = totalUsers === 0;
    
    const role = isFirstUser ? 'admin' : (userData.role || 'viewer');
    const permissions = userData.permissions || defaultPermissions[role];
    
    const firebaseUser = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name
    });
    
    await auth.setCustomUserClaims(firebaseUser.uid, { role, permissions });
    
    const userDoc = {
      uid: firebaseUser.uid,
      email: userData.email,
      passwordHash: hashedPassword,
      name: userData.name,
      role,
      isActive: true,
      avatar: userData.avatar || null,
      userNumber: totalUsers + 1,
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      permissions,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await usersCollection.doc(firebaseUser.uid).set(userDoc);
    return { uid: firebaseUser.uid, ...userDoc };
  },

  async getUserByEmail(email) {
    const db = firebaseConfig.getFirestore();
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { uid: doc.id, ...doc.data() };
  },

  async getUserById(uid) {
    const db = firebaseConfig.getFirestore();
    const doc = await db.collection('users').doc(uid).get();
    
    if (!doc.exists) return null;
    return { uid: doc.id, ...doc.data() };
  },

  async updateUser(uid, updateData) {
    const db = firebaseConfig.getFirestore();
    const auth = firebaseConfig.getAuth();
    
    const updates = { ...updateData, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    
    if (updateData.password) {
      updates.passwordHash = await bcrypt.hash(updateData.password, SALT_ROUNDS);
      delete updates.password;
      await auth.updateUser(uid, { password: updateData.password });
    }
    
    if (updateData.role) {
      const permissions = defaultPermissions[updateData.role];
      updates.permissions = permissions;
      await auth.setCustomUserClaims(uid, { role: updateData.role, permissions });
    }
    
    if (updateData.name) {
      await auth.updateUser(uid, { displayName: updateData.name });
    }
    
    await db.collection('users').doc(uid).update(updates);
    return await this.getUserById(uid);
  },

  async deleteUser(uid) {
    const db = firebaseConfig.getFirestore();
    const auth = firebaseConfig.getAuth();
    
    await auth.deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    return true;
  },

  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  async updateLastLogin(uid) {
    const db = firebaseConfig.getFirestore();
    await db.collection('users').doc(uid).update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });
  }
};
