"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Mail,
  MessageCircle,
  Monitor,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Email Templates", href: "/admin/email-templates", icon: Mail },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
  { label: "CMS", href: "/admin/cms", icon: Monitor },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { adminLogout } = useAdminAuth();

  return (
    <aside className="w-[200px] min-h-screen bg-[#1C1007] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/10">
        <span className="font-serif text-base tracking-widest text-white">
          <span className="text-[#C9956A]">DORCY</span>{" "}
          <span className="text-white/90">VOGUE</span>
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm font-sans font-medium transition-all duration-200 rounded-none ${
                active
                  ? "bg-[#C9956A]/20 text-[#C9956A] border-r-2 border-[#C9956A]"
                  : "text-white/60 hover:text-white/90 hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-5 border-t border-white/10">
        <button
          onClick={adminLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm font-sans font-medium text-white/50 hover:text-red-400 transition-colors duration-200 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
