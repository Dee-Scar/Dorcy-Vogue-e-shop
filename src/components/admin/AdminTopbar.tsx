"use client";

import React from "react";
import { Bell } from "lucide-react";

interface AdminTopbarProps {
  title: string;
}

export default function AdminTopbar({ title }: AdminTopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
      <h1 className="font-sans text-xl font-semibold text-[#1C1512]">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:text-[#1C1512] transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C9956A] rounded-full" />
        </button>
        {/* Admin Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#C9956A] flex items-center justify-center">
            <span className="text-white text-sm font-semibold font-sans">A</span>
          </div>
          <span className="font-sans text-sm font-semibold text-[#1C1512]">Admin</span>
        </div>
      </div>
    </header>
  );
}
