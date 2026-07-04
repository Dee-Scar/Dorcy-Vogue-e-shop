"use client";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Construction } from "lucide-react";
export default function CMSPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AdminTopbar title="CMS" />
      <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#C9956A]/20 flex items-center justify-center mb-5">
          <Construction className="w-7 h-7 text-[#C9956A]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#1C1512] mb-2">CMS</h2>
        <p className="font-sans text-sm text-[#8C8682] max-w-xs leading-relaxed">Manage your website content here.</p>
        <span className="mt-4 inline-block px-3 py-1 bg-[#C9956A]/10 text-[#C9956A] text-xs font-semibold font-sans rounded-full">Coming Soon</span>
      </main>
    </div>
  );
}
