import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Lazy-init Firebase so the app doesn't crash on import when config is placeholder
let _app = null;
let _firestore = null;

function getApp() {
  if (!_app) {
    try {
      _app = initializeApp(firebaseConfig);
    } catch (err) {
      console.warn('Firebase init failed (config may be placeholder):', err.message);
    }
  }
  return _app;
}

// Export as a getter — sync manager calls this only when actually syncing
export function getFirestoreInstance() {
  if (!_firestore) {
    const app = getApp();
    if (app) {
      _firestore = getFirestore(app);
    }
  }
  return _firestore;
}

// Backward-compatible export (lazy)
export const firestore = new Proxy({}, {
  get(_, prop) {
    const fs = getFirestoreInstance();
    return fs ? fs[prop] : undefined;
  },
});
