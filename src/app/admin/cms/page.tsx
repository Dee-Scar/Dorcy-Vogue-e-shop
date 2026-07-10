"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Edit2, Eye, Globe, Plus, Trash2, CheckCircle, HelpCircle, Phone, Mail, MapPin, Sparkles, Sliders, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  status: "Active" | "Draft";
}

interface FAQSection {
  id: number;
  title: string;
  questionsCount: number;
}

interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

export default function CMSPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutDescription, setAboutDescription] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    whatsapp: "",
    address: "",
  });
  const [faqSections, setFaqSections] = useState<FAQSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Slide Modal States
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [slideTitle, setSlideTitle] = useState("");
  const [slideSubtitle, setSlideSubtitle] = useState("");
  const [slideImage, setSlideImage] = useState("");
  const [slideStatus, setSlideStatus] = useState<"Active" | "Draft">("Active");
  const [uploadingSlideImage, setUploadingSlideImage] = useState(false);

  // Featured Products picker
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [featuredSearch, setFeaturedSearch] = useState("");

  const openFeaturedModal = async () => {
    setShowFeaturedModal(true);
    if (catalog.length === 0) {
      setCatalogLoading(true);
      const { data } = await supabase
        .from("products")
        .select("id,name,category,price,image")
        .order("created_at", { ascending: false });
      if (data) setCatalog(data as CatalogProduct[]);
      setCatalogLoading(false);
    }
  };

  const toggleFeatured = (name: string) => {
    setFeaturedProducts((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  useEffect(() => {
    async function fetchCMS() {
      try {
        const { data, error } = await supabase
          .from("cms_settings")
          .select("*")
          .eq("id", 1)
          .single();

        if (error) throw error;

        if (data) {
          setSlides(data.hero_slides || []);
          setAboutTitle(data.about_title || "");
          setAboutDescription(data.about_description || "");
          setFeaturedProducts(data.featured_products || []);
          setContactInfo({
            phone: data.contact_phone || "",
            email: data.contact_email || "",
            whatsapp: data.contact_whatsapp || "",
            address: data.contact_address || "",
          });
          setFaqSections(data.faq_sections || []);
        }
      } catch (err) {
        console.error("Error fetching CMS settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCMS();
  }, []);

  const handlePublish = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("cms_settings")
        .update({
          hero_slides: slides,
          about_title: aboutTitle,
          about_description: aboutDescription,
          featured_products: featuredProducts,
          contact_phone: contactInfo.phone,
          contact_email: contactInfo.email,
          contact_whatsapp: contactInfo.whatsapp,
          contact_address: contactInfo.address,
          faq_sections: faqSections,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) throw error;
      alert("CMS content published live successfully!");
    } catch (err) {
      console.error("Error publishing CMS:", err);
      alert("Failed to publish content.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open("/", "_blank");
  };

  const openSlideModal = (slide?: Slide) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideTitle(slide.title);
      setSlideSubtitle(slide.subtitle || "");
      setSlideImage(slide.image || "");
      setSlideStatus(slide.status);
    } else {
      setEditingSlide(null);
      setSlideTitle("");
      setSlideSubtitle("");
      setSlideImage("");
      setSlideStatus("Active");
    }
    setShowSlideModal(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle.trim()) return;

    if (editingSlide) {
      setSlides((prev) =>
        prev.map((s) =>
          s.id === editingSlide.id
            ? {
                ...s,
                title: slideTitle.trim(),
                subtitle: slideSubtitle.trim(),
                image: slideImage.trim(),
                status: slideStatus,
              }
            : s
        )
      );
    } else {
      const newSlide: Slide = {
        id: Date.now(),
        title: slideTitle.trim(),
        subtitle: slideSubtitle.trim(),
        image: slideImage.trim(),
        status: slideStatus,
      };
      setSlides((prev) => [...prev, newSlide]);
    }
    setShowSlideModal(false);
  };

  const handleDeleteSlide = (id: number) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      setSlides((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is larger than 5MB. Please choose a smaller one.");
      return;
    }
    setUploadingSlideImage(true);
    try {
      // Direct-to-Storage upload via a signed token (bypasses Vercel's body limit).
      const ext = file.name.split(".").pop() || "bin";
      const signRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: "product-images", ext }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Could not start upload");

      const { error } = await supabase.storage
        .from("product-images")
        .uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type });
      if (error) throw new Error(error.message);

      setSlideImage(sign.publicUrl);
    } catch (err) {
      console.error("Error uploading slide image:", err);
      alert(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploadingSlideImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <header className="py-3 sm:h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <MobileMenuButton />
            <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Content Management</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C9956A]" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top Header */}
      <header className="py-3 sm:h-16 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 flex-shrink-0 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Content Management</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handlePreview}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 hover:border-gray-300 text-[#1C1512] text-sm font-sans font-medium rounded-xl transition-colors cursor-pointer flex-1 sm:flex-none"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview Site</span>
            <span className="inline sm:hidden">Preview</span>
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex-1 sm:flex-none"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            <span className="hidden sm:inline">Publish Changes</span>
            <span className="inline sm:hidden">Publish</span>
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Hero Slider */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#C9956A]" />
                  <h2 className="font-serif text-base font-bold text-[#1C1512]">Hero Slider</h2>
                </div>
                <button
                  onClick={() => openSlideModal()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C9956A] hover:bg-[#A87A52] text-white text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Slide
                </button>
              </div>

              {/* Slides Container */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="p-4 bg-[#FAF7F2]/60 rounded-xl border border-gray-100 relative flex flex-col justify-between min-h-[140px] hover:border-gray-200 transition-all overflow-hidden"
                  >
                    {slide.image && (
                      <div className="absolute inset-0 z-0 opacity-10">
                        <img src={slide.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="relative z-10 space-y-1">
                      <p className="font-sans text-[10px] text-[#8C8682] font-semibold">Slide {slide.id}</p>
                      <p className="font-sans text-sm font-semibold text-[#1C1512] leading-snug line-clamp-2">
                        {slide.title}
                      </p>
                      {slide.subtitle && (
                        <p className="font-sans text-[11px] text-[#8C8682] line-clamp-1 leading-relaxed">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="relative z-10 flex items-center justify-between mt-2 pt-2 border-t border-gray-200/40">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                          slide.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {slide.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openSlideModal(slide)}
                          className="p-1 text-[#8C8682] hover:text-[#C9956A] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="p-1 text-[#8C8682] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#C9956A]" />
                  <h2 className="font-serif text-base font-bold text-[#1C1512]">About Section</h2>
                </div>
                <button
                  onClick={() => {
                    const newTitle = prompt("Enter About Section Title:", aboutTitle);
                    const newDesc = prompt("Enter About Section Description:", aboutDescription);
                    if (newTitle !== null) setAboutTitle(newTitle);
                    if (newDesc !== null) setAboutDescription(newDesc);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#C9956A]/20 hover:border-[#C9956A]/40 text-[#C9956A] text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>

              <div className="space-y-3 font-sans text-sm">
                <div>
                  <p className="text-[#8C8682] text-xs uppercase font-semibold tracking-wider">Section Title</p>
                  <p className="text-[#1C1512] font-semibold mt-1">{aboutTitle}</p>
                </div>
                <div>
                  <p className="text-[#8C8682] text-xs uppercase font-semibold tracking-wider">Description</p>
                  <p className="text-[#1C1512]/90 mt-1 leading-relaxed">{aboutDescription}</p>
                </div>
              </div>
            </div>

            {/* Featured Products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C9956A]" />
                  <h2 className="font-serif text-base font-bold text-[#1C1512]">Featured Products</h2>
                </div>
                <button
                  onClick={openFeaturedModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#C9956A]/20 hover:border-[#C9956A]/40 text-[#C9956A] text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Manage
                </button>
              </div>

              <p className="font-sans text-xs text-[#8C8682] -mt-1">
                These products appear in the &quot;Featured Products&quot; section on the home page. Remember to <span className="font-semibold">Publish Changes</span> to go live.
              </p>

              {/* Items List */}
              {featuredProducts.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl">
                  <p className="font-sans text-sm text-[#8C8682]">No featured products yet. Click <span className="font-semibold text-[#C9956A]">Manage</span> to choose some.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {featuredProducts.map((prod, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-[#FAF7F2]/50 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center rounded bg-[#C9956A]/10 text-[#C9956A] text-[10px] font-bold">{idx + 1}</span>
                        <span className="font-sans text-sm font-semibold text-[#1C1512]">{prod}</span>
                      </div>
                      <button
                        onClick={() => toggleFeatured(prod)}
                        className="p-1.5 text-[#8C8682] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove from featured"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4.5 h-4.5 text-[#C9956A]" />
                  <h2 className="font-serif text-base font-bold text-[#1C1512]">Contact Info</h2>
                </div>
                <button
                  onClick={() => {
                    const newPhone = prompt("Enter Phone:", contactInfo.phone);
                    const newEmail = prompt("Enter Email:", contactInfo.email);
                    const newWhatsapp = prompt("Enter WhatsApp:", contactInfo.whatsapp);
                    const newAddress = prompt("Enter Address:", contactInfo.address);
                    setContactInfo({
                      phone: newPhone !== null ? newPhone : contactInfo.phone,
                      email: newEmail !== null ? newEmail : contactInfo.email,
                      whatsapp: newWhatsapp !== null ? newWhatsapp : contactInfo.whatsapp,
                      address: newAddress !== null ? newAddress : contactInfo.address,
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#C9956A]/20 hover:border-[#C9956A]/40 text-[#C9956A] text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>

              <div className="space-y-3.5 font-sans text-sm">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#8C8682] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#8C8682] font-semibold uppercase tracking-wider">Phone</p>
                    <p className="text-[#1C1512] font-semibold mt-0.5">{contactInfo.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#8C8682] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#8C8682] font-semibold uppercase tracking-wider">Email</p>
                    <p className="text-[#1C1512] font-semibold mt-0.5 truncate max-w-[200px]">{contactInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#8C8682] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#8C8682] font-semibold uppercase tracking-wider">WhatsApp</p>
                    <p className="text-[#1C1512] font-semibold mt-0.5">{contactInfo.whatsapp}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#8C8682] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#8C8682] font-semibold uppercase tracking-wider">Address</p>
                    <p className="text-[#1C1512] font-semibold mt-0.5 leading-snug">{contactInfo.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Sections */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4.5 h-4.5 text-[#C9956A]" />
                  <h2 className="font-serif text-base font-bold text-[#1C1512]">FAQ Sections</h2>
                </div>
                <button
                  onClick={() => {
                    const newFaqTitle = prompt("Enter FAQ Section Name:");
                    if (newFaqTitle) {
                      setFaqSections((prev) => [
                        ...prev,
                        { id: Date.now(), title: newFaqTitle, questionsCount: 0 },
                      ]);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#C9956A] hover:bg-[#A87A52] text-white text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* FAQ Section List */}
              <div className="space-y-3">
                {faqSections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3.5 bg-[#FAF7F2]/40 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                  >
                    <div>
                      <p className="font-sans text-sm font-semibold text-[#1C1512]">{section.title}</p>
                      <p className="font-sans text-xs text-[#8C8682] mt-0.5">{section.questionsCount} questions</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 text-[#8C8682] hover:text-[#1C1512] hover:bg-white rounded-lg transition-colors cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this FAQ section?")) {
                            setFaqSections((prev) => prev.filter((s) => s.id !== section.id));
                          }
                        }}
                        className="p-1.5 text-[#8C8682] hover:text-red-500 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Slide Modal */}
      {showSlideModal && (
        <div className="fixed inset-0 bg-[#120E0D]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#1C1512]">
                {editingSlide ? "Edit Slide" : "Add Slide"}
              </h2>
              <button
                onClick={() => setShowSlideModal(false)}
                className="p-1 text-[#8C8682] hover:text-[#1C1512] rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                  Slide Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elevate Your Style"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                  Subtitle
                </label>
                <textarea
                  placeholder="e.g. Discover premium fashion that speaks to your unique style."
                  value={slideSubtitle}
                  onChange={(e) => setSlideSubtitle(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors resize-none"
                />
              </div>

              {/* Image */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                  Background Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Pasted image URL..."
                    value={slideImage}
                    onChange={(e) => setSlideImage(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
                  />
                  <label className={`flex items-center justify-center gap-1.5 px-4 bg-white border border-gray-200 hover:border-gray-300 text-xs font-semibold rounded-xl select-none ${uploadingSlideImage ? "opacity-60 cursor-wait" : "cursor-pointer"}`}>
                    {uploadingSlideImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    {uploadingSlideImage ? "Uploading" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlideImageUpload}
                      disabled={uploadingSlideImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {slideImage && (
                  <div className="mt-2 w-full h-24 bg-[#FAF7F2] border border-gray-200 rounded-xl overflow-hidden relative">
                    <img src={slideImage} alt="Slide Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSlideImage("")}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={slideStatus}
                  onChange={(e) => setSlideStatus(e.target.value as "Active" | "Draft")}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSlideModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-[#1C1512] text-sm font-semibold font-sans rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Featured Products Picker Modal */}
      {showFeaturedModal && (
        <div className="fixed inset-0 bg-[#120E0D]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-lg w-full flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1C1512]">Featured Products</h2>
                <p className="font-sans text-xs text-[#8C8682] mt-0.5">
                  {featuredProducts.length} selected
                </p>
              </div>
              <button
                onClick={() => setShowFeaturedModal(false)}
                className="p-1 text-[#8C8682] hover:text-[#1C1512] rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 pt-4 pb-3">
              <input
                type="text"
                placeholder="Search products..."
                value={featuredSearch}
                onChange={(e) => setFeaturedSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
              {catalogLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#C9956A]" />
                </div>
              ) : catalog.length === 0 ? (
                <p className="py-12 text-center font-sans text-sm text-[#8C8682]">No products found. Add products first.</p>
              ) : (
                catalog
                  .filter((p) =>
                    p.name.toLowerCase().includes(featuredSearch.toLowerCase()) ||
                    (p.category || "").toLowerCase().includes(featuredSearch.toLowerCase())
                  )
                  .map((p) => {
                    const active = featuredProducts.includes(p.name);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleFeatured(p.name)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          active
                            ? "border-[#C9956A] bg-[#C9956A]/5"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="w-11 h-11 rounded-lg bg-[#FAF7F2] border border-gray-100 overflow-hidden flex-shrink-0">
                          {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-semibold text-[#1C1512] truncate">{p.name}</p>
                          <p className="font-sans text-xs text-[#8C8682]">{p.category} · ₦{Number(p.price).toLocaleString()}</p>
                        </div>
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                            active ? "bg-[#C9956A] border-[#C9956A]" : "border-gray-300"
                          }`}
                        >
                          {active && <CheckCircle className="w-4 h-4 text-white" />}
                        </span>
                      </button>
                    );
                  })
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-6 pt-4 border-t border-gray-100">
              <p className="font-sans text-xs text-[#8C8682]">Don&apos;t forget to Publish Changes.</p>
              <button
                onClick={() => setShowFeaturedModal(false)}
                className="px-5 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
