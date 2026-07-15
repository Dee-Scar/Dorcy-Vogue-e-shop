"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { AdminLayoutProvider, useAdminLayout } from "@/context/AdminLayoutContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";

const SESSION_KEY = "dv_admin_auth";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, adminLogout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAdminAuthenticated && pathname !== "/admin/login" && pathname !== "/admin/logged-out") {
      router.replace("/admin/login");
    }
  }, [isAdminAuthenticated, pathname, router]);

  // Poll every 5 seconds for force-logout flag set by the email button
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const checkForceLogout = async () => {
      try {
        const { data } = await supabase
          .from("cms_settings")
          .select("force_admin_logout, force_logout_at")
          .eq("id", 1)
          .single();

        if (data?.force_admin_logout) {
          // Clear local session immediately
          await supabase.auth.signOut();
          sessionStorage.removeItem(SESSION_KEY);
          await adminLogout();

          // Clear the flag in DB so next legitimate login isn't affected
          await supabase
            .from("cms_settings")
            .update({ force_admin_logout: false })
            .eq("id", 1);

          router.replace("/admin/logged-out");
        }
      } catch (_) {}
    };

    checkForceLogout();
    const interval = setInterval(checkForceLogout, 5000);
    return () => clearInterval(interval);
  }, [isAdminAuthenticated, adminLogout, router]);

  // Show login/logged-out pages without sidebar
  if (pathname === "/admin/login" || pathname === "/admin/logged-out") {
    return <>{children}</>;
  }

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <AdminLayoutProvider>
      <AdminShell>{children}</AdminShell>
    </AdminLayoutProvider>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen } = useAdminLayout();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F2]">
      {/* Desktop Sidebar — always visible on lg+ */}
      <div className="hidden lg:flex h-screen overflow-y-auto flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-[220px] z-50 shadow-2xl overflow-y-auto">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AdminAuthProvider>
  );
}
