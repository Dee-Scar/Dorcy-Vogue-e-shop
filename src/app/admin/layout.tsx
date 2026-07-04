"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
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
    <div className="flex h-screen overflow-hidden bg-[#F7F5F2]">
      <div className="h-screen overflow-y-auto flex-shrink-0">
        <AdminSidebar />
      </div>
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
