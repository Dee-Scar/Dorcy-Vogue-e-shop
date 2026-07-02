"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, User as UserIcon, Menu, X, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const { toggleCart, cartCount } = useCart();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "Categories", href: "/#categories" },
    { name: "Track Order", href: "/track" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-[#FAF7F2]/20 shadow-sm py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Navbar Layout */}
          <div className="flex md:hidden items-center justify-between w-full">
            {/* Left: Hamburger menu */}
            <div className="flex-1 flex justify-start">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 bg-white shadow-sm border border-[#1C1512]/5 rounded-full text-[#1C1512] hover:text-[#B78A62] transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Middle: Logo */}
            <div className="flex-shrink-0 text-center">
              <Link
                href="/"
                className="font-serif text-xl font-bold tracking-wider text-[#1C1512] transition-colors hover:text-[#B78A62]"
              >
                DORCY VOGUE
              </Link>
            </div>

            {/* Right: Actions (Sign In + Cart) */}
            <div className="flex-1 flex items-center justify-end space-x-2">
              {/* Profile / Sign In */}
              {user ? (
                <Link
                  href="/profile"
                  className="p-2 bg-white shadow-sm border border-[#1C1512]/5 rounded-full text-[#1C1512] hover:text-[#B78A62] transition-all duration-300"
                  title={`Hi, ${user.name}`}
                >
                  <UserIcon className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="p-2 bg-white shadow-sm border border-[#1C1512]/5 rounded-full text-[#1C1512] hover:text-[#B78A62] transition-all duration-300"
                  title="Sign In"
                >
                  <UserIcon className="h-5 w-5" />
                </Link>
              )}

              {/* Cart Toggle */}
              <button
                onClick={toggleCart}
                className="relative p-2 bg-white shadow-sm border border-[#1C1512]/5 hover:border-[#B78A62]/30 rounded-full text-[#1C1512] hover:text-[#B78A62] hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B78A62] text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navbar Layout */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="font-serif text-2xl font-bold tracking-wider text-[#1C1512] transition-colors hover:text-[#B78A62]"
              >
                DORCY VOGUE
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-sans text-sm font-medium tracking-wide text-[#1C1512] hover:text-[#B78A62] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Profile */}
              {user ? (
                <div className="flex items-center space-x-1.5">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-1 hover:text-[#B78A62] transition-colors"
                  >
                    <span className="hidden sm:inline font-sans text-sm font-semibold text-[#1C1512] cursor-pointer hover:text-[#B78A62]">
                      Hi, {user.name.split(" ")[0]}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    title="Log Out"
                    className="p-2 hover:bg-[#FAF7F2] rounded-full text-[#1C1512] hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2 border border-[#B78A62]/30 hover:border-[#B78A62] text-sm font-medium rounded-full text-[#1C1512] hover:bg-[#B78A62] hover:text-white transition-all duration-300"
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* Cart Toggle */}
              <button
                onClick={toggleCart}
                className="relative p-2.5 bg-white shadow-sm border border-[#1C1512]/5 hover:border-[#B78A62]/30 rounded-full text-[#1C1512] hover:text-[#B78A62] hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B78A62] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[73px] left-0 w-full bg-white z-30 shadow-lg border-b border-[#FAF7F2] md:hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-base font-medium text-[#1C1512] hover:bg-[#FAF7F2] hover:text-[#B78A62] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
