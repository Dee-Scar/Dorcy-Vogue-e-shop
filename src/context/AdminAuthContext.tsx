"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ADMIN_EMAIL = "dorcyben001@gmail.com";
const ADMIN_PASSWORD = "Dorcy001$";
const SESSION_KEY = "dv_admin_auth";

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  adminLogin: () => false,
  adminLogout: () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === "true") {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const adminLogin = (email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem(SESSION_KEY, "true");
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
