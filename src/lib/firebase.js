// Load environment variables first
require('dotenv').config();

// Firebase configuration and initialization
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');
const { getAuth } = require('firebase/auth');

// Use server-side environment variables for Node.js scripts
// Fall back to NEXT_PUBLIC_ variables for Next.js
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Validate required configuration
if (!firebaseConfig.apiKey) {
  console.error('Missing Firebase API Key');
  process.exit(1);
}

if (!firebaseConfig.databaseURL) {
  console.error('Missing Firebase Database URL');
  process.exit(1);
}

console.log('Initializing Firebase with databaseURL:', firebaseConfig.databaseURL);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

module.exports = {
  app,
  database,
  auth
};