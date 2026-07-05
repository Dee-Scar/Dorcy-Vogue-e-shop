"use client";

import React, { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileMenuButton from "@/components/admin/MobileMenuButton";
import { Edit2, Eye, Globe, Plus, Trash2, GripVertical, CheckCircle, HelpCircle, Phone, Mail, MapPin, Sparkles, Sliders } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  status: "Active" | "Draft";
}

interface FAQSection {
  id: number;
  title: string;
  questionsCount: number;
}

export default function CMSPage() {
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, title: "New Summer Collection — Up to 40% Off", status: "Active" },
    { id: 2, title: "Free Delivery on Orders Over ₦50,000", status: "Active" },
    { id: 3, title: "Baggy Jeans — Trending Now", status: "Draft" },
  ]);

  const [aboutTitle, setAboutTitle] = useState("About DORCY VOGUE");
  const [aboutDescription, setAboutDescription] = useState(
    "DORCY VOGUE is a premium fashion brand offering stylish, affordable clothing for the modern Nigerian woman. From casual wears to statement pieces, we deliver quality fashion to your doorstep."
  );

  const [featuredProducts, setFeaturedProducts] = useState([
    "Baggy Jeans — Washed Blue",
    "Floral Summer Dress",
    "Classic White Top",
    "Leather Crossbody Bag",
    "Jogger Pants — Olive",
  ]);

  const [contactInfo, setContactInfo] = useState({
    phone: "08012345678",
    email: "hello@dorcyvogue.com",
    whatsapp: "+234 801 234 5678",
    address: "12 Lekki Phase 1, Lagos",
  });

  const [faqSections, setFaqSections] = useState<FAQSection[]>([
    { id: 1, title: "Delivery Questions", questionsCount: 4 },
    { id: 2, title: "Return Policy", questionsCount: 3 },
    { id: 3, title: "Payment Information", questionsCount: 5 },
    { id: 4, title: "Sizing Guide", questionsCount: 2 },
  ]);

  const handlePublish = () => {
    alert("Publishing all content updates live to Dorcy Vogue storefront...");
  };

  const handlePreview = () => {
    window.open("/", "_blank");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top Header */}
      <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <h1 className="font-sans text-lg sm:text-xl font-semibold text-[#1C1512]">Content Management</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-gray-300 text-[#1C1512] text-sm font-sans font-medium rounded-xl transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            Preview Site
          </button>
          <button
            onClick={handlePublish}
            className="flex items-center gap-2 px-5 py-2 bg-[#C9956A] hover:bg-[#A87A52] text-white text-sm font-semibold font-sans rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Globe className="h-4 w-4" />
            Publish Changes
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
                  onClick={() => alert("Edit Hero Slider settings coming soon!")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#C9956A]/20 hover:border-[#C9956A]/40 text-[#C9956A] text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>

              {/* Slides Container */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="p-4 bg-[#FAF7F2]/60 rounded-xl border border-gray-100 relative flex flex-col justify-between h-32 hover:border-gray-200 transition-all"
                  >
                    <div>
                      <p className="font-sans text-xs text-[#8C8682] font-semibold">Slide {slide.id}</p>
                      <p className="font-sans text-sm font-semibold text-[#1C1512] mt-1.5 leading-snug line-clamp-2">
                        {slide.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/40">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                          slide.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {slide.status}
                      </span>
                      <button className="text-[#8C8682] hover:text-[#1C1512] cursor-grab">
                        <GripVertical className="w-4 h-4" />
                      </button>
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
                  onClick={() => alert("Manage featured products catalog coming soon!")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#C9956A]/20 hover:border-[#C9956A]/40 text-[#C9956A] text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Manage
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {featuredProducts.map((prod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-[#FAF7F2]/50 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-[#8C8682] cursor-grab" />
                      <span className="font-sans text-sm font-semibold text-[#1C1512]">{prod}</span>
                    </div>
                  </div>
                ))}
              </div>
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
                      phone: newPhone || contactInfo.phone,
                      email: newEmail || contactInfo.email,
                      whatsapp: newWhatsapp || contactInfo.whatsapp,
                      address: newAddress || contactInfo.address,
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
    </div>
  );
}
