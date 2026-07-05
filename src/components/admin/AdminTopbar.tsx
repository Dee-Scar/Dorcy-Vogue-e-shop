"use client";

import React from "react";
import { Bell, Menu } from "lucide-react";
import { useAdminLayout } from "@/context/AdminLayoutContext";

interface AdminTopbarProps {
  title: string;
}

export default function AdminTopbar({ title }: AdminTopbarProps) {
  const { toggleSidebar } = useAdminLayout();

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-1 text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">{title}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:text-[#1C1512] transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C9956A] rounded-full" />
        </button>
        {/* Admin Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C9956A] flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm font-semibold font-sans">A</span>
          </div>
          <span className="hidden sm:inline font-sans text-sm font-semibold text-[#1C1512]">Admin</span>
        </div>
      </div>
    </header>
  );
}
