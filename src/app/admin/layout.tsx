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
    <div className="flex min-h-screen bg-[#F7F5F2]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
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
