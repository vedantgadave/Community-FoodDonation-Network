import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const getEnv = () => {
  const nodeEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  const viteEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
  return { ...nodeEnv, ...viteEnv };
};
const env = getEnv();

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDjBeS7wVZzqAzpugZk9DmgOQfeFSEyG9I",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "food-donation2-0.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "food-donation2-0",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "food-donation2-0.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "932179098400",
  appId: env.VITE_FIREBASE_APP_ID || "1:932179098400:web:6f8a677b6668e3ec377545",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZE16ZEP443",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_firebase_api_key'
);

export const isDemoMode = env.VITE_ENABLE_DEMO_MODE === 'true';

// Initialize Firebase SDK cleanly
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics unsupported environment errors
  });
}
