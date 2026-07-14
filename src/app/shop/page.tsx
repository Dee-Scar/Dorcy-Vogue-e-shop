"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { QuickViewModal } from "@/components/QuickViewModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Search, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { PRODUCTS, Product } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Baggy Jeans",
  "Dresses",
  "Joggers",
  "Accessories",
  "Basic Tops",
  "Casual Wears",
  "T-Shirts",
];

export default function ShopPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Products from Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData(silent = false) {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }).then((r) => r.json()),
        supabase.from("categories").select("name").eq("status", "Active"),
      ]);

      if (catRes.error) throw catRes.error;

      if (prodRes.products) {
        const formatted: Product[] = prodRes.products.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: p.name as string,
          price: Number(p.price),
          formattedPrice: "₦" + Number(p.price).toLocaleString(),
          image: p.image as string,
          images: (p.images as string[]) || [],
          category: p.category as string,
          description: (p.description as string) || "",
          sizes: (p.sizes as string[]) || [],
          colors: (p.colors as string[]) || [],
          details: [],
          status: (p.status as string) || "Active",
        }));
        setProducts(formatted);
      }

      if (catRes.data) {
        setDbCategories(catRes.data.map((c: any) => c.name));
      }
    } catch (err) {
      console.error("Error fetching shop data from database:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();

    // Refetch silently whenever the tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchData(true);
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Also poll every 60 seconds in the background
    const interval = setInterval(() => fetchData(true), 60000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
    };
  }, []);

  // Filtering & Sorting States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Honor category deep-link from the home page (e.g. /shop?category=Dresses)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setSelectedCategories([cat]);
  }, []);

  // Handle category check toggle
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setSortBy("newest");
  };

  // Filter Logic
  const filteredProducts = products.filter((product) => {
    // Category match
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    // Search match
    if (
      searchQuery &&
      !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !product.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // Price range match
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    if (product.price < min || product.price > max) {
      return false;
    }
    return true;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.price - b.price;
    }
    if (sortBy === "price-high") {
      return b.price - a.price;
    }
    if (sortBy === "name-az") {
      return a.name.localeCompare(b.name);
    }
    // "newest" / default: preserve mock data order (highest ID first or natural array order)
    return 0;
  });

  return (
    <div className="flex-grow flex flex-col pt-[80px] bg-[#FAF7F2] min-h-screen">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 1. Sidebar - Desktop Filters */}
          <aside className="hidden lg:block w-[240px] shrink-0 space-y-8 select-none">
            {/* Categories Section */}
            <div className="space-y-4">
              <h3 className="font-sans text-xs font-bold text-[#1C1512] uppercase tracking-wider">
                Categories
              </h3>
              <div className="space-y-2.5">
                {(dbCategories.length > 0 ? dbCategories : CATEGORIES).map((category) => {
                  const isChecked = selectedCategories.includes(category);
                  return (
                    <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded border-[#1C1512]/20 text-[#B78A62] focus:ring-[#B78A62] w-4 h-4 cursor-pointer accent-[#B78A62]"
                      />
                      <span className="font-sans text-sm text-[#1C1512]/75 group-hover:text-[#B78A62] transition-colors">
                        {category}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#1C1512]/10" />

            {/* Price Range Section */}
            <div className="space-y-4">
              <h3 className="font-sans text-xs font-bold text-[#1C1512] uppercase tracking-wider">
                Price Range
              </h3>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2.5 text-xs text-[#8C8682]">₦</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full pl-6 pr-2 py-2 bg-white border border-[#1C1512]/10 rounded-lg text-xs focus:outline-none focus:border-[#B78A62] font-sans"
                  />
                </div>
                <span className="text-[#8C8682] text-xs font-semibold">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2.5 text-xs text-[#8C8682]">₦</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full pl-6 pr-2 py-2 bg-white border border-[#1C1512]/10 rounded-lg text-xs focus:outline-none focus:border-[#B78A62] font-sans"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#1C1512]/10" />

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="w-full py-2 bg-white border border-[#1C1512]/10 hover:border-[#B78A62]/30 rounded-lg font-sans text-xs font-semibold text-[#1C1512] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </aside>

          {/* 2. Main Content Catalog Grid */}
          <div className="flex-grow space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col gap-1">
              <nav className="flex items-center space-x-2 text-xs text-[#8C8682] font-sans">
                <Link href="/" className="hover:text-[#B78A62] transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-[#1C1512] font-medium">Shop</span>
              </nav>
              <div className="flex items-center justify-between mt-1">
                <h1 className="font-serif text-3xl font-bold text-[#1C1512] tracking-wide">
                  Shop
                </h1>
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center space-x-1.5 px-4 py-2 border border-[#1C1512]/10 rounded-full text-xs font-semibold font-sans bg-white text-[#1C1512] shadow-sm cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Search and Sort Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search input */}
              <div className="relative flex-grow sm:max-w-md">
                <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-[#8C8682]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#1C1512]/10 rounded-xl text-sm focus:outline-none focus:border-[#B78A62] font-sans shadow-sm"
                />
              </div>

              {/* Sort selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-white border border-[#1C1512]/10 rounded-xl text-sm font-sans text-[#1C1512] focus:outline-none focus:border-[#B78A62] shadow-sm cursor-pointer"
                >
                  <option value="newest">Sort by: Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-az">Name: A-Z</option>
                </select>
                <ChevronDown className="absolute right-3 top-4 h-4.5 w-4.5 text-[#8C8682] pointer-events-none" />
              </div>
            </div>

            {/* Grid display */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 pt-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden border border-[#1C1512]/5 animate-pulse">
                    <div className="aspect-[4/5] w-full bg-[#1C1512]/5" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-[#1C1512]/5 rounded w-3/4" />
                      <div className="h-4 bg-[#1C1512]/5 rounded w-1/3" />
                      <div className="h-10 bg-[#1C1512]/5 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <p className="font-sans text-base text-[#8C8682]">
                  {products.length === 0
                    ? "No products available yet. Please check back soon."
                    : "No products matched your search or filters."}
                </p>
                {products.length > 0 && (
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2.5 bg-[#B78A62] text-white font-sans text-xs font-semibold rounded-lg hover:bg-[#9E734D] transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 pt-2">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. Mobile Filters Slide-Out Overlay Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 overflow-hidden flex lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black cursor-pointer"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-[#1C1512]">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:bg-[#FAF7F2] rounded-full text-[#1C1512] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Categories Section */}
              <div className="space-y-4">
                <h3 className="font-sans text-xs font-bold text-[#1C1512] uppercase tracking-wider">
                  Categories
                </h3>
                <div className="space-y-3">
                  {(dbCategories.length > 0 ? dbCategories : CATEGORIES).map((category) => {
                    const isChecked = selectedCategories.includes(category);
                    return (
                      <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCategoryToggle(category)}
                          className="rounded border-[#1C1512]/20 text-[#B78A62] focus:ring-[#B78A62] w-4.5 h-4.5 cursor-pointer accent-[#B78A62]"
                        />
                        <span className="font-sans text-sm text-[#1C1512]/75">
                          {category}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <hr className="border-[#1C1512]/10" />

              {/* Price Range Section */}
              <div className="space-y-4">
                <h3 className="font-sans text-xs font-bold text-[#1C1512] uppercase tracking-wider">
                  Price Range
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-2.5 text-xs text-[#8C8682]">₦</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full pl-6 pr-2 py-2 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-xs focus:outline-none focus:border-[#B78A62] font-sans"
                    />
                  </div>
                  <span className="text-[#8C8682] text-xs font-semibold">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-2.5 text-xs text-[#8C8682]">₦</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full pl-6 pr-2 py-2 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-xs focus:outline-none focus:border-[#B78A62] font-sans"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-[#1C1512]/10" />

              <div className="pt-2 space-y-3">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-[#B78A62] text-white font-sans text-sm font-semibold rounded-lg hover:bg-[#9E734D] transition-colors cursor-pointer text-center shadow"
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="w-full py-3 bg-white border border-[#1C1512]/10 rounded-lg font-sans text-sm font-semibold text-[#1C1512] transition-colors cursor-pointer text-center"
                >
                  Reset All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
      <QuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
