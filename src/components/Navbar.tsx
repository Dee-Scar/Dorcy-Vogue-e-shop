"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ShoppingBag, User as UserIcon, Menu, X, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnnouncementMarquee } from "./AnnouncementMarquee";

function NavbarContent() {
  const { toggleCart, cartCount } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Track hash changes for anchor links
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    // Set initial hash
    setActiveHash(window.location.hash);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("hashchange", handleHashChange);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "New Arrivals", href: "/shop?filter=new" },
    { name: "Categories", href: "/#categories" },
    { name: "Track Order", href: "/track" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  // Helper to check if link is active
  const isActiveLink = (href: string) => {
    // Check for query parameters (e.g., /shop?filter=new)
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      if (pathname !== path) return false;
      // Check if the query param matches
      const params = new URLSearchParams(query);
      for (const [key, value] of params.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
      return true;
    }
    // Check for hash-based links (e.g., /#categories)
    if (href.includes("#")) {
      const hash = href.split("#")[1];
      return pathname === "/" && activeHash === `#${hash}`;
    }
    // Regular path matching
    if (href === "/") return pathname === "/" && !activeHash;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Announcement Marquee */}
      <AnnouncementMarquee />
      
      <header
        className={`fixed top-[40px] left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-[#FAF7F2]/20 shadow-sm py-2"
            : "bg-transparent py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Navbar Layout */}
          <div className="flex md:hidden items-center justify-between w-full">
            {/* Left: Logo with Tagline */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <div className="font-serif text-xl font-bold tracking-wider text-[#1C1512] transition-colors hover:text-[#B78A62]">
                  DORCY VOGUE
                </div>
                <div className="font-sans text-[9px] tracking-widest text-[#1C1512]/60">
                  Style Beyond Gender
                </div>
              </Link>
            </div>

            {/* Right: User, Cart, and Hamburger */}
            <div className="flex items-center space-x-2">
              {/* User Icon */}
              {user ? (
                <Link
                  href="/profile"
                  className="p-2 text-[#1C1512] hover:text-[#B78A62] transition-colors"
                  title={`Hi, ${user.name}`}
                >
                  <UserIcon className="h-6 w-6" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-[#1C1512] hover:text-[#B78A62] transition-colors"
                  title="Sign In"
                >
                  <UserIcon className="h-6 w-6" />
                </Link>
              )}

              {/* Cart Icon */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-[#1C1512] hover:text-[#B78A62] transition-colors cursor-pointer"
              >
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#1C1512] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-white px-1">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Hamburger Menu */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-[#1C1512] hover:text-[#B78A62] transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Navbar Layout */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Logo with Tagline */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <div className="font-serif text-2xl font-bold tracking-wider text-[#1C1512] transition-colors hover:text-[#B78A62]">
                  DORCY VOGUE
                </div>
                <div className="font-sans text-xs tracking-widest text-[#1C1512]/60 mt-0.5">
                  Style Beyond Gender
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
              <Link
                href="/"
                className={`font-sans text-sm font-medium tracking-wide text-[#1C1512] hover:text-[#B78A62] transition-colors ${
                  isActiveLink("/") ? "border-b-2 border-[#1C1512] pb-1" : "pb-1"
                }`}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`font-sans text-sm font-medium tracking-wide text-[#1C1512] hover:text-[#B78A62] transition-colors ${
                  isActiveLink("/shop") ? "border-b-2 border-[#1C1512] pb-1" : "pb-1"
                }`}
              >
                Shop
              </Link>
              <Link
                href="/shop?filter=new"
                className={`font-sans text-sm font-medium tracking-wide text-[#1C1512] hover:text-[#B78A62] transition-colors ${
                  isActiveLink("/shop?filter=new") ? "border-b-2 border-[#1C1512] pb-1" : "pb-1"
                }`}
              >
                New Arrivals
              </Link>
              <Link
                href="/#categories"
                className={`font-sans text-sm font-medium tracking-wide text-[#1C1512] hover:text-[#B78A62] transition-colors ${
                  isActiveLink("/#categories") ? "border-b-2 border-[#1C1512] pb-1" : "pb-1"
                }`}
              >
                Categories
              </Link>
              <Link
                href="/track"
                className={`font-sans text-sm font-medium tracking-wide text-[#1C1512] hover:text-[#B78A62] transition-colors ${
                  isActiveLink("/track") ? "border-b-2 border-[#1C1512] pb-1" : "pb-1"
                }`}
              >
                Track Order
              </Link>
              <Link
                href="/faq"
                className={`font-sans text-sm font-medium tracking-wide text-[#1C1512] hover:text-[#B78A62] transition-colors ${
                  isActiveLink("/faq") ? "border-b-2 border-[#1C1512] pb-1" : "pb-1"
                }`}
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className={`font-sans text-sm font-medium tracking-wide text-[#1C1512] hover:text-[#B78A62] transition-colors ${
                  isActiveLink("/contact") ? "border-b-2 border-[#1C1512] pb-1" : "pb-1"
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Actions - Right Side */}
            <div className="flex items-center space-x-3">
              {/* User Icon */}
              {user ? (
                <Link
                  href="/profile"
                  className="p-2 hover:bg-[#FAF7F2] rounded-full text-[#1C1512] hover:text-[#B78A62] transition-colors"
                  title={`Hi, ${user.name}`}
                >
                  <UserIcon className="h-6 w-6" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="p-2 hover:bg-[#FAF7F2] rounded-full text-[#1C1512] hover:text-[#B78A62] transition-colors"
                  title="Sign In"
                >
                  <UserIcon className="h-6 w-6" />
                </Link>
              )}

              {/* Cart Icon with Badge */}
              <button
                onClick={toggleCart}
                className="relative p-2 hover:bg-[#FAF7F2] rounded-full text-[#1C1512] hover:text-[#B78A62] transition-colors cursor-pointer"
              >
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#1C1512] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-white px-1">
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
            className="fixed top-[90px] left-0 w-full bg-white z-30 shadow-lg border-b border-[#FAF7F2] md:hidden"
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

              {/* Auth section in mobile menu */}
              <div className="pt-2 border-t border-[#FAF7F2]">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium text-[#1C1512] hover:bg-[#FAF7F2] hover:text-[#B78A62] transition-colors"
                    >
                      <UserIcon className="h-5 w-5 text-[#B78A62]" />
                      Hi, {user.name.split(" ")[0]}
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-base font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium text-[#1C1512] hover:bg-[#FAF7F2] hover:text-[#B78A62] transition-colors"
                  >
                    <UserIcon className="h-5 w-5 text-[#B78A62]" />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Wrapper component with Suspense boundary
export const Navbar = () => {
  return (
    <Suspense fallback={
      <>
        <AnnouncementMarquee />
        <header className="fixed top-[40px] left-0 w-full z-40 bg-transparent py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between w-full">
              <div className="font-serif text-2xl font-bold tracking-wider text-[#1C1512]">
                DORCY VOGUE
              </div>
            </div>
          </div>
        </header>
      </>
    }>
      <NavbarContent />
    </Suspense>
  );
};
