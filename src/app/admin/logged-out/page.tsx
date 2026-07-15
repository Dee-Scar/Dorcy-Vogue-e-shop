"use client";

import React from "react";
import Link from "next/link";
import { ShieldOff, ArrowRight } from "lucide-react";

export default function AdminLoggedOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1007] p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-50 rounded-full border border-red-100">
            <ShieldOff className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-[#1C1512]">
            All Sessions Terminated
          </h1>
          <p className="font-sans text-sm text-[#8C8682] leading-relaxed">
            All active admin sessions have been signed out successfully. If this was an unauthorized access, change your password immediately via Supabase.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/admin/login"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#1C1007] hover:bg-[#2E1E0F] text-white font-sans text-sm font-semibold rounded-xl transition-colors"
          >
            Back to Admin Login
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="font-sans text-xs text-[#8C8682]">
            Remember to update your password if this was an unauthorized login.
          </p>
        </div>
      </div>
    </div>
  );
}
