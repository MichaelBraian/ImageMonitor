import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log('Initializing Firebase with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize auth persistence
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('Firebase persistence initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase persistence:', error);
  }
})();

// Auth state monitoring
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('Auth state changed - User is signed in:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      providerData: user.providerData
    });
  } else {
    console.log('Auth state changed - User is signed out');
  }
});

// Export initialized instances
export { app, auth, db, storage };

// Export a function to check if Firebase is ready
export const isFirebaseReady = () => {
  return auth && db && storage && app;
};
