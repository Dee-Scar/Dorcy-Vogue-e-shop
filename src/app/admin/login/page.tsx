"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const { adminLogin } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await adminLogin(email, password);
      if (success) {
        router.replace("/admin/dashboard");
      } else {
        setError("Invalid credentials. Access denied.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#1C1007]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#C9956A] blur-3xl" />
          <div className="absolute bottom-32 right-10 w-80 h-80 rounded-full bg-[#C9956A] blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <span className="font-serif text-2xl tracking-widest">
            <span className="text-[#C9956A]">DORCY</span>{" "}
            <span className="text-white">VOGUE</span>
          </span>
        </div>

        {/* Center message */}
        <div className="relative z-10 space-y-4">
          <h2 className="font-serif text-4xl font-bold text-white leading-snug">
            Store Admin<br />
            <span className="text-[#C9956A]">Control Panel</span>
          </h2>
          <p className="font-sans text-white/60 text-sm leading-relaxed max-w-sm">
            Manage products, orders, customers, and your store settings — all from one place.
          </p>
        </div>

        {/* Stats teaser */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Total Orders", value: "156" },
            { label: "Customers", value: "1,247" },
            { label: "Revenue", value: "₦2.45M" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="font-serif text-xl font-bold text-[#C9956A]">{stat.value}</p>
              <p className="font-sans text-xs text-white/50 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <span className="font-serif text-xl tracking-widest">
              <span className="text-[#C9956A]">DORCY</span>{" "}
              <span className="text-[#1C1512]">VOGUE</span>
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1C1512] tracking-wide">
              Admin Sign In
            </h1>
            <p className="font-sans text-sm text-[#8C8682] mt-1.5">
              Authorized access only — Dorcy Vogue store management.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="font-sans text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C8682]" />
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-xl text-sm focus:outline-none focus:border-[#C9956A] font-sans transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C8682]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-xl text-sm focus:outline-none focus:border-[#C9956A] font-sans transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#8C8682] hover:text-[#1C1512] cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#1C1007] hover:bg-[#2E1E0F] text-white font-sans text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In to Admin"
              )}
            </button>
          </form>

          <p className="font-sans text-xs text-[#8C8682] text-center">
            This area is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
