import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDcOn2kszjgRVBaQHUxY3JvrRbCV3molXo",
  authDomain: "my-portfolio-7ceb6.firebaseapp.com",
  projectId: "my-portfolio-7ceb6",
  storageBucket: "my-portfolio-7ceb6.firebasestorage.app",
  messagingSenderId: "531131624745",
  appId: "1:531131624745:web:99d62ab5b32e6db4b39b38",
  measurementId: "G-BZKHGTZG5N"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
