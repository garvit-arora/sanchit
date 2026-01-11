// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDstr2jRQ2PoH1H2l2r3hKCKk18h3aw5_w",
    authDomain: "socializer-a03fc.firebaseapp.com",
    projectId: "socializer-a03fc",
    storageBucket: "socializer-a03fc.firebasestorage.app",
    messagingSenderId: "838552309938",
    appId: "1:838552309938:web:310c5eb7dc1170e6c979ab",
    measurementId: "G-WG2HMT88JV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
