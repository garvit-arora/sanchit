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

  const refreshProfile = async (user = currentUser) => {
    if (!user) return;
    try {
        const token = await user.getIdToken();
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.post(`${API_BASE}/auth/sync`, {
            email: user.email,
            displayName: user.displayName,
            uid: user.uid,
            photoURL: user.photoURL
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(res.data);
        return res.data;
    } catch (error) {
        console.error("Failed to sync profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await refreshProfile(user);
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
    userProfile, 
    login,
    logout,
    loading,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
