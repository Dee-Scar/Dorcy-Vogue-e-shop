"use client";

import React from "react";
import { Menu } from "lucide-react";
import { useAdminLayout } from "@/context/AdminLayoutContext";

export default function MobileMenuButton() {
  const { toggleSidebar } = useAdminLayout();

  return (
    <button
      onClick={toggleSidebar}
      className="lg:hidden p-2 -ml-1 text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
