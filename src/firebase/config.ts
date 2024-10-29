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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

const db = getFirestore(app);
const storage = getStorage(app);

// More detailed auth state logging
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('Auth state changed - User is signed in:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    });
  } else {
    console.log('Auth state changed - User is signed out');
  }
});

export { app, auth, db, storage };
