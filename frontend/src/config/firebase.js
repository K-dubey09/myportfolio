import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - these are public identifiers, safe to commit
// For different environments, you can use .env files
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDcOn2kszjgRVBaQHUxY3JvrRbCV3molXo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-portfolio-7ceb6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-portfolio-7ceb6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-portfolio-7ceb6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "531131624745",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:531131624745:web:99d62ab5b32e6db4b39b38",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BZKHGTZG5N"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
