// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Firebase Auth & Firestore
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDCzerZobs8f--irhdsgD10KnWtHfefe2s",
  authDomain: "college-lms-project.firebaseapp.com",
  projectId: "college-lms-project",
  storageBucket: "college-lms-project.firebasestorage.app",
  messagingSenderId: "1015144786090",
  appId: "1:1015144786090:web:da456b42c0a906b58e88d3"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Firebase Auth, Firestore & Storage to use everywhere
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
