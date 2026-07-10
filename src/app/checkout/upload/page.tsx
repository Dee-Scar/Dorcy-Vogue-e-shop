"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { useSearchParams, useRouter } from "next/navigation";
import { Upload, X, Clock, FileText, ArrowRight, Loader2, Copy, Check } from "lucide-react";
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

function UploadPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read search parameters with fallbacks
  const refParam = searchParams.get("ref") || "DV-000124";
  const amountParam = searchParams.get("amount") || "0";

  // Format amount to Naira
  const formattedAmount = isNaN(Number(amountParam))
    ? amountParam
    : "₦" + Number(amountParam).toLocaleString();

  // File states
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Clipboard copy states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Upload/Submission states
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Bank details state loaded from Supabase
  const [bankDetails, setBankDetails] = useState({
    bankName: "Access Bank",
    accountName: "DORCY VOGUE",
    accountNumber: "0123456789",
  });

  useEffect(() => {
    const loadBankSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("cms_settings")
          .select("store_settings")
          .eq("id", 1)
          .single();
        if (data?.store_settings) {
          setBankDetails({
            bankName: data.store_settings.bankName || "Access Bank",
            accountName: data.store_settings.accountName || "DORCY VOGUE",
            accountNumber: data.store_settings.accountNumber || "0123456789",
          });
        }
      } catch (err) {
        console.warn("Failed to load bank settings", err);
      }
    };
    loadBankSettings();
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Validate file size (5MB) and type
      if (droppedFile.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const triggerFileBrowser = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus("submitting");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", refParam);

      const res = await fetch("/api/upload-receipt", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload receipt.");
      }

      setStatus("success");
    } catch (err: any) {
      alert("Error uploading receipt: " + (err.message || err));
      setStatus("idle");
    }
  };

  return (
    <div className="flex-grow flex flex-col pt-[80px] bg-[#FAF7F2] min-h-screen items-center justify-center px-4 sm:px-6 select-none relative">
      
      {/* File input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,application/pdf"
        className="hidden"
      />

      <div className="max-w-xl w-full text-center space-y-6 py-10">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1512] tracking-wide">
            Upload Payment Receipt
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#8C8682] max-w-md mx-auto">
            Upload a screenshot or photo of your payment receipt for order {refParam}
          </p>
        </div>

        {/* Capsule tag details */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-full font-sans text-xs font-semibold text-[#1c1512] shadow-sm">
          <svg className="h-3.5 w-3.5 text-[#B78A62]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Order: {refParam}</span>
          <span className="text-[#1C1512]/30">•</span>
          <span>Amount: <span className="font-bold text-[#B78A62]">{formattedAmount}</span></span>
        </div>

        {/* Bank Transfer Details Card (Direct Copy Features inside Uploader) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#1C1512]/5 rounded-2xl overflow-hidden shadow-sm text-left"
        >
          {/* Header Banner */}
          <div className="bg-[#B59073] py-3.5 text-center">
            <h3 className="font-sans text-xs font-bold text-white uppercase tracking-widest">
              Bank Transfer Details
            </h3>
          </div>

          {/* Details Body */}
          <div className="p-5 divide-y divide-[#1C1512]/5 font-sans text-xs sm:text-sm">
            {[
              { label: "Bank Name", value: bankDetails.bankName, key: "bank" },
              { label: "Account Name", value: bankDetails.accountName, key: "name" },
              { label: "Account Number", value: bankDetails.accountNumber, key: "account" },
              { label: "Amount to Pay", value: formattedAmount, textValue: amountParam, key: "amount" },
              { label: "Order Number", value: refParam, key: "ref" },
            ].map((row) => (
              <div key={row.key} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                <span className="text-[#8C8682] text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                  {row.label}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold text-[#1C1512] ${row.key === "amount" ? "text-[#B78A62] text-sm sm:text-base" : ""}`}>
                    {row.value}
                  </span>
                  
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(row.textValue || row.value, row.key)}
                    className="p-1 hover:bg-[#FAF7F2] rounded text-[#8C8682] hover:text-[#B78A62] transition-colors cursor-pointer relative group"
                    title={`Copy ${row.label}`}
                  >
                    {copiedField === row.key ? (
                      <Check className="h-3.5 w-3.5 text-green-600 animate-bounce" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {/* Tooltip */}
                    <AnimatePresence>
                      {copiedField === row.key && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute bottom-full mb-1.5 left-1/2 transform -translate-x-1/2 px-2 py-0.5 bg-[#1c1512] text-white text-[10px] font-bold rounded shadow pointer-events-none whitespace-nowrap z-30"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Drag and Drop Card */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileBrowser}
            className={`bg-white rounded-2xl border-2 border-dashed overflow-hidden shadow-sm transition-all duration-300 relative cursor-pointer p-6 sm:p-10 min-h-[220px] flex flex-col items-center justify-center space-y-4 ${
              isDragActive
                ? "border-[#B78A62] bg-[#FAF7F2]/40"
                : file
                ? "border-green-300 bg-green-50/10"
                : "border-[#1C1512]/10 hover:border-[#B78A62]/50 hover:bg-[#FAF7F2]/20"
            }`}
          >
            {/* Visual Icons & Prompts */}
            {!file ? (
              <>
                <div className="p-3 bg-[#FAF7F2] rounded-full text-[#B78A62] border border-[#1C1512]/5 shadow-sm">
                  <Upload className="h-5.5 w-5.5" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans text-sm font-bold text-[#1C1512]">
                    Drag & drop your receipt here
                  </p>
                  <p className="font-sans text-xs text-[#8C8682]">or</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileBrowser();
                  }}
                  className="px-4 py-2 bg-white border border-[#B78A62] text-[#B78A62] hover:bg-[#B78A62] hover:text-white font-sans text-xs font-semibold rounded-lg shadow-sm transition-all duration-300 cursor-pointer"
                >
                  Browse Files
                </button>
              </>
            ) : (
              <>
                <div className="p-4 bg-green-50 rounded-full text-green-600 border border-green-100 shadow-sm relative">
                  <FileText className="h-7 w-7" />
                  <button
                    onClick={removeFile}
                    className="absolute -top-1 -right-1 p-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1 max-w-[80%]">
                  <p className="font-sans text-xs sm:text-sm font-bold text-[#1C1512] truncate">
                    {file.name}
                  </p>
                  <p className="font-sans text-[11px] text-[#8C8682]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </>
            )}

            {/* Bottom Format Banner strip */}
            <div className="absolute bottom-0 left-0 w-full py-2 bg-[#FAF7F2] border-t border-[#1C1512]/5 text-center font-sans text-[10px] text-[#8C8682] font-semibold tracking-wide">
              Supported: JPG, PNG, PDF  •  Max size: 5MB
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || status === "submitting"}
            className={`w-full py-4 font-sans text-sm font-semibold rounded-xl shadow transition-all duration-300 flex items-center justify-center space-x-2 ${
              file && status !== "submitting"
                ? "bg-[#B78A62] hover:bg-[#9E734D] text-white hover:shadow-lg cursor-pointer"
                : "bg-[#1C1512]/5 text-[#8C8682] cursor-not-allowed"
            }`}
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                <span>Submitting Receipt...</span>
              </>
            ) : (
              <>
                <Upload className="h-4.5 w-4.5" />
                <span>Submit Receipt</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Confirmation Modal Overlay */}
      <AnimatePresence>
        {status === "success" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
            />
            {/* Success Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-2xl relative z-10 border border-[#1C1512]/5"
            >
              <div className="flex justify-center">
                <div className="p-3.5 bg-amber-50 rounded-full text-amber-600 border border-amber-100 shadow-sm">
                  <Clock className="h-12 w-12" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-[#1C1512]">
                  Receipt Received — Awaiting Confirmation
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#8C8682] leading-relaxed">
                  Thank you. Your payment is <span className="font-semibold text-[#1C1512]">not confirmed yet</span> — our team will verify your receipt and mark your order as <span className="font-semibold text-[#1C1512]">Payment Confirmed</span>. You can follow the status any time under Track My Order.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => {
                    router.push(`/track?ref=${refParam}`);
                  }}
                  className="w-full py-3 bg-[#B78A62] hover:bg-[#9E734D] text-white font-sans text-xs sm:text-sm font-semibold rounded-xl shadow transition-all duration-300 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Track My Order</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => {
                    router.push("/");
                  }}
                  className="w-full py-3 bg-white border border-[#1C1512]/10 hover:border-[#1C1512]/30 text-[#1C1512] font-sans text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UploadReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col pt-[80px] bg-[#FAF7F2] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B78A62]" />
        </div>
      }
    >
      <Navbar />
      <UploadPageContent />
      <CartDrawer onCheckout={() => {}} />
    </Suspense>
  );
}
