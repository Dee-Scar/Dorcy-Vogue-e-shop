"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthModalOpen: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;
  toggleAuthModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("dorcy_vogue_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing user storage:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (name: string, email: string) => {
    const newUser = { name, email };
    setUser(newUser);
    localStorage.setItem("dorcy_vogue_user", JSON.stringify(newUser));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dorcy_vogue_user");
  };

  const toggleAuthModal = () => setIsAuthModalOpen((prev) => !prev);
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        login,
        logout,
        toggleAuthModal,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
