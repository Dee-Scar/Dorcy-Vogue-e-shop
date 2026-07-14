"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { ProductCard, Product } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { QuickViewModal } from "@/components/QuickViewModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ArrowRight, Sparkles, Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

// Mock Images for Categories if no image provided (fallback)
const CAT_IMAGES: Record<string, string> = {
  "Baggy Jeans": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
  "Dresses": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
  "Joggers": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80",
  "Accessories": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
  "Basic Tops": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
  "Casual Wears": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
};

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cmsSettings, setCmsSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cmsRes, productsRes, categoriesRes] = await Promise.all([
          supabase.from("cms_settings").select("*").eq("id", 1).single(),
          supabase
            .from("products")
            .select("id,name,price,image,images,category,description,sizes,colors")
            .eq("status", "Active"),
          supabase.from("categories").select("*").eq("status", "Active")
        ]);

        if (cmsRes.data) setCmsSettings(cmsRes.data);
        if (productsRes.data) {
          const mapped: Product[] = productsRes.data.map((p: Record<string, unknown>) => ({
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
          }));
          setProducts(mapped);
        }
        if (categoriesRes.data) setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Use CMS data or fallbacks
  const featuredNames = cmsSettings?.featured_products || [];
  const featuredProducts = products.filter(p => featuredNames.includes(p.name));
  
  const filteredProducts =
    categoryFilter === "All"
      ? featuredProducts
      : featuredProducts.filter((p) => p.category === categoryFilter);

  const activeSlides = cmsSettings?.hero_slides?.filter((s: any) => s.status === "Active") || [];
  const slidesToRender = activeSlides.length > 0 ? activeSlides : [
    {
      id: 1,
      title: "Elevate Your Style",
      subtitle: "Discover premium fashion that speaks to your unique sense of style. Curated collections for the modern fashionista.",
      image: "/hero-store.jpg"
    }
  ];

  useEffect(() => {
    if (slidesToRender.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesToRender.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slidesToRender.length]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => {
      setNewsletterSubscribed(false);
    }, 4000);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-[#FAF7F2]">Loading...</div>;
  }

  const aboutTitle = cmsSettings?.about_title || "About DORCY VOGUE";
  const aboutDesc = cmsSettings?.about_description || "DORCY VOGUE is a premium fashion brand offering stylish, affordable clothing for the modern Nigerian woman.";
  const contactPhone = cmsSettings?.contact_phone || "08012345678";
  const contactEmail = cmsSettings?.contact_email || "hello@dorcyvogue.com";

  // Build unique category filters for featured products
  const availableCategories = ["All", ...Array.from(new Set(featuredProducts.map(p => p.category)))];

  return (
    <div className="flex-grow flex flex-col pt-[70px]">
      {/* Navigation Headers */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[90vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-black">
        {/* Background Image with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={slidesToRender[currentSlide]?.image || "/hero-store.jpg"}
              alt={slidesToRender[currentSlide]?.title || "Hero Slide"}
              fill
              priority
              sizes="100vw"
              className="object-cover brightness-[0.45]"
            />
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1512]/70 via-[#1C1512]/25 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content with AnimatePresence */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-4"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-[#B78A62] tracking-wider uppercase border border-white/10">
                <Sparkles className="h-3.5 w-3.5" /> High-End Nigerian Fashion
              </span>
              <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-wide text-white leading-tight">
                {slidesToRender[currentSlide]?.title}
              </h1>
              <p className="font-sans text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                {slidesToRender[currentSlide]?.subtitle || "Discover premium fashion that speaks to your unique sense of style. Curated collections for the modern fashionista."}
              </p>
              
              <div className="pt-2">
                <a
                  href="/shop"
                  className="inline-block px-8 py-4 bg-[#B78A62] hover:bg-[#9E734D] text-white font-sans text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Shop Now
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots if multiple slides */}
        {slidesToRender.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
            {slidesToRender.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? "bg-[#B78A62] w-6" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="font-sans text-xs font-bold text-[#B78A62] uppercase tracking-widest">
                Our Collection
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1512] mt-2">
                Featured Products
              </h2>
            </div>
            
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0 overflow-x-auto pb-2 scrollbar-none">
              {availableCategories.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCategoryFilter(tab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full font-sans transition-all duration-200 border cursor-pointer ${
                    categoryFilter === tab
                      ? "border-[#B78A62] bg-[#B78A62] text-white shadow-sm"
                      : "border-[#1C1512]/10 hover:border-[#1C1512]/30 text-[#1C1512]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
             <div className="text-center py-10 text-gray-500">No featured products selected in CMS.</div>
          )}
        </div>
      </section>

      {/* Why Shop With Us Section */}
      <section className="py-16 bg-[#FAF7F2] border-t border-[#1C1512]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold text-[#1C1512] tracking-wide">
              Why Shop With Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                ),
                title: "Free Shipping",
                text: "Complimentary delivery on all orders over ₦50,000",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Secure Payment",
                text: "Your transactions are protected with bank-level security",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
                  </svg>
                ),
                title: "Easy Returns",
                text: "Hassle-free returns within 14 days of purchase",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: "24/7 Support",
                text: "Our team is always here to help you shop with confidence",
              },
            ].map((feature, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                key={idx}
                className="bg-white p-6 rounded-xl text-center space-y-4 border border-[#1C1512]/5 hover:shadow-md transition-shadow"
              >
                <div className="inline-flex p-3 bg-[#FAF7F2] text-[#B78A62] rounded-full">
                  {feature.icon}
                </div>
                <h3 className="font-sans text-base font-bold text-[#1C1512]">{feature.title}</h3>
                <p className="font-sans text-xs text-[#8C8682] leading-relaxed">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section id="categories" className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-sans text-xs font-bold text-[#B78A62] uppercase tracking-widest">
              Curated Collections
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1512] mt-2">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.slice(0, 6).map((cat, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                key={cat.name}
                onClick={() => {
                  window.location.href = `/shop?category=${encodeURIComponent(cat.name)}`;
                }}
                className="group relative h-[300px] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
              >
                {/* Background image */}
                <Image
                  src={CAT_IMAGES[cat.name] || CAT_IMAGES["Basic Tops"]}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Black Overlay */}
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/40 transition-colors duration-300" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                    {cat.name}
                  </h3>
                  <span className="font-sans text-xs font-semibold text-[#B78A62] mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore items <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About DORCY VOGUE Section */}
      <section className="py-20 bg-[#FAF7F2] border-t border-[#1C1512]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="w-12 h-1 bg-[#B78A62]" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1512] leading-tight">
                {aboutTitle}
              </h2>
              <p className="font-sans text-base text-[#1C1512]/80 leading-relaxed whitespace-pre-wrap">
                {aboutDesc}
              </p>
              <div>
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 font-sans text-sm font-bold text-[#B78A62] hover:text-[#9E734D] transition-colors"
                >
                  Explore Our Heritage <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>

            {/* Illustration/Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-[#FAF7F2] border border-[#1C1512]/5"
            >
              <Image
                src="/about-photo.jpg"
                alt="Dorcy Vogue Brand Model with Shopping Bags"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[#1C1512] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B78A62]/10 via-transparent to-transparent opacity-60" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 space-y-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-wide">
            Join the DORCY VOGUE Family
          </h2>
          <p className="font-sans text-sm text-[#FAF7F2]/75 max-w-xl mx-auto leading-relaxed">
            Be the first to know about new arrivals, exclusive offers, and style inspiration delivered straight to your inbox.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-grow px-5 py-3.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#B78A62] font-sans"
            />
            <button
              type="submit"
              disabled={newsletterSubscribed}
              className={`px-6 py-3.5 font-sans text-sm font-semibold rounded-lg shadow-md cursor-pointer transition-colors text-center shrink-0 flex items-center justify-center gap-1.5 ${
                newsletterSubscribed
                  ? "bg-green-600 text-white"
                  : "bg-[#B78A62] text-white hover:bg-[#9E734D]"
              }`}
            >
              {newsletterSubscribed ? (
                <>
                  <Check className="h-4 w-4" /> Subscribed
                </>
              ) : (
                <>
                  Subscribe <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="footer" className="bg-[#120E0D] text-white/60 py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 font-sans text-sm">
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-white tracking-wider">
              DORCY VOGUE
            </h3>
            <p className="text-xs max-w-xs leading-relaxed">
              Premium Nigerian Fashion Brand celebrating African silhouettes with a modern twist. Elevate your everyday style.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="/shop" className="hover:text-white transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition-colors">
                  Categories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Track Order
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                  {contactEmail}
                </a>
              </li>
              <li>
                <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">
                  {contactPhone}
                </a>
              </li>
              <li className="text-white/45">
                Lagos, Nigeria
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">
              Follow Us
            </h4>
            <div className="flex space-x-3.5">
              {[
                {
                  name: "Instagram",
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
                {
                  name: "Twitter",
                  icon: (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  name: "Facebook",
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="p-2.5 bg-white/5 hover:bg-[#B78A62] hover:text-white text-white/70 rounded-full transition-all duration-300"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 mt-12 pt-8 text-center text-xs">
          <p>© {new Date().getFullYear()} DORCY VOGUE. All rights reserved.</p>
        </div>
      </footer>

      {/* Global Modals */}
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
      <QuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
