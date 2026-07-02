"use client";

import React, { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { Check, Info, Upload, ArrowRight, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read search parameters with fallbacks
  const amountParam = searchParams.get("amount") || "0";
  const refParam = searchParams.get("ref") || "DV-20260623-0042";

  // Format amount to Naira currency
  const formattedAmount = isNaN(Number(amountParam))
    ? amountParam
    : "₦" + Number(amountParam).toLocaleString();

  // Dynamic current date formatting (e.g., June 23, 2026)
  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Fire confetti on load
  React.useEffect(() => {
    import("canvas-confetti").then((module) => {
      const confetti = module.default;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.3 },
        colors: ["#B78A62", "#1C1512", "#FAF7F2", "#8C8682"],
      });
    });
  }, []);

  return (
    <div className="flex-grow flex flex-col pt-[80px] bg-[#FAF7F2] min-h-screen items-center justify-center select-none px-4 sm:px-6">
      <div className="max-w-xl w-full text-center space-y-6 py-10">
        
        {/* Success Icon */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="p-4 bg-green-50 rounded-full text-green-600 border border-green-100 shadow-sm"
          >
            <Check className="h-12 w-12" />
          </motion.div>
        </div>

        {/* Text Header */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1512] tracking-wide">
            Order Placed Successfully!
          </h1>
          <p className="font-sans text-sm text-[#8C8682] max-w-md mx-auto">
            Thank you for shopping with DORCY VOGUE
          </p>
        </div>

        {/* Order Details Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-[#1C1512]/5 rounded-2xl p-6 sm:p-8 shadow-sm text-left space-y-4 font-sans text-sm"
        >
          <div className="flex justify-between items-center py-2.5 border-b border-[#1C1512]/5">
            <span className="text-[#8C8682] font-semibold text-xs uppercase tracking-wider">Order Number</span>
            <span className="font-bold text-[#1C1512]">{refParam}</span>
          </div>

          <div className="flex justify-between items-center py-2.5 border-b border-[#1C1512]/5">
            <span className="text-[#8C8682] font-semibold text-xs uppercase tracking-wider">Date</span>
            <span className="font-bold text-[#1C1512]">{formattedDate}</span>
          </div>

          <div className="flex justify-between items-center py-2.5 border-b border-[#1C1512]/5">
            <span className="text-[#8C8682] font-semibold text-xs uppercase tracking-wider">Total Amount</span>
            <span className="font-extrabold text-[#B78A62] text-base">{formattedAmount}</span>
          </div>

          <div className="flex justify-between items-center py-2.5 last:border-b-0">
            <span className="text-[#8C8682] font-semibold text-xs uppercase tracking-wider">Payment Status</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100/50">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Awaiting Payment
            </span>
          </div>
        </motion.div>

        {/* What's Next Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-sky-50/40 border border-sky-100/50 rounded-2xl p-6 text-left flex items-start space-x-4 shadow-sm"
        >
          <div className="p-2 bg-white rounded-xl text-sky-600 shadow-sm border border-sky-100/30 shrink-0">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-2.5 font-sans">
            <h4 className="font-bold text-[#1C1512] text-sm">What's Next?</h4>
            <ol className="list-decimal pl-4 text-xs text-[#8C8682] space-y-1.5 leading-relaxed font-semibold">
              <li>Transfer {formattedAmount} to the bank account on the payment page</li>
              <li>Upload your payment receipt</li>
              <li>We'll verify and process your order within 24 hours</li>
            </ol>
          </div>
        </motion.div>

        {/* Action Controls - Side-by-side grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl mx-auto pt-2 w-full"
        >
          {/* Upload Receipt */}
          <button
            onClick={() => {
              router.push(`/checkout/upload?ref=${refParam}&amount=${amountParam}`);
            }}
            className="w-full py-4 bg-[#B78A62] hover:bg-[#9E734D] text-white font-sans text-sm font-semibold rounded-xl shadow hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Upload className="h-4.5 w-4.5" />
            <span>Upload Receipt</span>
          </button>

          {/* Continue Shopping Button */}
          <Link
            href="/shop"
            className="w-full py-3.5 bg-white border border-[#1C1512]/10 hover:border-[#1C1512]/30 text-[#1C1512] font-sans text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md cursor-pointer text-center"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col pt-[80px] bg-[#FAF7F2] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B78A62]" />
        </div>
      }
    >
      <Navbar />
      <SuccessPageContent />
      <CartDrawer onCheckout={() => {}} />
    </Suspense>
  );
}
