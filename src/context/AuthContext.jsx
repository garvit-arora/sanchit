import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null); // MongoDB Profile

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync with Backend (MongoDB)
        try {
            // In a real app, you'd send the ID token to the backend
            const token = await user.getIdToken();
            const res = await axios.post('http://localhost:5000/api/auth/sync', {
                email: user.email,
                displayName: user.displayName,
                uid: user.uid,
                photoURL: user.photoURL
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserProfile(res.data);
        } catch (error) {
            console.error("Failed to sync user with MongoDB:", error);
            // Even if backend sync fails, we let them through Firebase Auth for now
            // to avoid blocking the user entirely if backend is down
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userProfile, // From MongoDB
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
