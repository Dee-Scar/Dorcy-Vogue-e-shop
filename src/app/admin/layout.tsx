"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { AdminLayoutProvider, useAdminLayout } from "@/context/AdminLayoutContext";
import AdminSidebar from "@/components/admin/AdminSidebar";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAdminAuthenticated && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [isAdminAuthenticated, pathname, router]);

  // Show login page without sidebar
  if (pathname === "/admin/login") {
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
