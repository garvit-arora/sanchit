// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your app's Firebase project configuration
// These values are pulled from .env for security and flexibility
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDstr2jRQ2PoH1H2l2r3hKCKk18h3aw5_w",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "socializer-a03fc.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "socializer-a03fc",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "socializer-a03fc.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "838552309938",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:838552309938:web:310c5eb7dc1170e6c979ab",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WG2HMT88JV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
