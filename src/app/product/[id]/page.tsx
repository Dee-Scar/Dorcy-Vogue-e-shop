"use client";

import React, { useState, use, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { PRODUCTS, Product } from "@/data/products";
import { Minus, Plus, ArrowLeft, Heart, Share2, Play, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

// Helper color map for previewing color swatches
const COLOR_MAP: Record<string, string> = {
  "Wine Red": "#722F37",
  "Emerald Green": "#50C878",
  "Classic Black": "#1C1512",
  "Light Wash Indigo": "#A3C1AD",
  "Midnight Black": "#0F0F14",
  "Acid Gray": "#6D7278",
  "Optic White": "#FFFFFF",
  "Charcoal Gray": "#464646",
  "Nude Beige": "#EAE0D5",
  "Heather Gray": "#B2BEB5",
  "Oatmeal Beige": "#E5D3B3",
  "Forest Green": "#224A3B",
  "Vibrant Pattern": "#C19A6B",
  "Champagne Gold": "#F1E5AC",
  "Soft Rose": "#FFC0CB",
  "Ivory White": "#FFFFF0",
  "Caramel Tan": "#C68E17",
  "Navy Blue": "#000080",
  "Olive Green": "#808000",
  "Ecru Natural": "#F5F5DC",
  "Sage Green": "#87A96B",
  "Charcoal Black": "#36454F",
  "Vibrant Orange": "#FF5F1F",
  "Off-White": "#FAF9F6",
  "Washed Black": "#2C2C2C",
  "Natural Multi": "#D2B48C",
  "Beige Tan": "#B59073",
  "Deep Cocoa": "#5C4033",
  "Warm Cream": "#F6F1EA",
};

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Retrieve Product State
  const [product, setProduct] = useState<Product | undefined>(() => PRODUCTS.find((p) => p.id === id));
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) {
          const formatted: Product = {
            id: data.id,
            name: data.name,
            price: Number(data.price),
            formattedPrice: "₦" + Number(data.price).toLocaleString(),
            image: data.image,
            images: data.images || [],
            category: data.category,
            description: data.description,
            sizes: data.sizes || [],
            colors: data.colors || [],
            details: data.details || [],
            videoUrl: data.video_url || undefined
          };
          setProduct(formatted);
        }
      } catch (err) {
        console.error("Error fetching product details from database:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Dynamic state hooks (safely initialised if product exists)
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Automatically update active selection states when product is loaded
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "M");
      setSelectedColor(product.colors[0] || "");
    }
  }, [product]);

  // Fetch "You May Also Like" — other active products, preferring the same category.
  useEffect(() => {
    if (!product) return;
    async function fetchRelated() {
      try {
        const { data } = await supabase
          .from("products")
          .select("id,name,price,image,images,category,description,sizes,colors")
          .eq("status", "Active")
          .neq("id", product!.id)
          .limit(20);

        if (!data) return;
        const mapped: Product[] = data.map((p: Record<string, unknown>) => ({
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
        // Prefer same category, then fill with others, cap at 4.
        const sameCat = mapped.filter((p) => p.category === product!.category);
        const others = mapped.filter((p) => p.category !== product!.category);
        setRelatedProducts([...sameCat, ...others].slice(0, 4));
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
    }
    fetchRelated();
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col pt-[80px] bg-[#FAF7F2]">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#1C1512]">Product Not Found</h2>
          <p className="font-sans text-sm text-[#8C8682]">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/shop"
            className="px-6 py-2.5 bg-[#B78A62] text-white font-sans text-xs font-semibold rounded-lg hover:bg-[#9E734D] transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[activeImageIndex] || product.image,
        size: selectedSize,
        color: selectedColor,
      },
      quantity
    );
  };

  const handleQuantityIncrement = () => setQuantity((prev) => prev + 1);
  const handleQuantityDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <div className="min-h-screen flex flex-col pt-[80px] bg-[#FAF7F2] select-none">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-[#8C8682] hover:text-[#B78A62] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Image Gallery (Takes up 7 cols on Desktop) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Preview */}
            <div
              onClick={() => {
                if (!showVideo) setIsLightboxOpen(true);
              }}
              className={`aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-sm bg-white border border-[#1C1512]/5 relative ${!showVideo ? "cursor-zoom-in animate-none" : ""}`}
            >
              <AnimatePresence mode="wait">
                {showVideo && product.videoUrl ? (
                  <motion.div
                    key="video-preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full bg-black relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <video
                      src={product.videoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={product.images[activeImageIndex] || product.image}
                      alt={`${product.name} Preview`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Thumbnails Row */}
            <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none">
              {product.images.map((imgUrl, idx) => {
                const isActive = !showVideo && activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowVideo(false);
                      setActiveImageIndex(idx);
                    }}
                    className={`aspect-[4/3] w-24 rounded-xl overflow-hidden bg-white border flex-shrink-0 cursor-pointer transition-all duration-300 ${
                      isActive ? "border-[#B78A62] ring-2 ring-[#B78A62]/20" : "border-[#1C1512]/10 hover:border-[#B78A62]/50"
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={imgUrl}
                        alt={`${product.name} Thumbnail ${idx + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </div>
                  </button>
                );
              })}

              {product.videoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`aspect-[4/3] w-24 rounded-xl overflow-hidden bg-black/5 border flex-shrink-0 cursor-pointer transition-all duration-300 flex items-center justify-center relative ${
                    showVideo ? "border-[#B78A62] ring-2 ring-[#B78A62]/20" : "border-[#1C1512]/10 hover:border-[#B78A62]/50"
                  }`}
                >
                  {product.images[0] ? (
                    <div className="absolute inset-0 opacity-40">
                      <Image
                        src={product.images[0]}
                        alt="Video Thumbnail Background"
                        fill
                        sizes="120px"
                        className="object-cover blur-[1px]"
                      />
                    </div>
                  ) : null}
                  <div className="relative z-10 p-2 bg-white/90 rounded-full text-[#B78A62] shadow-sm">
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Content & Options (Takes up 5 cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Breadcrumbs */}
            <nav className="font-sans text-[11px] font-semibold text-[#8C8682] uppercase tracking-wider space-x-1.5 flex items-center">
              <Link href="/" className="hover:text-[#B78A62] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-[#B78A62] transition-colors">Women</Link>
              <span>/</span>
              <span className="text-[#1C1512]/50">{product.category}</span>
              <span>/</span>
              <span className="text-[#1C1512] font-bold">{product.name}</span>
            </nav>

            {/* Title & Price */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1512] tracking-wide leading-tight">
                {product.name}
              </h1>
              <p className="font-sans text-2xl font-extrabold text-[#B78A62]">
                {product.formattedPrice}
              </p>
            </div>

            {/* Description */}
            <p className="font-sans text-sm text-[#1C1512]/75 leading-relaxed">
              {product.description}
            </p>

            <hr className="border-[#1C1512]/10" />

            {/* Custom Selections */}
            <div className="space-y-5">
              
              {/* Size Selector */}
              <div className="space-y-2">
                <span className="block font-sans text-xs font-bold text-[#1C1512] uppercase tracking-wider">
                  Size
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2.5 text-xs font-semibold rounded-lg font-sans border transition-all duration-200 min-w-[50px] cursor-pointer ${
                          isSelected
                            ? "bg-[#B78A62] border-[#B78A62] text-white shadow-sm"
                            : "bg-white border-[#1C1512]/10 hover:border-[#1C1512]/30 text-[#1C1512]"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="space-y-2">
                  <span className="block font-sans text-xs font-bold text-[#1C1512] uppercase tracking-wider">
                    Color
                  </span>
                  <div className="flex items-center space-x-3.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color;
                      const swatchBg = COLOR_MAP[color] || "#C19A6B";
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center transition-all duration-300 relative cursor-pointer ${
                            isSelected
                              ? "border-[#B78A62] scale-110"
                              : "border-[#1C1512]/10 hover:border-[#1C1512]/30"
                          }`}
                          title={color}
                        >
                          <span
                            className="w-5.5 h-5.5 rounded-full block border border-black/5"
                            style={{ backgroundColor: swatchBg }}
                          />
                          {isSelected && (
                            <span className="absolute -inset-1 rounded-full border border-[#B78A62]/75 animate-ping opacity-45 pointer-events-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-2">
                <span className="block font-sans text-xs font-bold text-[#1C1512] uppercase tracking-wider">
                  Quantity
                </span>
                <div className="inline-flex items-center border border-[#1C1512]/10 rounded-lg bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={handleQuantityDecrement}
                    className="px-3 py-2.5 text-[#1C1512] hover:bg-[#FAF7F2] hover:text-[#B78A62] transition-colors cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-5 font-sans text-sm font-bold text-[#1C1512] min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleQuantityIncrement}
                    className="px-3 py-2.5 text-[#1C1512] hover:bg-[#FAF7F2] hover:text-[#B78A62] transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Actions Bar */}
            <div className="flex gap-3.5 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-grow py-4 bg-[#B78A62] hover:bg-[#9E734D] text-white font-sans text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center cursor-pointer"
              >
                Add to Cart
              </button>
              
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer ${
                  isWishlisted
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-[#1C1512]/10 hover:border-[#1C1512]/30 text-[#1C1512]"
                }`}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Product link copied to clipboard!");
                }}
                className="p-4 border border-[#1C1512]/10 hover:border-[#1C1512]/30 rounded-xl text-[#1C1512] transition-all duration-300 cursor-pointer"
                title="Share product"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            <hr className="border-[#1C1512]/10" />

            {/* Extra Details Accordion Preview */}
            <div className="space-y-3 font-sans text-xs">
              <h4 className="font-bold text-[#1C1512] uppercase tracking-wider">Product Highlights</h4>
              <ul className="list-disc pl-4 space-y-1 text-[#8C8682]">
                {product.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-20">
            <div className="flex flex-col gap-1 mb-8">
              <span className="font-sans text-xs font-bold text-[#B78A62] uppercase tracking-widest">
                Curated For You
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1512] tracking-wide">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Global Modals */}
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            {/* Close handler on backdrop click */}
            <div 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute inset-0 cursor-zoom-out"
            />
            
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-10"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Main Lightbox Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-5xl w-full aspect-[4/3] max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <Image
                src={product.images[activeImageIndex] || product.image}
                alt={product.name}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
