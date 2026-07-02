"use client";

import React, { useState, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderTrackingData {
  orderRef: string;
  date: string;
  itemsCount: string;
  totalAmount: string;
  paymentStatus: string;
  statusText: string;
  activeStep: number; // 1 to 6
}

// Pre-defined mock database
const MOCK_ORDERS: Record<string, OrderTrackingData> = {
  "DV-000153": {
    orderRef: "DV-000153",
    date: "Jun 18, 2026",
    itemsCount: "3 products",
    totalAmount: "₦57,000",
    paymentStatus: "Confirmed",
    statusText: "Preparing",
    activeStep: 4,
  },
  "DV-000124": {
    orderRef: "DV-000124",
    date: "Jun 23, 2026",
    itemsCount: "2 products",
    totalAmount: "₦225,000",
    paymentStatus: "Confirmed",
    statusText: "Preparing",
    activeStep: 3,
  },
  "DV-20260623-0042": {
    orderRef: "DV-20260623-0042",
    date: "Jun 23, 2026",
    itemsCount: "2 products",
    totalAmount: "₦83,000",
    paymentStatus: "Awaiting Verification",
    statusText: "Awaiting Verification",
    activeStep: 2,
  },
};

const STEPS = [
  "Pending Payment",
  "Awaiting Verification",
  "Payment Confirmed",
  "Preparing Order",
  "Shipped",
  "Delivered",
];

function TrackPageContent() {
  const searchParams = useSearchParams();

  // Read search parameters with fallbacks
  const urlRef = searchParams.get("ref") || "";
  const [orderNumber, setOrderNumber] = useState(urlRef);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<OrderTrackingData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-search if ref is present in URL
  React.useEffect(() => {
    if (urlRef) {
      handleSearch(urlRef);
    }
  }, [urlRef]);

  const handleSearch = (refToFind?: string) => {
    const ref = refToFind || orderNumber;
    if (!ref) return;

    setIsLoading(true);
    setHasSearched(true);

    setTimeout(() => {
      setIsLoading(false);
      const uppercaseRef = ref.trim().toUpperCase();
      
      if (MOCK_ORDERS[uppercaseRef]) {
        setTrackedOrder(MOCK_ORDERS[uppercaseRef]);
      } else if (uppercaseRef.startsWith("DV-")) {
        // Dynamically generate details for any other DV- formats
        setTrackedOrder({
          orderRef: uppercaseRef,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          itemsCount: "1 product",
          totalAmount: searchParams.get("amount") ? "₦" + Number(searchParams.get("amount")).toLocaleString() : "₦83,000",
          paymentStatus: "Confirmed",
          statusText: "Preparing",
          activeStep: 4,
        });
      } else {
        setTrackedOrder(null);
      }
    }, 800);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="flex-grow flex flex-col pt-[80px] bg-[#FAF7F2] min-h-screen">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-10">
        
        {/* Title details */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1512] tracking-wide">
            Track Your Order
          </h1>
          <p className="font-sans text-sm text-[#8C8682] max-w-md mx-auto">
            Enter your order number and phone number to check your delivery status
          </p>
        </div>

        {/* Search Toolbar */}
        <form onSubmit={handleFormSubmit} className="bg-white border border-[#1C1512]/5 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            {/* Order Number */}
            <div className="sm:col-span-5 space-y-1.5 text-left">
              <label className="font-sans text-[10px] font-bold text-[#1C1512] uppercase tracking-wider">
                Order Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DV-000153"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans"
              />
            </div>

            {/* Phone Number */}
            <div className="sm:col-span-5 space-y-1.5 text-left">
              <label className="font-sans text-[10px] font-bold text-[#1C1512] uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 08012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#B78A62] hover:bg-[#9E734D] text-white font-sans text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer text-center flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  "Track"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Tracking Details Results */}
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#B78A62] mx-auto" />
            </div>
          ) : hasSearched && !trackedOrder ? (
            <div className="bg-white border border-[#1C1512]/5 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto space-y-3">
              <p className="font-sans text-base text-[#1C1512]/80">
                Order not found. Please double check your order reference.
              </p>
              <p className="font-sans text-xs text-[#8C8682]">
                Order references must match the format <span className="font-bold">DV-xxxxxx</span>.
              </p>
            </div>
          ) : trackedOrder ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Timeline Progress (8 cols on desktop) */}
              <div className="lg:col-span-8 bg-white border border-[#1C1512]/5 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 overflow-x-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1C1512]/5 pb-5 gap-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-serif text-lg font-bold text-[#1C1512]">
                      Order {trackedOrder.orderRef}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                      {trackedOrder.statusText}
                    </span>
                  </div>
                  <span className="font-sans text-xs text-[#8C8682]">
                    Placed: {trackedOrder.date}
                  </span>
                </div>

                {/* Horizontal Status Timeline */}
                <div className="relative py-6 min-w-[640px]">
                  {/* Progress Line */}
                  <div className="absolute top-[38px] left-[5%] right-[5%] h-1 bg-[#1C1512]/5 z-0" />
                  
                  {/* Active segment line coloring */}
                  <div
                    className="absolute top-[38px] left-[5%] h-1 bg-[#B78A62] z-0 transition-all duration-700 ease-out"
                    style={{
                      width: `${((Math.max(1, trackedOrder.activeStep - 1)) / (STEPS.length - 1)) * 90}%`,
                    }}
                  />

                  {/* Nodes */}
                  <div className="relative z-10 flex justify-between">
                    {STEPS.map((step, idx) => {
                      const stepNum = idx + 1;
                      const isCompleted = stepNum < trackedOrder.activeStep;
                      const isActive = stepNum === trackedOrder.activeStep;
                      
                      return (
                        <div key={step} className="flex flex-col items-center space-y-3 w-[15%] text-center">
                          {/* Circle Node */}
                          <div
                            className={`w-7.5 h-7.5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              isCompleted
                                ? "bg-[#B78A62] border-[#B78A62] text-white"
                                : isActive
                                ? "bg-white border-[#B78A62] text-[#B78A62]"
                                : "bg-white border-[#1C1512]/10 text-[#8C8682]"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="h-4.5 w-4.5" />
                            ) : isActive ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#B78A62] animate-pulse" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                            )}
                          </div>

                          {/* Node label */}
                          <span
                            className={`font-sans text-[11px] font-semibold leading-tight ${
                              isActive ? "text-[#B78A62] font-bold" : isCompleted ? "text-[#1C1512]" : "text-[#8C8682]"
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Summary Card (4 cols on desktop) */}
              <div className="lg:col-span-4 bg-white border border-[#1C1512]/5 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold text-[#1C1512] tracking-wide">
                  Order Details
                </h3>

                <div className="divide-y divide-[#1C1512]/5 font-sans text-sm">
                  <div className="flex justify-between py-3.5 first:pt-0">
                    <span className="text-[#8C8682] text-xs font-semibold uppercase tracking-wider">Items</span>
                    <span className="font-bold text-[#1C1512]">{trackedOrder.itemsCount}</span>
                  </div>

                  <div className="flex justify-between py-3.5">
                    <span className="text-[#8C8682] text-xs font-semibold uppercase tracking-wider">Total</span>
                    <span className="font-extrabold text-[#B78A62] text-base">{trackedOrder.totalAmount}</span>
                  </div>

                  <div className="flex justify-between py-3.5">
                    <span className="text-[#8C8682] text-xs font-semibold uppercase tracking-wider">Payment</span>
                    <span className="font-bold text-[#1C1512]">{trackedOrder.paymentStatus}</span>
                  </div>

                  <div className="flex justify-between py-3.5 last:pb-0">
                    <span className="text-[#8C8682] text-xs font-semibold uppercase tracking-wider">Status</span>
                    <span className="font-bold text-[#1C1512]">{trackedOrder.statusText}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white/40 border border-[#1C1512]/5 rounded-2xl p-16 text-center shadow-sm max-w-xl mx-auto space-y-3">
              <div className="p-3 bg-white w-fit rounded-full shadow-sm border border-[#1C1512]/5 mx-auto text-[#B78A62]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="font-sans text-sm text-[#8C8682]">
                Enter your order credentials in the search fields above to track your package delivery.
              </p>
            </div>
          )}
        </div>

      </main>

      <CartDrawer onCheckout={() => {}} />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col pt-[80px] bg-[#FAF7F2] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B78A62]" />
        </div>
      }
    >
      <Navbar />
      <TrackPageContent />
      <CartDrawer onCheckout={() => {}} />
    </Suspense>
  );
}
