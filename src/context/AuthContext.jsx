import React, { createContext, useContext, useEffect, useState } from "react";
import { currentUserProfile } from "../initialData";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(currentUserProfile);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(currentUserProfile);

  const refreshProfile = async (user = currentUser) => {
    setUserProfile(currentUserProfile);
    return currentUserProfile;
  };

  const login = async () => {
    setCurrentUser(currentUserProfile);
    setUserProfile(currentUserProfile);
    return { user: currentUserProfile };
  };

  const logout = async () => {
    setCurrentUser(null);
    setUserProfile(null);
    window.location.href = '/';
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
      {children}
    </AuthContext.Provider>
  );
};


