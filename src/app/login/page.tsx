"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User as UserIcon, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { login, signup, user } = useAuth();
  const router = useRouter();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (!isLoginTab && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLoginTab) {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || "Failed to sign in.");
          setIsLoading(false);
          return;
        }
      } else {
        const res = await signup(name, email, password);
        if (!res.success) {
          setError(res.error || "Failed to create account.");
          setIsLoading(false);
          return;
        }
      }
      setIsLoading(false);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#FAF7F2] relative overflow-hidden">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 right-6 md:right-auto md:left-6 z-30 flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md border border-[#1C1512]/5 hover:border-[#B78A62]/30 rounded-full font-sans text-xs font-semibold text-[#1C1512] transition-all duration-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
      </Link>

      {/* Left Column - Cover Image (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-[42%] relative overflow-hidden h-screen select-none">
        <img
          src="/login-photo.jpg"
          alt="Dorcy Vogue Shopping Bags"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.7]"
        />
        {/* Shadow overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120E0D]/90 via-[#120E0D]/20 to-transparent" />
        
        {/* Brand Text Overlay */}
        <div className="absolute bottom-16 left-12 right-12 z-10 space-y-3 text-white">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold tracking-wider">
            DORCY VOGUE
          </h1>
          <p className="font-sans text-sm lg:text-base text-white/85 leading-relaxed font-medium">
            Premium Nigerian Fashion — Where Style Meets Elegance
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full md:w-[58%] flex items-start justify-center p-6 sm:p-12 md:p-16 h-screen overflow-y-auto pt-24 pb-12 md:py-16">
        <div className="w-full max-w-md space-y-6 lg:space-y-8 my-auto">
          {/* Segmented Tab Controls */}
          <div className="flex bg-[#F5EFE6] p-1 rounded-xl w-full">
            <button
              onClick={() => {
                setIsLoginTab(true);
                setError("");
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg font-sans transition-all duration-300 cursor-pointer ${
                isLoginTab
                  ? "bg-[#B78A62] text-white shadow-md"
                  : "text-[#B78A62] hover:text-[#9E734D]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLoginTab(false);
                setError("");
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg font-sans transition-all duration-300 cursor-pointer ${
                !isLoginTab
                  ? "bg-[#B78A62] text-white shadow-md"
                  : "text-[#B78A62] hover:text-[#9E734D]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h2 className="font-serif text-3xl font-bold text-[#1C1512] tracking-wide">
              {isLoginTab ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="font-sans text-xs text-[#8C8682]">
              {isLoginTab
                ? "Sign in to access your orders and account details."
                : "Register to start shopping and tracking your orders."}
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border-l-2 border-red-500 rounded text-xs text-red-600 font-sans">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Name Field (Create Account Only) */}
              {!isLoginTab && (
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C8682]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#1C1512]/10 rounded-xl text-sm focus:outline-none focus:border-[#B78A62] font-sans transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C8682]" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#1C1512]/10 rounded-xl text-sm focus:outline-none focus:border-[#B78A62] font-sans transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    className="w-full pl-10 pr-10 py-3 bg-white border border-[#1C1512]/10 rounded-xl text-sm focus:outline-none focus:border-[#B78A62] font-sans transition-colors"
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

              {/* Forgot Password (Login Only) */}
              {isLoginTab && (
                <div className="text-right">
                  <a
                    href="#"
                    className="font-sans text-xs font-semibold text-[#B78A62] hover:text-[#9E734D] hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#B78A62] hover:bg-[#9E734D] text-white font-sans text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLoginTab ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>

            {/* Separator */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#1C1512]/10"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold font-sans text-[#8C8682] uppercase tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-[#1C1512]/10"></div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 bg-white border border-[#1C1512]/10 hover:border-[#1C1512]/30 text-[#1c1512] font-sans text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.6 15 1 12 1 7.3 1 3.4 3.7 1.5 7.7l3.9 3c.9-2.7 3.4-4.66 6.6-4.66z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.8-.07-1.56-.2-2.27H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.75-4.88 3.75-8.63z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.4 14.7a6.97 6.97 0 0 1 0-4.4l-3.9-3A11.96 11.96 0 0 0 1 12c0 1.8.4 3.5 1.1 5l4.3-3.3c-.6-.6-1-1.3-1.1-2z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-.97 7.97-2.63l-3.66-2.84c-1.1.74-2.5 1.18-4.31 1.18-3.2 0-5.7-1.96-6.6-4.66l-3.9 3c1.9 4 5.8 6.7 10.5 6.7z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
