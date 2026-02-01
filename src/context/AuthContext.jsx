import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import apiClient from "../services/apiClient";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (user = currentUser) => {
    if (!user) {
        setUserProfile(null);
        return null;
    }
    try {
        // Try to get from backend first (which syncs with Firestore)
        const response = await apiClient.get(`/auth/profile?uid=${user.uid}`);
        setUserProfile(response.data);
        return response.data;
    } catch (error) {
        console.warn("Backend profile fetch failed, trying Firestore direct:", error);
        // Fallback to Firestore direct
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserProfile(data);
                return data;
            }
        } catch (err) {
            console.error("Firestore profile fetch failed:", err);
        }
    }
    return null;
  };

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setCurrentUser(user);
      
      // Sync with backend
      try {
        const token = await user.getIdToken();
        await apiClient.post('/auth/sync', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        });
      } catch (err) {
          console.error("Backend sync failed:", err);
      }

      await refreshProfile(user);
      return result;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
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


