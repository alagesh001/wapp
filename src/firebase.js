// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// const firebaseConfig = {
//   apiKey: "AIzaSyBRzqsWSg_ljYFhSoa6lfVHQlFgbQiYTTM",
//   authDomain: "wbrtcfitox.firebaseapp.com",
//   databaseURL: "https://wbrtcfitox-default-rtdb.asia-southeast1.firebasedatabase.app/",
//   projectId: "wbrtcfitox",
//   storageBucket: "wbrtcfitox.firebasestorage.app",
//   messagingSenderId: "704402530419",
//   appId: "1:704402530419:web:c2ba224361e225ce064a06",
//   measurementId: "G-X2LR0HB3CV"
// };
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
// 🔥 Initialize app once
const app = initializeApp(firebaseConfig);

// 👇 Export services to use in your components
export const auth = getAuth(app);
export const db = getDatabase(app);
