"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "dorcyben001@gmail.com";
const SESSION_KEY = "dv_admin_auth";

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  adminLogin: async () => false,
  adminLogout: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check local session storage first
    const localSession = sessionStorage.getItem(SESSION_KEY);
    if (localSession === "true") {
      setIsAdminAuthenticated(true);
    }

    // Connect auth listener to sync session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem(SESSION_KEY, "true");
      } else {
        // If Supabase has no active session, they shouldn't be logged in
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem(SESSION_KEY);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem(SESSION_KEY, "true");
      } else {
        // Any other state (SIGNED_OUT, no session) means not authenticated
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem(SESSION_KEY);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      return false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Admin Auth Error:", error.message);
      return false;
    }

    if (data.user?.email === ADMIN_EMAIL) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem(SESSION_KEY, "true");

      // Send login alert email — fire and forget
      try {
        const loginTime = new Date().toLocaleString("en-NG", {
          timeZone: "Africa/Lagos",
          dateStyle: "medium",
          timeStyle: "short",
        }) + " (WAT)";

        fetch("/api/admin-login-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loginTime,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
          }),
        }).catch(() => {});
      } catch (_) {}

      return true;
    }
    return false;
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
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
