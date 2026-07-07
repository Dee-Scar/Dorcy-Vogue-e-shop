"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { ArrowLeft, ImagePlus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", hex: "#1C1512" },
  { name: "White", hex: "#F5EFE6" },
  { name: "Tan", hex: "#C9956A" },
  { name: "Dark Green", hex: "#2D4A3E" },
  { name: "Navy", hex: "#1B2A4A" },
];
const FALLBACK_CATEGORIES = ["Jeans", "Dresses", "Bags", "Tops", "Slides", "Two Piece Sets"];

function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["M", "L"]);
  const [selectedColors, setSelectedColors] = useState<string[]>(["Black"]);
  const [status, setStatus] = useState("Active");
  const [images, setImages] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch categories from the database
    async function fetchCategories() {
      const { data } = await supabase
        .from("categories")
        .select("name")
        .eq("status", "Active")
        .order("name");
      if (data) setDbCategories(data.map(c => c.name));
    }
    fetchCategories();

    if (productId) {
      async function fetchProduct() {
        try {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();

          if (error) throw error;

          if (data) {
            setName(data.name || "");
            setDescription(data.description || "");
            setPrice(data.price?.toString() || "");
            setCategory(data.category || "");
            setStock(data.stock?.toString() || "");
            setStatus(data.status || "Active");
            setSelectedSizes(data.sizes || []);
            setSelectedColors(data.colors || []);
            setImages(data.images || [data.image].filter(Boolean));
          }
        } catch (err) {
          console.error("Error fetching product:", err);
        } finally {
          setLoading(false);
        }
      }
      fetchProduct();
    }
  }, [productId]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const readers = Array.from(files).slice(0, 4 - images.length);
    readers.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImages((prev) => [...prev, result].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageFiles(e.dataTransfer.files);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const productData = {
        id: productId || `p${Date.now()}`,
        name,
        description,
        price: Number(price) || 0,
        category,
        stock: Number(stock) || 0,
        status,
        sizes: selectedSizes,
        colors: selectedColors,
        image: images[0] || "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
        images: images,
      };

      if (productId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);
        if (error) throw error;
      }

      alert("Product saved successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9956A]" />
      </div>
    );
  }

  return (
    <>
      <header className="py-3 sm:h-16 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 flex-shrink-0 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <MobileMenuButton />
          <Link
            href="/admin/products"
            className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-[#FAF7F2] rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512] truncate max-w-[200px] sm:max-w-none">
            {productId ? "Edit Product" : "Add New Product"}
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            href="/admin/products"
            className="flex-1 sm:flex-none text-center px-4 sm:px-5 py-2 bg-white border border-gray-200 hover:border-gray-300 text-[#1C1512] text-sm font-semibold font-sans rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            form="product-form"
            type="submit"
            disabled={saving}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Product
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <form id="product-form" onSubmit={handleSave}>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="font-sans text-base font-semibold text-[#1C1512]">Basic Information</h2>

                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter product description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                    className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors resize-none"
                  />
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                      Price (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                      Compare at Price (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
                    />
                  </div>
                </div>

                {/* Category & Stock Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select category...</option>
                      {(dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      min="0"
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="font-sans text-base font-semibold text-[#1C1512]">Variants</h2>

                {/* Sizes */}
                <div className="space-y-2.5">
                  <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Available Sizes
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {SIZES.map((size) => {
                      const active = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`px-4 py-1.5 rounded-lg border text-sm font-semibold font-sans transition-all cursor-pointer ${
                            active
                              ? "bg-[#C9956A] border-[#C9956A] text-white"
                              : "bg-white border-gray-200 text-[#8C8682] hover:border-[#C9956A] hover:text-[#C9956A]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2.5">
                  <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Available Colors
                  </label>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {COLORS.map((color) => {
                      const active = selectedColors.includes(color.name);
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => toggleColor(color.name)}
                          title={color.name}
                          className={`w-9 h-9 rounded-full transition-all cursor-pointer flex-shrink-0 ${
                            active
                              ? "ring-2 ring-offset-2 ring-[#C9956A] scale-110"
                              : "ring-1 ring-gray-200 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Product Images */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h2 className="font-sans text-base font-semibold text-[#1C1512]">Product Images</h2>

                {/* Upload Area */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#C9956A] bg-[#FAF7F2]"
                      : "border-gray-200 hover:border-[#C9956A] hover:bg-[#FAF7F2]/50"
                  }`}
                >
                  <ImagePlus className="h-7 w-7 text-[#8C8682]" />
                  <p className="font-sans text-xs text-[#8C8682] text-center leading-relaxed">
                    Click or drag to upload<br />
                    <span className="text-[10px]">JPG, PNG up to 5MB</span>
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files)}
                  />
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-[#FAF7F2] border border-gray-200 overflow-hidden relative"
                    >
                      {images[i] ? (
                        <>
                          <img src={images[i]} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center cursor-pointer"
                          >
                            <X className="h-2.5 w-2.5 text-white" />
                          </button>
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <h2 className="font-sans text-base font-semibold text-[#1C1512]">Status</h2>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors appearance-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}

export default function AddNewProductPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#C9956A]" /></div>}>
        <ProductForm />
      </Suspense>
    </div>
  );
}
