"use client";

import React, { useState, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { Truck, CreditCard, RotateCcw, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQGroup {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ_GROUPS: FAQGroup[] = [
  {
    title: "Delivery Questions",
    icon: <Truck className="h-5 w-5 text-[#B78A62]" />,
    items: [
      {
        id: "del-1",
        question: "How long does delivery take?",
        answer: "Delivery takes 2-5 business days within Lagos and 5-10 business days for other states. You will receive tracking information once your order is shipped.",
      },
      {
        id: "del-2",
        question: "Do you deliver nationwide?",
        answer: "Yes, we ship to all 36 states across Nigeria. Delivery charges and delivery timelines vary depending on your specific state and region.",
      },
      {
        id: "del-3",
        question: "Can I track my delivery?",
        answer: "Yes, you can track your package directly on our 'Track Order' page by entering your order reference number and associated phone number.",
      },
    ],
  },
  {
    title: "Payment Information",
    icon: <CreditCard className="h-5 w-5 text-[#B78A62]" />,
    items: [
      {
        id: "pay-1",
        question: "What payment methods do you accept?",
        answer: "We accept bank transfers to our Access Bank account. After placing your order, bank details will be displayed for you to make payment.",
      },
      {
        id: "pay-2",
        question: "How do I upload my payment receipt?",
        answer: "After transferring funds, click on 'Upload Payment Receipt' on the checkout success screen to drag/drop or select your screenshot/file receipt.",
      },
      {
        id: "pay-3",
        question: "How long does payment verification take?",
        answer: "Verification is typically reviewed within 1-2 hours of uploading your receipt, and you will receive status changes on the Track Order dashboard.",
      },
    ],
  },
  {
    title: "Return Policy",
    icon: <RotateCcw className="h-5 w-5 text-[#B78A62]" />,
    items: [
      {
        id: "ret-1",
        question: "Can I return an item?",
        answer: "Items can be returned within 7 days of delivery if unused and in original packaging. Contact us via WhatsApp to initiate a return.",
      },
      {
        id: "ret-2",
        question: "How do I get a refund?",
        answer: "Once your returned package is received and inspected by our team, refunds are processed to your bank account within 3-5 working days.",
      },
    ],
  },
];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-[#1C1512]/5 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
      {/* Accordion Trigger Header */}
      <button
        onClick={onToggle}
        className="w-full py-4.5 px-5 flex items-center justify-between text-left font-sans text-sm sm:text-base font-bold text-[#1C1512] hover:text-[#B78A62] transition-colors cursor-pointer select-none"
      >
        <span>{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#8C8682]"
        >
          <ChevronDown className="h-4.5 w-4.5" />
        </motion.div>
      </button>

      {/* Accordion Collapsible Panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 pt-1.5 font-sans text-xs sm:text-sm text-[#8C8682] leading-relaxed border-t border-[#1C1512]/5 bg-[#FAF7F2]/10 font-semibold">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQPageContent() {
  // Store multiple open accordion item states (default open first item of each group)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "del-1": true,
    "pay-1": true,
    "ret-1": true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="flex-grow flex flex-col pt-[80px] bg-[#FAF7F2] min-h-screen">
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-10">
        
        {/* Title Details */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1512] tracking-wide">
            Frequently Asked Questions
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#8C8682] max-w-md mx-auto">
            Find answers to common questions about orders, payments, and delivery
          </p>
        </div>

        {/* FAQ Category Listing */}
        <div className="space-y-10">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title} className="space-y-4">
              {/* Category Group Header Banner */}
              <div className="bg-[#FAF7F2] border border-[#1C1512]/10 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-[#1C1512]/5">
                  {group.icon}
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1512]">
                  {group.title}
                </h3>
              </div>

              {/* Accordion rows */}
              <div className="space-y-3 pl-0 sm:pl-2">
                {group.items.map((item) => (
                  <FAQAccordion
                    key={item.id}
                    item={item}
                    isOpen={!!openItems[item.id]}
                    onToggle={() => toggleItem(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>

      <CartDrawer onCheckout={() => {}} />
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col pt-[80px] bg-[#FAF7F2] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B78A62]" />
        </div>
      }
    >
      <Navbar />
      <FAQPageContent />
      <CartDrawer onCheckout={() => {}} />
    </Suspense>
  );
}
